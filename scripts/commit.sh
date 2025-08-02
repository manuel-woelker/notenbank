#!/usr/bin/env bash

set -euo pipefail

(cd ui && pnpm run lint --fix  --max-warnings 0 && pnpm run typecheck)

jj desc
jj new
git push origin HEAD:refs/heads/master
git checkout master
git pull