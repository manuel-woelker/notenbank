#!/usr/bin/env bash

set -euo pipefail

(cd ui && pnpm run typecheck && pnpm run lint --fix)

jj desc
jj new
git push origin HEAD:refs/heads/master
git checkout master
git pull