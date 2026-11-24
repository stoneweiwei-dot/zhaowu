#!/usr/bin/env bash
# Usage: PSQL="psql -h /tmp/pgt -p 54329 -U postgres" ./run.sh   (SCRATCH database only — never production)
set -euo pipefail
cd "$(dirname "$0")"
M=../../migrations
[ -f "$M/20261030120000_rate_limit_buckets.sql" ] || M=..
P="${PSQL:-psql} -v ON_ERROR_STOP=1 -q"
$P -d postgres -c "drop database if exists zw_ratelimit_test" -c "create database zw_ratelimit_test"
D="$P -d zw_ratelimit_test"
$D -f 00_prod_baseline.sql
$D -f $M/20261030120000_rate_limit_buckets.sql
$D -f 10_rate_limit_buckets.test.sql
if [ -f $M/20261030120100_life_view_views_lockdown.sql ]; then
  $D -f $M/20261030120100_life_view_views_lockdown.sql
  $D -f 20_life_view_lockdown.test.sql
fi
# Rollback checks (reverse order)
if [ -f $M/20261030120100_life_view_views_lockdown.sql ]; then
  $D -f rollback_20261030120100_life_view_views_lockdown.sql
  $D -f 30_rollback.test.sql
fi
$D -f rollback_20261030120000_rate_limit_buckets.sql
$D -c "do \$\$ begin assert to_regclass('public.rate_limit_buckets') is null and to_regprocedure('public.check_rate_limit(text)') is null, 'C rollback'; raise notice 'rollback C: PASS'; end \$\$;"
$P -d postgres -c "drop database zw_ratelimit_test"
echo "ALL SQL TESTS PASSED"
