-- Add business fields to websites table
ALTER TABLE websites
ADD COLUMN business_name TEXT,
ADD COLUMN business_description TEXT,
ADD COLUMN whatsapp_country_code TEXT,
ADD COLUMN whatsapp_number TEXT,
ADD COLUMN whatsapp_full_number TEXT;
