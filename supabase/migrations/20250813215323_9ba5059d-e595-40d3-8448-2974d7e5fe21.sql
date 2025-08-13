-- Create function to link enrollments when user signs up
CREATE OR REPLACE FUNCTION public.link_enrollments_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Update enrollments with matching email to link to this user
  UPDATE public.enrollments 
  SET user_id = NEW.id
  WHERE student_email = user_email 
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically link enrollments when user is created in profiles
CREATE OR REPLACE TRIGGER on_user_profile_created
  AFTER INSERT ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.link_enrollments_on_signup();