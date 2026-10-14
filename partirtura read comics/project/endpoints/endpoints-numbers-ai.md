# Endpoints — Works AI

Controllers covered:
- AdminWorkAIController — AI multimodal analysis for Works

## POST /api/admin-works/{workId}/ai-analysis

Description:
Enqueues an asynchronous AI analysis job for the selected pages of a work. The analysis runs in the background via Hangfire; the endpoint returns immediately without waiting for the AI provider.

Controller:
AdminWorkAIController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Rate Limiting:
- `AdminAiAnalysis` (10/h by user)

Request body:
AnalyzeComicRequest (JSON):
{
    "imageIds": [101, 102, 103]
}

Validation (executed before any state change or job creation):
- `workId` (path) must exist and be active
- `imageIds` must not be null or empty
- All `imageIds` must correspond to images belonging to the work's content (Pages → Image)
- The work must be in `ContentStatus = Completed` (content already processed)
- Physical files for all selected images must exist in storage
- No active analysis exists (`IAStatus` is not `Pending` or `Processing`)

Behavior:
1. Validates request and work/images.
2. Sets `IARequest = true`, `IAStatus = Pending (0)`, `IAResult = null`, `IARequestedAt = now` on the Work (discarding any previous analysis result).
3. Persists the Work changes.
4. Enqueues a Hangfire Job (queue: `ai-analysis`) with arguments `WorkId` and `ImageIds`.
5. Returns immediately with HTTP 200 OK.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "AI analysis enqueued successfully.",
      "code": 200,
      "payload": null
  }

Errors:
- 400 Bad Request — malformed JSON
- 401 Unauthorized
- 403 Forbidden
- 404 BusinessNotFoundException — work not found, or one or more images do not belong to the work
- 422 ValidationException — work not in Completed status, no images selected, or analysis already in progress (Pending/Processing)
- 429 RateLimitExceededException

Notes:
- The endpoint does **not** execute the AI analysis; it only registers the request and creates the background job.
- The analysis is performed asynchronously by the `WorkAnalysisJob` Hangfire worker (queue: `ai-analysis`).
- A new request for the same work is only allowed when the previous analysis is in `Success` or `Error` state.
- When re-requesting from `Success` or `Error`, the previous `IAResult` is cleared, `IAStatus` is set to `Pending`, and `IARequestedAt` is updated.
- The AI result will be available later in `Work.IAResult` (JSON) and can be retrieved via `GET /api/admin-works/{workId}`.
- Rate limited to 10 requests per hour per user (`AdminAiAnalysis` policy).