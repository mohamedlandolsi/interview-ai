# Authentication Flow Testing Guide

This guide helps you test the authentication flow end-to-end in your Next.js application.

## 🔧 Setup

1. **Supabase Configuration**: Ensure your Supabase project is properly configured with the correct environment variables.

2. **Database Setup**: Make sure your `profiles` table exists and RLS policies are configured.

3. **Middleware**: The enhanced middleware should be deployed and active.

## 🧪 Test Scenarios

### 1. Public Route Access
Test that public routes are accessible without authentication:

```bash
# Should work without authentication
curl http://localhost:3000/
curl http://localhost:3000/login
curl http://localhost:3000/register
```

### 2. Protected Route Redirection
Test that protected routes redirect unauthenticated users:

```bash
# Should redirect to /login
curl -I http://localhost:3000/dashboard
curl -I http://localhost:3000/settings
```

### 3. Authentication Flow

#### A. User Registration
1. Navigate to `/register`
2. Fill out the registration form
3. Verify email confirmation (if enabled)
4. Should redirect to `/dashboard`

#### B. User Login
1. Navigate to `/login`
2. Enter valid credentials
3. Should redirect to `/dashboard` or the original intended route

#### C. Logout
1. From any authenticated page, click logout
2. Should redirect to `/` (home page)
3. Trying to access protected routes should redirect to `/login`

### 4. API Route Protection

#### A. Test Protected API Without Auth
```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:3000/api/profile
curl -X GET http://localhost:3000/api/dashboard/stats
```

#### B. Test Protected API With Auth
```bash
# First, get session cookies by logging in through the browser
# Then use those cookies in API requests

# Should return user profile data
curl -X GET http://localhost:3000/api/profile \
  -H "Cookie: your-session-cookies"

# Should return dashboard stats
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Cookie: your-session-cookies"
```

#### C. Test Rate Limiting
```bash
# Make multiple rapid requests to test rate limiting
for i in {1..35}; do
  curl -X GET http://localhost:3000/api/profile \
    -H "Cookie: your-session-cookies"
done
# Should eventually return 429 Too Many Requests
```

### 5. Browser-based Testing

#### A. Manual Flow Test
1. **Start Unauthenticated**:
   - Visit `/dashboard` → Should redirect to `/login?redirectTo=/dashboard`
   - Visit `/settings` → Should redirect to `/login?redirectTo=/settings`

2. **Login Process**:
   - Login with valid credentials
   - Should redirect to the original intended page

3. **Authenticated Access**:
   - Visit `/dashboard` → Should load successfully
   - Visit `/settings` → Should load successfully
   - Visit `/login` → Should redirect to `/dashboard`

4. **Session Management**:
   - Open DevTools → Application → Cookies
   - Verify Supabase session cookies are present
   - Delete session cookies manually
   - Refresh page → Should redirect to login

#### B. Network Tab Inspection
1. Open DevTools → Network tab
2. Navigate to protected routes
3. Verify:
   - No unnecessary redirects for authenticated users
   - Proper 401 responses for unauthenticated API calls
   - Session refresh requests when needed

### 6. Security Testing

#### A. Token Manipulation
1. Open DevTools → Application → Cookies
2. Modify Supabase session tokens
3. Try to access protected routes
4. Should be redirected to login

#### B. API Security Headers
```bash
# Check security headers in API responses
curl -I http://localhost:3000/api/profile
# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

## 🐛 Common Issues & Solutions

### Issue: Infinite Redirect Loop
**Cause**: Middleware configuration issues or missing environment variables.
**Solution**: 
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify middleware matcher configuration
- Check browser console for errors

### Issue: API Routes Return 500 Error
**Cause**: Database connection issues or missing Supabase configuration.
**Solution**:
- Check server console logs
- Verify Supabase service role key (for server-side operations)
- Ensure database tables exist

### Issue: Session Not Persisting
**Cause**: Cookie configuration or domain issues.
**Solution**:
- Check if cookies are being set correctly
- Verify domain configuration in Supabase
- Check for HTTPS requirements in production

### Issue: Rate Limiting Not Working
**Cause**: Multiple server instances or stateless deployment.
**Solution**:
- For production, implement Redis-based rate limiting
- Current implementation uses in-memory storage (single instance only)

## 📊 Monitoring & Logs

### Server-side Logs
Check your application logs for:
- Middleware authentication errors
- API route protection logs
- Session refresh attempts

### Client-side Monitoring
- Network requests in DevTools
- Console errors related to authentication
- Local storage/cookie inspection

## ✅ Success Criteria

Your authentication system is working correctly if:

1. ✅ Unauthenticated users cannot access protected routes
2. ✅ Authenticated users can access all authorized areas
3. ✅ API routes properly validate authentication
4. ✅ Rate limiting prevents abuse
5. ✅ Session refresh works seamlessly
6. ✅ Logout completely clears authentication state
7. ✅ Redirect flows work as expected
8. ✅ Security headers are present in API responses

## 🚀 Performance Considerations

- **Middleware Efficiency**: Monitor middleware execution time
- **Session Refresh**: Optimize frequency of session checks
- **Rate Limiting**: Adjust limits based on usage patterns
- **Error Handling**: Ensure graceful degradation on auth service failures
