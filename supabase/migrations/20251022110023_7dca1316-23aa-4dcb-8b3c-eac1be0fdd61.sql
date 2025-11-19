
-- Update thumbnail URLs for existing templates
UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80'
WHERE name = 'Business Coach Elite';

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80'
WHERE name = 'Consulting Firm Classic';

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=400&q=80'
WHERE name = 'Creative Agency Portfolio';

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80'
WHERE name = 'Fitness Studio Pro';
