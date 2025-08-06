-- RPC function to complete onboarding
-- This function handles all database updates when a user completes onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  user_id UUID,
  bio_text TEXT DEFAULT NULL,
  pronoun_id INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Update the user's profile with bio, pronouns, and mark onboarding as complete
  UPDATE public.profiles 
  SET 
    bio = bio_text,
    pronoun_id = pronoun_id,
    onboarding_complete = true,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Return success response
  SELECT json_build_object(
    'success', true,
    'message', 'Onboarding completed successfully',
    'user_id', user_id
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', user_id
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding(UUID, TEXT, INTEGER) TO authenticated; 