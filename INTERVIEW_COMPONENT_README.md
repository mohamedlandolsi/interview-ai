# AI Interview Component with Vapi Integration

This component provides a complete voice-powered interview experience using the Vapi AI platform for real-time voice interaction.

## Features

- 🎤 **Real-time Voice Recognition**: Natural speech-to-text processing
- 🗣️ **AI-Powered Responses**: Conversational AI interviewer with human-like interactions  
- ⏱️ **Live Call Management**: Start, stop, mute, and volume controls
- 📊 **Call State Tracking**: Monitor connection status, duration, and errors
- 🎛️ **Volume Control**: Adjustable audio levels for optimal experience
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

1. **Vapi Account**: Sign up at [vapi.ai](https://vapi.ai)
2. **Environment Variables**: Configure in your `.env.local` file

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

### Installation

The required dependencies are already installed:
- `@vapi-ai/web` - Vapi Web SDK
- `@radix-ui/react-slider` - Volume control component

### Basic Usage

```tsx
import { InterviewComponent } from '@/components/interviews';

export default function MyInterviewPage() {
  const handleInterviewStart = () => {
    console.log('Interview started!');
  };

  const handleInterviewEnd = (duration: number) => {
    console.log(`Interview ended after ${duration} seconds`);
  };

  const handleInterviewError = (error: string) => {
    console.error('Interview error:', error);
  };

  return (
    <InterviewComponent
      templateId="your-template-id"
      assistantId="your-assistant-id" // Optional, uses env var if not provided
      onInterviewStart={handleInterviewStart}
      onInterviewEnd={handleInterviewEnd}
      onError={handleInterviewError}
    />
  );
}
```

## API Reference

### InterviewComponent Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `templateId` | `string` | No | Interview template identifier |
| `assistantId` | `string` | No | Vapi assistant ID (defaults to env var) |
| `onInterviewStart` | `() => void` | No | Callback when interview starts |
| `onInterviewEnd` | `(duration: number) => void` | No | Callback when interview ends |
| `onError` | `(error: string) => void` | No | Callback for error handling |

### useVapi Hook

The component uses a custom `useVapi` hook that provides:

```tsx
interface UseVapiReturn {
  callState: CallState;           // Current call status and info
  startCall: (assistantId?: string) => Promise<void>;  // Start interview
  endCall: () => void;            // End interview
  toggleMute: () => void;         // Toggle microphone
  isMuted: boolean;               // Mute status
  volume: number;                 // Volume level (0-1)
  setVolume: (volume: number) => void;  // Set volume
}
```

### Call States

- `idle`: Ready to start
- `connecting`: Attempting to connect
- `connected`: Interview in progress
- `disconnected`: Interview ended
- `error`: Error occurred

## Demo Pages

### 1. Live Interview Page
Navigate to `/interviews/conduct` to conduct actual interviews with parameters:

```
/interviews/conduct?candidate=John+Doe&position=Developer&duration=30&template=tech-123
```

### 2. Demo Page
Visit `/interviews/demo` to test the component functionality in a safe environment.

## File Structure

```
src/
├── components/
│   └── interviews/
│       ├── InterviewComponent.tsx  # Main interview component
│       └── index.ts                # Exports
├── hooks/
│   └── useVapi.ts                  # Vapi integration hook
└── app/
    └── interviews/
        ├── conduct/
        │   └── page.tsx            # Live interview page
        └── demo/
            └── page.tsx            # Demo/test page
```

## Troubleshooting

### Common Issues

1. **"Voice assistant not initialized"**
   - Check that `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set correctly
   - Ensure you have a stable internet connection

2. **"No assistant ID provided"**
   - Set `NEXT_PUBLIC_VAPI_ASSISTANT_ID` in your environment
   - Or pass `assistantId` prop to the component

3. **Microphone not working**
   - Ensure browser has microphone permissions
   - Check browser compatibility (Chrome, Firefox, Safari recommended)

4. **Audio quality issues**
   - Use headphones to prevent echo
   - Ensure quiet environment
   - Adjust volume using the built-in controls

### Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Integration Examples

### With Authentication
```tsx
<DashboardRoute>
  <InterviewComponent
    onInterviewStart={() => {
      // Log interview start for authenticated user
      analytics.track('interview_started', { userId: user.id });
    }}
  />
</DashboardRoute>
```

### With Custom Styling
```tsx
<div className="max-w-4xl mx-auto p-6">
  <InterviewComponent
    templateId={selectedTemplate}
    onInterviewEnd={(duration) => {
      // Save interview results
      saveInterviewResults({ duration, templateId: selectedTemplate });
    }}
  />
</div>
```

## Webhook Configuration

### Server-Side Webhook Setup ✅

The application includes a complete webhook endpoint at `/api/vapi/webhook` that handles all Vapi events:

**Webhook URL**: `https://your-domain.com/api/vapi/webhook`

### Supported Events

| Event Type | Description | Database Action |
|------------|-------------|-----------------|
| `call-start` | Call initiated | Update session status to `in_progress` |
| `call-end` | Call completed | Update session status to `completed`, save cost data |
| `transcript` | Real-time speech | Store transcript messages in `real_time_messages` |
| `artifact` | Final recordings/transcript | Save final transcript, recording URLs, summary |
| `function-call` | Custom function calls | Handle custom assistant functions |
| `speech-start/end` | Speech detection | Log speech events |
| `hang` | Call hung up | Handle call termination |

### Database Integration

The webhook automatically stores:
- **Call metadata**: Cost, duration, assistant ID
- **Real-time transcripts**: All conversation messages with timestamps
- **Final artifacts**: Complete transcript, recording URLs, AI summary
- **Session tracking**: Status updates throughout the interview

### Webhook Security

For production deployment, set the webhook secret:

```bash
VAPI_WEBHOOK_SECRET=your_secure_webhook_secret
```

The webhook verifies signatures using HMAC-SHA256 to ensure requests are from Vapi.

### Testing the Webhook

You can test the webhook endpoint:

```bash
# Test webhook is active
curl https://your-domain.com/api/vapi/webhook

# Response: {"message":"Vapi webhook endpoint is active","timestamp":"2025-06-21T..."}
```

### Configuration in Vapi Dashboard

1. Go to your Vapi dashboard
2. Navigate to your assistant settings
3. Set webhook URL to: `https://your-domain.com/api/vapi/webhook`
4. Configure webhook secret (optional but recommended)
5. Enable desired event types

## Contributing

To extend the component:

1. Modify `InterviewComponent.tsx` for UI changes
2. Update `useVapi.ts` for Vapi integration enhancements
3. Test changes on both demo and live interview pages

## Support

For issues related to:
- **Vapi Integration**: Check [Vapi Documentation](https://docs.vapi.ai)
- **Component Usage**: Review the demo page implementation
- **Authentication**: See existing auth patterns in the codebase
