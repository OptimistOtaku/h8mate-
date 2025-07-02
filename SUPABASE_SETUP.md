# Supabase Setup Guide

This guide will help you set up Supabase for authentication and database functionality.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `h8mate` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose the closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
AUTH_SECRET=your-random-secret-key-here
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-schema.sql` and paste it into the editor
3. Click "Run" to execute the SQL

This will create:
- `users` table for user profiles
- `posts` table for posts
- `tier_lists` table for tier lists
- `comments` table for comments
- Row Level Security (RLS) policies
- Triggers for automatic user creation

## 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. Under "Site URL", add your development URL: `http://localhost:3000`
3. Under "Redirect URLs", add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/api/auth/callback/nextauth`

## 6. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try to sign up with a new account
4. Verify that the user is created in the `users` table in Supabase

## 7. Production Deployment

When deploying to production:

1. Update your environment variables with production values
2. Update the Site URL and Redirect URLs in Supabase to your production domain
3. Make sure to set `AUTH_SECRET` to a secure random string

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**: Make sure you're using the anon key, not the service role key
2. **"JWT secret not set" error**: This is handled automatically by Supabase
3. **RLS policies blocking operations**: Check that your RLS policies are correctly configured
4. **User not created in users table**: Check that the trigger function is working correctly

### Database Connection Issues:

If you're having trouble with the database connection, you can temporarily disable RLS for testing:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE tier_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
```

**Note**: Remember to re-enable RLS before going to production!

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js with Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 