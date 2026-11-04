#!/usr/bin/env bash
set -e
D=afrodite/2026-11-04-videos-k1k3/src
mkdir -p "$D"
curl -fsSL "https://n3w-meta.othon-rdss.workers.dev/m/afrodite/criativos/K1/k1_original.jpg" -o "$D/k1_original.jpg"
curl -fsSL "https://n3w-meta.othon-rdss.workers.dev/m/afrodite/criativos/K3/k3_original.jpg" -o "$D/k3_original.jpg"
ls -la "$D"
