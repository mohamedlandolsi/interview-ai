# Production Environment Variables Setup Guide

## For Vercel Production Deployment

In your Vercel dashboard, add these environment variables:

### Required Production Variables:
```bash
# Your production domain (replace with your actual domain)
APP_URL=https://your-app-domain.vercel.app

# Supabase (same as local)
NEXT_PUBLIC_SUPABASE_URL=https://klpvbpihucordleemcoq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHZicGlodWNvcmRsZWVtY29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDE3NTAsImV4cCI6MjA2NTgxNzc1MH0.K9NyMhM8l1hiQUgpLgG1gW6x9T6JzeWyu4tmDHXtRkQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHZicGlodWNvcmRsZWVtY29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI0MTc1MCwiZXhwIjoyMDY1ODE3NzUwfQ.nqNEnLoPYnQbew0KX2HSpS7LJut-zahKA2cwO6AzVFA

# Vapi (same as local)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=5e5b8e56-1e1b-4e7f-ada2-a65c7ab1b645
NEXT_PUBLIC_VAPI_ASSISTANT_ID=4618da61-18bd-4cec-ac70-1d74c27d3acc
VAPI_PRIVATE_KEY=6f1ceebe-b292-48ac-a23e-b9962b5e7d26
VAPI_WEBHOOK_SECRET=be079d5a62aa6fdd91203cca19c39c33e9ee68599f08b3f360e79ea6a94aa62d

# Gemini (same as local)
GEMINI_API_KEY=AIzaSyAUqA2tCrn_4ayvlEGJyojoNzJ0Aj5Vzyg

# Database
DATABASE_URL=your-production-database-url
```

## Steps to Deploy:

1. **Set APP_URL correctly**: 
   - If your Vercel app URL is `https://interview-ai-123.vercel.app`, set:
   - `APP_URL=https://interview-ai-123.vercel.app`

2. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Fix webhook URL for production"
   git push
   ```

3. **Verify webhook URL generation**:
   - After deployment, check the logs to see the webhook URL
   - It should be: `https://your-domain.vercel.app/api/vapi/webhook?sessionId=...`

## How the webhook URL is generated:

- **Development**: Uses `VAPI_WEBHOOK_TUNNEL_URL` (ngrok) if set, otherwise falls back to localhost
- **Production**: Uses `APP_URL` environment variable

The current assistant builder code will create:
`${APP_URL}/api/vapi/webhook?sessionId=${sessionId}`
