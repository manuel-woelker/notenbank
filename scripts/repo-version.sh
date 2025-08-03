#!/usr/bin/env bash

set -euo pipefail

TAG=$(git describe --dirty=dev --abbrev=0)
COMMIT_COUNT=$(git rev-list "$TAG..HEAD" --count)
DATE=$(git log --date=short -1 --format="%cd")

echo "$TAG.$COMMIT_COUNT-$DATE-$(git rev-parse --short HEAD)"