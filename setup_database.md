# Database Setup Instructions

## Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section

## Step 2: Run the Database Setup

Copy and paste the entire contents of `database_setup.sql` into the SQL editor and run it.

This will:
- Create the `legal_documents` table
- Insert sample Terms of Service and Privacy Policy documents
- Set up proper indexes for performance
- Configure Row Level Security policies

## Step 3: Verify the Setup

Run this query to verify the documents were created:

```sql
SELECT document_type, version, title, is_latest, published_at 
FROM public.legal_documents 
ORDER BY document_type, published_at DESC;
```

You should see:
- `terms_of_service` version 1.0
- `privacy_policy` version 1.0

## Step 4: Test the RPC Function

Run the SQL from `supabase_functions.sql` to create the `complete_onboarding` RPC function.

## Troubleshooting

### Error: "No privacy policy document found"
This means the `legal_documents` table either doesn't exist or doesn't have the required data. Make sure you've run the `database_setup.sql` script.

### Error: "PGRST116 - The result contains 0 rows"
This indicates the query is working but no documents exist. Check that:
1. The table exists: `SELECT * FROM public.legal_documents LIMIT 1;`
2. Documents exist: `SELECT document_type, is_latest FROM public.legal_documents;`

### Permission Errors
If you get permission errors, make sure:
1. You're logged into Supabase with the correct account
2. You have the necessary permissions for the project
3. The RLS policies are properly configured

## Manual Data Insertion (if needed)

If the automatic setup doesn't work, you can manually insert the documents:

```sql
-- Insert Terms of Service
INSERT INTO public.legal_documents (
  document_type, version, title, content, is_latest, published_at
) VALUES (
  'terms_of_service', '1.0', 'Terms of Service', 
  '<h1>Terms of Service</h1><p>Welcome to Quillaborn...</p>', 
  true, NOW()
);

-- Insert Privacy Policy  
INSERT INTO public.legal_documents (
  document_type, version, title, content, is_latest, published_at
) VALUES (
  'privacy_policy', '1.0', 'Privacy Policy',
  '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>',
  true, NOW()
);
``` 