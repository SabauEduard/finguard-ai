#!/bin/bash
set -e

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_user="$FG_DB_APP_USER" \
  -v app_password="$FG_DB_APP_PASSWORD" \

CREATE USER :"app_user"
WITH PASSWORD :'app_password';

EOSQL
