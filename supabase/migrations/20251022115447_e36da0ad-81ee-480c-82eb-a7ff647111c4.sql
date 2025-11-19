-- Update thumbnail images for service templates
UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'
WHERE name = 'Professional Cleaners';

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop'
WHERE name = 'Professional Builders';

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop'
WHERE name = 'Professional Plumbers';

UPDATE templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop'
WHERE name = 'Professional Electricians';