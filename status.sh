#!/bin/bash
echo "=== Ki?m tra tr?ng th?i c?ng d?ch v? (Port Status) ==="
ss -tulpn 2>/dev/null | grep -E '5432|8080|5173|8000'
