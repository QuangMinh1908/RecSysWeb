#!/bin/bash
pkill -f "uvicorn shopee_temporal_recsys" && echo "Model service stopped" || echo "No process found"