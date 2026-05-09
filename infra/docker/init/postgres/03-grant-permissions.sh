#!/bin/bash
set -e

psql --username "$POSTGRES_USER" --dbname "$FG_DB_NAME" \
  -v db_name="$FG_DB_NAME" \
  -v app_user="$FG_DB_APP_USER" <<-EOSQL

GRANT ALL PRIVILEGES ON DATABASE :"db_name" TO :"app_user";

GRANT ALL ON SCHEMA public TO :"app_user";

EOSQL
