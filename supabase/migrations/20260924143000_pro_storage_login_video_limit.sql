-- The owner explicitly upgraded this organization to Pro. Keep image limits in
-- application code, but allow short, high-bitrate login video source files to
-- use Storage's TUS resumable upload path.
update storage.buckets
set file_size_limit = 524288000
where id = 'zhaowu-gallery';
