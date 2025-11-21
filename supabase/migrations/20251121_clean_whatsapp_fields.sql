-- Migration: normalize existing whatsapp fields
-- For rows where whatsapp_full_number is missing but whatsapp_number exists,
-- build whatsapp_full_number by concatenating country code and number (if present),
-- removing non-digits and ensuring a leading '+' character.

BEGIN;

-- Websites: build full number when missing
UPDATE websites
SET whatsapp_full_number = (
  CASE
    WHEN (whatsapp_full_number IS NULL OR trim(whatsapp_full_number) = '') AND (whatsapp_number IS NOT NULL AND trim(whatsapp_number) <> '') THEN
      (
        '+' || regexp_replace(
          COALESCE(whatsapp_country_code, '') || whatsapp_number,
          '[^0-9]',
          '',
          'g'
        )
      )
    ELSE whatsapp_full_number
  END
)
WHERE whatsapp_number IS NOT NULL;

-- Profiles: same normalization for profile-level settings
UPDATE profiles
SET whatsapp_full_number = (
  CASE
    WHEN (whatsapp_full_number IS NULL OR trim(whatsapp_full_number) = '') AND (whatsapp_number IS NOT NULL AND trim(whatsapp_number) <> '') THEN
      (
        '+' || regexp_replace(
          COALESCE(whatsapp_country_code, '') || whatsapp_number,
          '[^0-9]',
          '',
          'g'
        )
      )
    ELSE whatsapp_full_number
  END
)
WHERE whatsapp_number IS NOT NULL;

COMMIT;
