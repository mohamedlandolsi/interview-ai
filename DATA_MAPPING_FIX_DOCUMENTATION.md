# Data Persistence Bug Fix: Vapi Webhook to Prisma Database Mapping

## Problem Statement

**Critical Bug**: AI-generated interview results were being saved as `null` or `0` in the database, causing the results page to display empty data instead of actual analysis results.

## Root Cause Analysis

The issue was a **naming convention mismatch** between:

1. **Vapi Webhook Data**: Uses `camelCase` format (e.g., `overallScore`, `categoryScores`)
2. **Prisma Database Schema**: Expects `snake_case` format (e.g., `analysis_score`, `category_scores`)

The `saveAnalysisFromWebhook` function was passing camelCase data directly to the `prisma.interviewSession.update` call, which failed to map values to the correct database columns.

### Data Flow Issue
```
Vapi Webhook → camelCase data → Prisma update → snake_case fields = MISMATCH
```

## Solution Implemented

### File Modified: `src/lib/interview-analysis-service.ts`

**Replaced the `saveAnalysisFromWebhook` function** with explicit field mapping logic:

```typescript
static async saveAnalysisFromWebhook(sessionId: string, webhookData: any): Promise<boolean> {
  try {
    const message = webhookData.message || webhookData;
    
    // Extract structured data from the analysis
    const structuredData =
      typeof message.analysis?.structuredData === 'string'
        ? JSON.parse(message.analysis.structuredData)
        : message.analysis?.structuredData;

    if (!structuredData) {
      console.error('Structured data is missing from the analysis payload.');
      // Fallback - mark as completed without analysis data
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: 'completed', completed_at: new Date() },
      });
      return false;
    }

    // --- CRITICAL FIX: Explicit camelCase → snake_case mapping ---
    const updateData = {
      status: 'completed' as const,
      completed_at: new Date(),
      final_transcript: message.transcript,
      recording_url: message.recordingUrl,
      vapi_summary: message.analysis?.summary,
      vapi_success_evaluation: message.analysis?.successEvaluation,
      vapi_structured_data: message.analysis?.structuredData,

      // Mapped fields for our UI
      analysis_score: structuredData.overallScore,
      category_scores: structuredData.categoryScores,
      strengths: structuredData.strengths,
      areas_for_improvement: structuredData.areasForImprovement,
      hiring_recommendation: structuredData.hiringRecommendation,
      key_insights: structuredData.keyInsights,
      question_scores: structuredData.questionResponses,
      interview_metrics: structuredData.interviewMetrics,
      analysis_feedback: structuredData.reasoning,
    };

    // Save to database with correctly mapped fields
    const updateResult = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    console.log(`✅ Successfully saved analysis for session: ${sessionId}`);
    return true;

  } catch (error) {
    console.error('❌ Error saving analysis from webhook:', error);
    return false;
  }
}
```

## Field Mappings

| Vapi camelCase | Prisma snake_case | Description |
|----------------|-------------------|-------------|
| `overallScore` | `analysis_score` | Overall interview score (0-100) |
| `categoryScores` | `category_scores` | Scores by category (object) |
| `strengths` | `strengths` | Array of candidate strengths |
| `areasForImprovement` | `areas_for_improvement` | Areas needing improvement |
| `hiringRecommendation` | `hiring_recommendation` | Hiring decision recommendation |
| `keyInsights` | `key_insights` | Key insights from analysis |
| `questionResponses` | `question_scores` | Individual question scores |
| `interviewMetrics` | `interview_metrics` | Detailed interview metrics |
| `reasoning` | `analysis_feedback` | Detailed analysis feedback |

## Testing Results

**Test Script**: `test-data-mapping-fix.js`

```bash
✅ analysis_score (overallScore): Expected 82, Got 82
✅ category_scores (categoryScores): Expected object, Got object
✅ strengths (strengths): Expected 3, Got 3
✅ areas_for_improvement (areasForImprovement): Expected 2, Got 2
✅ hiring_recommendation (hiringRecommendation): Expected Yes - Recommended for hire, Got Yes - Recommended for hire
✅ key_insights (keyInsights): Expected 2, Got 2
✅ question_scores (questionResponses): Expected 2, Got 2
✅ interview_metrics (interviewMetrics): Expected object, Got object
✅ analysis_feedback (reasoning): Expected string, Got string

🎉 SUCCESS: All data mappings work correctly!
```

## Verification Checklist

- ✅ **Build Success**: Project compiles without TypeScript errors
- ✅ **Data Mapping**: All camelCase fields correctly mapped to snake_case
- ✅ **Null Handling**: Graceful fallback when structured data is missing
- ✅ **Test Coverage**: Comprehensive test script validates all mappings
- ✅ **Backwards Compatibility**: Does not break existing webhook processing

## Expected Outcomes

### Before Fix
- Results page showed null/0 values
- Analysis scores not saved to database
- Empty category scores and insights
- Poor user experience with missing data

### After Fix
- ✅ Actual analysis scores displayed (e.g., 82/100)
- ✅ Category scores properly saved and shown
- ✅ Strengths, weaknesses, and insights populated
- ✅ Professional results page with real data
- ✅ Complete interview analysis available

## Impact

This fix resolves the critical data persistence issue that was preventing users from seeing their interview analysis results. Now when a Vapi webhook delivers analysis data, it will be correctly saved to the database and displayed on the results page.

**Files Modified**: 
- `src/lib/interview-analysis-service.ts` (main fix)
- `test-data-mapping-fix.js` (validation script)

**Testing**: All mappings verified, build successful, ready for production deployment.
