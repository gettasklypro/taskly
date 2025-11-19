-- Create storage bucket for request files
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-files', 'request-files', true);

-- Create policies for request files bucket
CREATE POLICY "Users can view request files"
ON storage.objects FOR SELECT
USING (bucket_id = 'request-files');

CREATE POLICY "Authenticated users can upload request files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'request-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own request files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'request-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own request files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'request-files' 
  AND auth.role() = 'authenticated'
);