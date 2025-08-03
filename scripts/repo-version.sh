#!/usr/bin/env bash

set -euo pipefail

TAG=$(git describe --abbrev=0)
COMMIT_COUNT=$(git rev-list "$TAG..HEAD" --count)
DATE=$(git log --date=short -1 --format="%cd")
COMMIT_HASH=$(git rev-parse --short HEAD)
SUFFIX=$(git diff --quiet || echo "-dev")

echo "$TAG.$COMMIT_COUNT-$DATE-$COMMIT_HASH$SUFFIX"