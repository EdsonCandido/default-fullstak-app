#!/bin/sh
set -e

node /app/packages/db/dist/migrate.mjs
exec node dist/index.mjs
