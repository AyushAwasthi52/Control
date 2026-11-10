# Architecture & Safety Design

## Overview
Operation Free Controller is structured around independent, strictly separated layers:

```
[ Browser UI (Next.js 16 + React 19 + Tailwind) ]
                     │
                     ▼
      [ Authenticated API Route Handlers ]
       ├── /api/companies & /api/companies/import
       ├── /api/research/run (SSRF Protected)
       ├── /api/drafts/generate & /api/drafts/[id] (Approval Machine)
       ├── /api/drafts/[id]/send (Safe Send Guard)
       └── /api/analytics (Strict Denominators)
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
[ Prisma ORM ]  [ Draft Engine ] [ Email Providers ]
(SQLite / PG)   (Claim Scanner)  ├── Mock Provider (Default)
                                 └── Gmail OAuth (Encrypted)
```

## State Machine & Invalidation Rule
The application enforces an invariant:
- **`APPROVED` state is strictly bound to an exact tuple of (`subject`, `body`, `contactId`, `version`)**.
- Any call to `PATCH /api/drafts/:id` that changes content immediately:
  1. Increments `version = version + 1`.
  2. Resets `status = NEEDS_REVIEW`.
  3. Sets `approvedVersion = null` and `approvedAt = null`.
  4. Appends a `DRAFT_EDITED_APPROVAL_INVALIDATED` event to the `ActivityLog`.
- The `/api/drafts/:id/send` endpoint checks `draft.status === 'APPROVED' && draft.approvedVersion === draft.version`. If this condition fails, the send is rejected.

## Security Safeguards
- **SSRF Mitigation**: URLs entered for research or company websites are validated to block `localhost`, `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, AWS/GCP metadata endpoints (`169.254.169.254`), and internal `.local`/`.internal` domains.
- **CSV Formula Injection**: All exported CSV cells starting with `=, +, -, @, \t, \r` are escaped with a leading apostrophe `'`.
- **Suppression Registry**: The sending service normalizes target emails and domains, performing a lookup against the `Suppression` table before contacting any brand.
- **Token Encryption**: Refresh tokens are encrypted with `AES-256-GCM` using `TOKEN_ENCRYPTION_KEY`. Plaintext secrets never appear in logs, client bundles, or API responses.
