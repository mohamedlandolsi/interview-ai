# Production Environment Variables Setup Guide

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
