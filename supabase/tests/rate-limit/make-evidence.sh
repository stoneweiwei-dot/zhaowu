#!/usr/bin/env bash
# Regenerates evidence-20261030.txt on a LOCAL scratch Postgres (never production).
# Usage: PSQL="psql -h /tmp/pgt -p 54329 -U postgres" ./make-evidence.sh > evidence.txt
set -uo pipefail
cd "$(dirname "$0")"
M=../../migrations; [ -f "$M/20261030120000_rate_limit_buckets.sql" ] || M=..
P="${PSQL:-psql}"
run() { echo "\$ $*"; "$@" 2>&1; echo; }
echo "# $(date '+%Y-%m-%d %H:%M %Z') · $($P -d postgres -tAc 'select version()')"
run $P -d postgres -c "drop database if exists zw_evidence" -c "create database zw_evidence"
run $P -v ON_ERROR_STOP=1 -q -d zw_evidence -f 00_prod_baseline.sql
echo "### BEFORE migration — anon UPDATE succeeds (current production behaviour)"
run $P -d zw_evidence -c "set role anon; update public.life_view_article_views set view_count = 999999 where article_id='existing-article' returning article_id, view_count;"
$P -q -d zw_evidence -c "update public.life_view_article_views set view_count = 41 where article_id='existing-article'"
echo "### APPLY migrations"
run $P -v ON_ERROR_STOP=1 -q -d zw_evidence -f $M/20261030120000_rate_limit_buckets.sql
run $P -v ON_ERROR_STOP=1 -q -d zw_evidence -f $M/20261030120100_life_view_views_lockdown.sql
echo "### AFTER migration"
run $P -d zw_evidence -c "set role anon; update public.life_view_article_views set view_count = 999999 where article_id='existing-article' returning article_id, view_count;"
run $P -d zw_evidence -f 40_evidence.sql
