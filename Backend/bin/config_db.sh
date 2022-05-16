#!/bin/bash

export PGPASSWORD='0213748346Ll!'

database="raindb"

echo "Configuring database: $database"

dropdb -U abdulmalik raindb
createdb -U abdulmalik raindb

psql -U abdulmalik raindb < ./bin/raindb.sql

echo "$database configured"