-- Create bucket for test images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('test-images', 'test-images', true);

-- Create policies for test images
CREATE POLICY "Test images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'test-images');

CREATE POLICY "Authenticated users can upload test images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'test-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update test images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'test-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete test images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'test-images' AND auth.role() = 'authenticated');