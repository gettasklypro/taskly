-- Create storage bucket for website images
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-images', 'website-images', true);

-- Create RLS policies for website images bucket
CREATE POLICY "Users can upload images to their websites"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own website images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'website-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own website images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view website images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'website-images');