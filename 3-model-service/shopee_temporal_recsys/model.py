import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence
from typing import Dict, Any, List

class BaseTemporalCompressor(nn.Module):
    def __init__(self, in_features: int = 6, out_dim: int = 64):
        super().__init__()
        self.in_features = in_features
        self.out_dim = out_dim

    def forward(self, batch_dynamic: Dict[str, torch.Tensor]) -> torch.Tensor:
        raise NotImplementedError

class NoTemporalCompressor(BaseTemporalCompressor):
    def forward(self, batch_dynamic: Dict[str, torch.Tensor]) -> torch.Tensor:
        hist_dense = batch_dynamic["hist_dense"]
        return torch.zeros(hist_dense.shape[0], self.out_dim, device=hist_dense.device)

class LatestSnapshotCompressor(BaseTemporalCompressor):
    def __init__(self, in_features: int = 6, out_dim: int = 64):
        super().__init__(in_features, out_dim)
        self.proj = nn.Sequential(
            nn.Linear(in_features, out_dim),
            nn.ReLU(),
            nn.LayerNorm(out_dim)
        )
    def forward(self, batch_dynamic: Dict[str, torch.Tensor]) -> torch.Tensor:
        hist_dense = batch_dynamic["hist_dense"]
        seq_lens = batch_dynamic["seq_lens"]
        idx = (seq_lens - 1).clamp(min=0).view(-1, 1, 1).expand(-1, 1, self.in_features)
        latest = torch.gather(hist_dense, dim=1, index=idx).squeeze(1)
        return self.proj(latest)

class GRUSequenceCompressor(BaseTemporalCompressor):
    def __init__(self, in_features: int = 6, out_dim: int = 64, hidden_dim: int = 64, num_layers: int = 1):
        super().__init__(in_features, out_dim)
        self.gru = nn.GRU(
            input_size=in_features,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True
        )
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, out_dim),
            nn.ReLU(),
            nn.LayerNorm(out_dim)
        )
    def forward(self, batch_dynamic: Dict[str, torch.Tensor]) -> torch.Tensor:
        hist_dense = batch_dynamic["hist_dense"]
        seq_lens = batch_dynamic["seq_lens"]
        lengths_cpu = seq_lens.clamp(min=1).cpu()
        packed = pack_padded_sequence(hist_dense, lengths_cpu, batch_first=True, enforce_sorted=False)
        _, h_n = self.gru(packed)
        last_hidden = h_n[-1]
        return self.head(last_hidden)

class MultiStreamFusionRecSysModel(nn.Module):
    def __init__(
        self,
        num_users: int = 10001,
        num_personas: int = 5,
        num_categories: int = 4,
        num_brands: int = 1000,
        num_sellers: int = 1000,
        compressor_name: str = "M4_GRU",
        user_dim: int = 64,
        persona_dim: int = 32,
        static_dim: int = 64,
        dynamic_dim: int = 64,
        compressed_dim: int = 64,
        dropout: float = 0.2
    ):
        super().__init__()
        self.compressor_name = compressor_name

        self.user_embed = nn.Embedding(num_users, user_dim)
        self.persona_embed = nn.Embedding(num_personas, persona_dim)
        self.cat_pref_proj = nn.Linear(num_categories, 32)
        total_user_dim = user_dim + persona_dim + 32

        self.item_cat_embed = nn.Embedding(num_categories + 1, 16)
        self.brand_embed = nn.Embedding(num_brands + 1, 16)
        self.seller_embed = nn.Embedding(num_sellers + 1, 16)
        self.orig_price_proj = nn.Linear(1, 16)
        total_static_dim = 16 * 4

        if compressor_name == "M4_GRU":
            self.temporal_compressor = GRUSequenceCompressor(in_features=6, out_dim=dynamic_dim)
        elif compressor_name == "B2_Latest":
            self.temporal_compressor = LatestSnapshotCompressor(in_features=6, out_dim=dynamic_dim)
        else:
            self.temporal_compressor = NoTemporalCompressor(in_features=6, out_dim=dynamic_dim)

        fusion_dim = total_user_dim + total_static_dim + dynamic_dim
        self.bottleneck = nn.Sequential(
            nn.Linear(fusion_dim, compressed_dim),
            nn.BatchNorm1d(compressed_dim),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        self.classifier = nn.Sequential(
            nn.Linear(compressed_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, batch_user, batch_static, batch_dynamic):
        u_emb = self.user_embed(batch_user["user_id"])
        p_emb = self.persona_embed(batch_user["persona_id"])
        c_proj = self.cat_pref_proj(batch_user["category_pref"])
        v_user = torch.cat([u_emb, p_emb, c_proj], dim=-1)

        cat_emb = self.item_cat_embed(batch_static["category_id"])
        br_emb = self.brand_embed(batch_static["brand_id"])
        sel_emb = self.seller_embed(batch_static["seller_id"])
        pr_emb = self.orig_price_proj(batch_static["original_price_norm"])
        v_static = torch.cat([cat_emb, br_emb, sel_emb, pr_emb], dim=-1)

        v_dynamic = self.temporal_compressor(batch_dynamic)

        v_fused = torch.cat([v_user, v_static, v_dynamic], dim=-1)
        v_bottle = self.bottleneck(v_fused)
        logits = self.classifier(v_bottle).squeeze(-1)
        return logits
