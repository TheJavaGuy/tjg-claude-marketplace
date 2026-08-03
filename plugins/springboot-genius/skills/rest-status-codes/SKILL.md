---
name: rest-status-codes
description: Authoritative per-verb HTTP status code matrix (RFC 9110, RFC 5789, RFC 6585) with Spring HttpStatus constants. Always consult this skill when writing, reviewing, or refactoring REST controllers, @ExceptionHandler / @ControllerAdvice classes, ResponseEntity return values, or OpenAPI/Swagger response definitions — in Spring Boot or any other framework. Also use it whenever the user asks which status code an endpoint should return, debates 400 vs 422, 404 vs 410, 409 vs 412, or asks about idempotency and DELETE semantics. Apply it even if the user doesn't mention "status codes" explicitly but is designing API endpoints or error handling.
---

# REST Status Codes (per-verb matrix)

Use this matrix to pick response status codes. Spring constants are from
`org.springframework.http.HttpStatus`. Never invent codes outside this matrix
without flagging the deviation to the user.

## Per-verb matrix

| Verb | Success (body) | Success (no body) | Resource created | Async / deferred | Resource missing | Malformed request | Semantically invalid | State/version conflict |
|---|---|---|---|---|---|---|---|---|
| **GET** | 200 `OK`; 206 `PARTIAL_CONTENT` (Range); 304 `NOT_MODIFIED` (conditional GET) | — (204 on GET is a smell) | — | — | 404 `NOT_FOUND` / 410 `GONE` | 400 `BAD_REQUEST` (bad query params) | 400 or 422 `UNPROCESSABLE_ENTITY` (invalid filter combo) | — |
| **HEAD** | 200 `OK` (headers only; same status GET would give) | — | — | — | 404 `NOT_FOUND` | 400 `BAD_REQUEST` | — | — |
| **POST** (create/action) | 200 `OK` (action result in body) | 204 `NO_CONTENT` (action, nothing to return) | 201 `CREATED` + `Location` header | 202 `ACCEPTED` (job queued; return status URI) | 404 `NOT_FOUND` (parent resource) | 400 `BAD_REQUEST` (unparseable JSON) | 422 `UNPROCESSABLE_ENTITY` (parses, fails business rules) | 409 `CONFLICT` (duplicate unique key) |
| **PUT** (full replace) | 200 `OK` (return representation) | 204 `NO_CONTENT` | 201 `CREATED` (upsert created new resource) | 202 `ACCEPTED` | 404 `NOT_FOUND` (if create-via-PUT not allowed) | 400 `BAD_REQUEST` | 422 `UNPROCESSABLE_ENTITY` | 409 `CONFLICT`; 412 `PRECONDITION_FAILED` (`If-Match` ETag stale); 428 `PRECONDITION_REQUIRED` (API mandates `If-Match`) |
| **PATCH** (partial update) | 200 `OK` (return patched representation) | 204 `NO_CONTENT` | — (PATCH must not create) | 202 `ACCEPTED` | 404 `NOT_FOUND` | 400 `BAD_REQUEST` (malformed patch doc) | 422 `UNPROCESSABLE_ENTITY` (patch valid, resulting state invalid) | 409 `CONFLICT`; 412 `PRECONDITION_FAILED` |
| **DELETE** | 200 `OK` (deletion receipt / final state) | 204 `NO_CONTENT` (typical) | — | 202 `ACCEPTED` (async delete) | 404 `NOT_FOUND` (or 204 for idempotent-friendly deletes); 410 `GONE` (permanently removed) | 400 `BAD_REQUEST` | — | 409 `CONFLICT` (e.g. FK children exist); 412 `PRECONDITION_FAILED` |
| **OPTIONS** | 200 `OK` + `Allow` header | 204 `NO_CONTENT` (also common) | — | — | 404 `NOT_FOUND` | 400 `BAD_REQUEST` | — | — |

## Cross-cutting (any verb)

| Situation | Status | Spring constant | Required header |
|---|---|---|---|
| Not authenticated / bad token | 401 | `UNAUTHORIZED` | `WWW-Authenticate` |
| Authenticated but not permitted | 403 | `FORBIDDEN` | — |
| Verb not supported on this resource | 405 | `METHOD_NOT_ALLOWED` | `Allow` |
| `Accept` header can't be satisfied | 406 | `NOT_ACCEPTABLE` | — |
| Request `Content-Type` unsupported (POST/PUT/PATCH) | 415 | `UNSUPPORTED_MEDIA_TYPE` | — |
| Request body too large | 413 | `PAYLOAD_TOO_LARGE` | — |
| Rate limit exceeded | 429 | `TOO_MANY_REQUESTS` | `Retry-After` |
| Unhandled server bug | 500 | `INTERNAL_SERVER_ERROR` | — |
| Upstream dependency failed (gateway role) | 502 | `BAD_GATEWAY` | — |
| Temporarily down / overloaded | 503 | `SERVICE_UNAVAILABLE` | `Retry-After` |

## Tie-breaking rules

Apply these consistently across the whole API:

1. **400 vs 422** — 400 = request can't be parsed (broken JSON, wrong types).
   422 = parses fine but violates business rules. RFC 9110 defines 422 in the
   core spec, so it is legitimate outside WebDAV. Note: Spring's `@Valid`
   failures default to 400; override
   `ResponseEntityExceptionHandler.handleMethodArgumentNotValid` to emit 422
   if the API adopts that convention.
2. **DELETE idempotency** — 404 on repeat-delete is RFC-correct (idempotency
   constrains server state, not response codes), but 204 for already-gone
   simplifies client retry logic. Pick one API-wide.
3. **412 vs 409** — 412 when the client sent `If-Match` and the ETag is stale;
   409 when the conflict is detected server-side without preconditions
   (e.g. optimistic-lock version field inside the payload).
4. **201 must carry `Location`** — always set the URI of the created resource
   (`ResponseEntity.created(uri)` in Spring).
5. **202 must be pollable** — return a status URI (body or `Location`) so the
   client can track the async job.
6. **401 vs 403** — 401 = "who are you?" (missing/invalid credentials, must
   include `WWW-Authenticate`); 403 = "I know who you are, still no."

## Spring quick reference

- Success: `HttpStatus.OK`, `CREATED`, `ACCEPTED`, `NO_CONTENT`,
  `PARTIAL_CONTENT`, `NOT_MODIFIED`
- Client errors: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
  `METHOD_NOT_ALLOWED`, `NOT_ACCEPTABLE`, `CONFLICT`, `GONE`,
  `PRECONDITION_FAILED`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`,
  `UNPROCESSABLE_ENTITY`, `PRECONDITION_REQUIRED`, `TOO_MANY_REQUESTS`
- Server errors: `INTERNAL_SERVER_ERROR`, `BAD_GATEWAY`, `SERVICE_UNAVAILABLE`
- Naming note: RFC 9110 renamed 413 to "Content Too Large"; the Spring
  constant remains `PAYLOAD_TOO_LARGE` (`REQUEST_ENTITY_TOO_LARGE` is
  deprecated).

## How to apply

When generating or reviewing endpoint code:

1. Identify the verb and the situation column that matches each outcome path.
2. Emit the exact status from the matrix; add the required header where the
   cross-cutting table demands one.
3. If the codebase already deviates (e.g. uses 400 for validation errors),
   follow its convention but point out the matrix recommendation once.
4. In OpenAPI specs, document every matrix cell reachable by the endpoint —
   including 401/403/429/500 cross-cutting codes if the API has auth or rate
   limiting.
