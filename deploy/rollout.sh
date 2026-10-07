#!/bin/sh
set -eu
export RELEASE_TAG="${1:?Usage: rollout.sh release-tag}"
case "$RELEASE_TAG" in
  *[!a-zA-Z0-9_.-]*) echo 'Invalid release tag' >&2; exit 1 ;;
esac
cd /opt/apps/fcullmann-tools
source_dir=/home/users/apidego/www/tools.fcullmann.com
cp "$source_dir/deploy/compose.yaml" compose.yaml
install -m 700 "$source_dir/deploy/backup.sh" backup.sh
docker compose config -q
docker compose up -d --wait db
./backup.sh
docker build --target build --build-arg NEXT_PUBLIC_SITE_URL=https://tools.fcullmann.com \
  -t "fcullmann-tools-build:$RELEASE_TAG" "$source_dir"
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://tools.fcullmann.com \
  -t "fcullmann-tools:$RELEASE_TAG" "$source_dir"
docker compose run --rm setup
docker compose up -d --wait web
python3 - "$RELEASE_TAG" <<'PY'
import pathlib, sys
path = pathlib.Path('.env')
lines = path.read_text().splitlines()
path.write_text('\n'.join(
    "RELEASE_TAG='" + sys.argv[1] + "'" if line.startswith('RELEASE_TAG=') else line
    for line in lines
) + '\n')
PY
curl -fsS -o /dev/null https://tools.fcullmann.com/de
docker compose ps
