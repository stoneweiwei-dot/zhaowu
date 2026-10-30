\echo '=== (1) direct anon UPDATE / INSERT / DELETE on life_view_article_views ==='
set role anon;
select set_config('request.headers', '{"x-forwarded-for":"203.0.113.7"}', false) as headers \gset
select article_id, view_count from public.life_view_article_views where article_id = 'existing-article';
update public.life_view_article_views set view_count = 999999 where article_id = 'existing-article';
insert into public.life_view_article_views values ('junk-row', 5, now());
delete from public.life_view_article_views;
\echo '=== (2) rate limit: same visitor calls RPC 3x, then 2nd visitor, then spoofed-IP flood ==='
select public.increment_life_view_article_view('existing-article') as call_1_visitor_a;
select public.increment_life_view_article_view('existing-article') as call_2_visitor_a_throttled;
select public.increment_life_view_article_view('existing-article') as call_3_visitor_a_throttled;
select set_config('request.headers', '{"x-forwarded-for":"198.51.100.9"}', false) as headers \gset
select public.increment_life_view_article_view('existing-article') as call_4_visitor_b;
reset role;
\echo '--- 80 calls from 80 distinct (spoofed) IPs on one article: per-article ceiling 60 / 10 min ---'
select count(distinct v) filter (where v is not null) as distinct_counts_returned, max(v) as final_count
from (select set_config('request.headers', json_build_object('x-forwarded-for','192.0.2.'||g)::text, false),
             public.increment_life_view_article_view('ceiling-article') v from generate_series(1,80) g) s;
\echo '--- limiter rows (IP hashed, no raw IP stored; showing non-flood rows + flood summary) ---'
select bucket_key, fail_count, locked_until > now() as locked from public.rate_limit_buckets where bucket_key not like 'view:ip:%' or fail_count > 1 order by bucket_key;
select count(*) as per_ip_buckets, bool_and(bucket_key ~ '^view:ip:[0-9a-f]{64}$') as all_hashed from public.rate_limit_buckets where bucket_key like 'view:ip:%';
\echo '=== (3) PR C primitives: 5 failed logins lock the key; success clears it ==='
select i as failed_attempt, public.record_rate_limit_attempt('login:ip:demo' || left(i::text, 0), false) as blocked from generate_series(1,6) i;
select public.check_rate_limit('login:ip:demo') as blocked_now;
select public.record_rate_limit_attempt('login:ip:demo', true) as blocked_after_success;
select public.check_rate_limit('login:ip:demo') as blocked_now;
\echo '--- anon / authenticated cannot call the primitives or read the bucket table ---'
set role anon;
select public.check_rate_limit('login:ip:demo');
select * from public.rate_limit_buckets;
reset role;
