-- Add slug field to websites table for subdomain routing
ALTER TABLE websites ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);

-- Create index for published websites lookups
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);

-- Add RLS policy for public viewing of published websites
CREATE POLICY "Anyone can view published websites"
ON websites
FOR SELECT
USING (status = 'published');

-- Add RLS policy for public viewing of published website pages
CREATE POLICY "Anyone can view pages of published websites"
ON pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = pages.website_id
    AND websites.status = 'published'
  )
);