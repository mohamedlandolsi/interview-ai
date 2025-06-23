# AI Instruction Generation Setup

To use the AI instruction generation feature, you need to set up a Gemini API key.

## Setup Instructions

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Add the following environment variable to your `.env.local` file:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Restart your development server

## Usage

In the template editor, when creating or editing the "AI Assistant Instructions" field:

1. Click the "Generate with AI" button (with the sparkles icon)
2. In the dialog that opens, describe what you want the AI interviewer to focus on
3. Click "Generate" to create AI-powered instructions
4. The generated instructions will be automatically filled into the instruction field

## Examples of Prompts

- "Focus on problem-solving skills for a senior software engineer role"
- "Emphasize leadership experience and team management capabilities"
- "Ask detailed questions about React, TypeScript, and system design"
- "Prioritize cultural fit and communication skills for a customer service role"
