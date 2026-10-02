-- Hosting a tournament on Vantix is free; also zero out the live setting so
-- existing SiteSettings rows stop charging the old ₹200 fee.
ALTER TABLE "SiteSettings" ALTER COLUMN "hostingFeeAmount" SET DEFAULT 0;
UPDATE "SiteSettings" SET "hostingFeeAmount" = 0 WHERE "id" = 'global';
