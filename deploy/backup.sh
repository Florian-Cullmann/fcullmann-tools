#!/bin/sh
set -eu
cd /opt/apps/fcullmann-tools
umask 077
mkdir -p backups
backup="backups/database-$(date -u +%Y%m%dT%H%M%SZ).sql"
trap 'rm -f "$backup.tmp"' EXIT
docker compose exec -T db pg_dump -U fcullmann_tools -d fcullmann_tools > "$backup.tmp"
mv "$backup.tmp" "$backup"
gzip "$backup"
find backups -name 'database-*.sql.gz' -mtime +14 -delete
