# tools.fcullmann.com deployment

The source lives at `/home/users/apidego/www/tools.fcullmann.com` on `ssh apidego`.
Docker Compose, secrets, build logs and backups live outside the web root at
`/opt/apps/fcullmann-tools`. KeyHelp manages DNS, HTTPS, the certificate and HTTP
redirects. Its HTTPS custom directives use `apache-https.conf` to forward to
`127.0.0.1:3009`. PostgreSQL is available only inside this application's Docker
network. Both services restart automatically after a server reboot.

## Update

Upload the current source, excluding `.git`, `.next`, `node_modules`, local
environment files and agent notes. Do not use rsync `--delete` against the web
root. Then run:

```sh
ssh apidego '/opt/apps/fcullmann-tools/rollout.sh <unique-release-tag>'
```

The script backs up PostgreSQL and runs the production build,
builds the standalone runtime, applies migrations, adds any missing seed records
and waits for the new application to become healthy. Existing seed records are
preserved. Public URLs are compiled for `https://tools.fcullmann.com`.

## Operations

```sh
ssh apidego
cd /opt/apps/fcullmann-tools
docker compose ps
docker compose logs --tail=100 web
./backup.sh
cat admin-login.txt
```

Secrets and initial administrator credentials are in `.env` and
`admin-login.txt` (mode 600). The admin email is `admin@fcullmann.com`; login is
at `https://tools.fcullmann.com/login`. Environment changes require
`docker compose up -d --force-recreate --wait web`.

The daily `fcullmann-tools-backup.timer` retains database dumps in `backups/`
for 14 days. These are local recovery copies on the same server.

To restore a dump, stop `web`, and stream the decompressed SQL into
`docker compose exec -T db psql -U fcullmann_tools -d fcullmann_tools` against an
empty database. Start `web` afterward. Never run `docker compose down -v` unless
the database volume should be deleted.

To roll back the application, set `RELEASE_TAG` in `.env` to a previously built
runtime image tag and run `docker compose up -d --wait web`. Database migrations
require a separate compatibility assessment before a rollback.

Deployment follows the [Next.js standalone documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
and [Apache reverse proxy documentation](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html).
