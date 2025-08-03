#!/usr/bin/env bash

set -euo pipefail

VITE_REPO_VERSION=$(scripts/repo-version.sh)
export VITE_REPO_VERSION


echo "Building UI for $VITE_REPO_VERSION"
cd ui
pnpm run build
