# Template Instructions & Questions Integration

## Overview
Enhanced the VAPI assistant integration to ensure that when templates with custom instructions and questions are used, the assistant receives and follows these specific requirements rather than using generic prompts.

## Problem Solved
Previously, the single assistant approach meant that template-specific instructions and questions were not being passed to the assistant, resulting in generic interviews regardless of the template selected.

## Solution Implemented

### Smart Assistant Selection Logic

The system now intelligently chooses between different approaches based on the available template data:

#### 1. **Dynamic Configuration (When Template Data Available)**
- **Trigger**: When `templateQuestions` or `templateInstruction` are provided
- **Behavior**: Creates a dynamic assistant configuration incorporating template data
- **Result**: Assistant follows specific instructions and asks specific questions

#### 2. **Static Assistant (When No Template Data)**
- **Trigger**: When no template questions or instructions are provided
- **Behavior**: Uses the pre-configured assistant ID from environment variables
- **Result**: Uses your carefully configured static assistant

#### 3. **Fallback Configuration (If All Else Fails)**
- **Trigger**: When dynamic config fails and static assistant unavailable
- **Behavior**: Creates basic configuration with any available template data
- **Result**: Ensures interview can still proceed

## Code Changes

### Updated `startInterviewCall()` Function in `useVapi.ts`

```typescript
// Determine strategy based on template data availability
const hasTemplateData = (templateQuestions && templateQuestions.length > 0) || templateInstruction;

if (hasTemplateData) {
  // Use dynamic configuration with template data
  const systemPrompt = buildSystemPromptWithTemplate(position, templateInstruction, questions);
  const assistantConfig = createDynamicAssistantConfig(systemPrompt);
  await vapiRef.current.start(assistantConfig);
} else {
  // Use static pre-configured assistant
  await vapiRef.current.start(configuredAssistantId);
}
```

### System Prompt Construction

When template data is available, the system builds a comprehensive prompt including:

```typescript
let systemPrompt = `You are a professional AI interviewer for the position: ${position}.`;

if (templateInstruction) {
  systemPrompt += `\n\n**INTERVIEW INSTRUCTIONS:**\n${templateInstruction}`;
}

systemPrompt += `\n\n**IMPORTANT: Ask these specific questions during the interview:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Guidelines:**
- Start with a warm greeting and introduction
- Follow the instructions provided above
- Ask the questions listed above in order, but keep the conversation natural
- Ask relevant follow-up questions based on responses
- Be professional, engaging, and encouraging
- Allow the candidate to ask questions at the end
- Conclude professionally`;
```

## Benefits

✅ **Template Compliance**: Assistant follows specific template instructions and questions  
✅ **Flexibility**: Static assistant for generic interviews, dynamic for templated ones  
✅ **Efficiency**: No unnecessary assistant creation when templates aren't used  
✅ **Reliability**: Multiple fallback layers ensure interviews can always proceed  
✅ **Consistency**: Same assistant behavior when no templates are involved  

## Behavior Matrix

| Template Questions | Template Instructions | Behavior |
|-------------------|----------------------|----------|
| ✅ Provided | ✅ Provided | Dynamic config with both |
| ✅ Provided | ❌ None | Dynamic config with questions only |
| ❌ None | ✅ Provided | Dynamic config with instructions only |
| ❌ None | ❌ None | Static pre-configured assistant |

## Example Usage

### Template-Based Interview
```typescript
await startInterviewCall(
  "John Doe", 
  "Senior Developer", 
  ["What's your experience with React?", "Describe your testing approach"],
  "Focus on technical skills and ask follow-up questions about specific technologies"
);
// Result: Uses dynamic configuration with custom questions and instructions
```

### Generic Interview
```typescript
await startInterviewCall("Jane Smith", "Marketing Manager");
// Result: Uses static pre-configured assistant (4618da61-18bd-4cec-ac70-1d74c27d3acc)
```

## Verification

✅ **Build Status**: Compilation successful  
✅ **Type Safety**: No TypeScript errors  
✅ **Fallback Logic**: Multiple safety nets implemented  
✅ **Template Integration**: Instructions and questions properly incorporated  

## Files Modified

- `src/hooks/useVapi.ts` - Enhanced `startInterviewCall()` function with smart assistant selection

## Testing Recommendations

1. **Test with template data**: Create an interview with custom questions and instructions
2. **Test without template data**: Create a general interview 
3. **Test with partial data**: Try with only questions or only instructions
4. **Test fallback scenarios**: Disable environment variables to test fallback behavior

The system now provides the best of both worlds: efficient reuse of your configured assistant for general interviews, and dynamic customization when specific template requirements are needed.
