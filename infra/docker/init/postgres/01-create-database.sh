#!/bin/bash
set -e

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db_name="$FG_DB_NAME" <<-EOSQL

CREATE DATABASE :"db_name";

EOSQL
