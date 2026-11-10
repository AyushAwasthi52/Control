# Operation Free Controller

A dedicated outreach management platform and pipeline designed to research gaming peripheral manufacturers, verify legitimate public business contacts, generate fact-grounded sampling inquiry drafts, enforce strict per-draft human approval, and track replies and hardware outcomes as a measurable experiment.

---

## Safety & Ethics Tenets
1. **Zero Automated Bulk Sending**: Absolutely no emails are ever sent automatically upon lead discovery or draft generation. Every send requires an explicit, conscious user click on an approved draft.
2. **Approval State Invalidation**: Any modification made to the subject, body, or recipient of an approved draft immediately revokes approval provenance and returns the draft to `NEEDS_REVIEW`.
3. **Fact-Grounded Context**: Inquiries cite verified hardware evidence (sensors, switches, key product lines) stored with provenance URLs. The claim analyzer detects and warns against unauthorized follower counts, fake audience claims, or guaranteed positive review promises.
4. **Suppression & Duplicate Safeguards**: All recipients and domains are verified against the suppression list and checked for recent outreach before sending.
5. **Safe Mock Delivery Default**: Runs locally with `MockEmailProvider` by default. Real Gmail API delivery is strictly opt-in and requires OAuth 2.0 configuration.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism design tokens + Lucide Icons
- **Database & ORM**: SQLite (`dev.db`) + Prisma ORM (configurable for PostgreSQL)
- **Validation & Security**: Zod, SSRF URL validator, AES-256-GCM token encryption, CSV formula injection sanitizer
- **Testing**: Vitest (Unit & Integration tests)

---

## Quick Start & Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```
Default environment values:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="operation-free-controller-secret-key-32bytes"
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
EMAIL_PROVIDER="mock"
```

### 3. Initialize & Seed Database
Synchronize the Prisma schema and populate the database with initial gaming peripheral brands (8BitDo, Flydigi, GuliKit, GameSir, Pulsar Gaming Gears), verified contacts, and sample research records:
```bash
npx prisma db push
npm run seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests
Execute the Vitest test suite (normalization, SSRF safety, CSV security, draft generation, and approval state machine):
```bash
npm test
```

### 6. Run Production Build
```bash
npm run build
npm start
```

---

## Application Structure & Capabilities

### 1. Overview Dashboard
- **KPI Metrics**: Research Coverage %, Contact Coverage %, Sent Outreach, Products Received.
- **Visual Funnel**: Tracks progress from *Identified Brands* → *Researched Leads* → *Verified Contacts* → *Approved Drafts* → *Sent* → *Replies* → *Samples Offered* → *Hardware Received*.
- **Append-Only Audit Log**: Live audit feed recording all draft edits, approvals, send events, and suppression actions.

### 2. Brands & Leads Explorer
- Search and filter by peripheral category (Controllers, Keyboards, Mice, Audio) and status (`NEW`, `RESEARCHED`, `CONTACT_FOUND`, `ARCHIVED`).
- Sourced fact count & verified contact channel indicators.
- **CSV Export**: Secure export with formula injection sanitization (escaping `=`, `+`, `-`, `@`).
- **CSV Import**: Import leads with pre-commit validation preview and duplicate detection.

### 3. Company Detail & Evidence Manager
- Sourced hardware facts with external provenance URLs.
- SSRF-protected research entry blocking private IP ranges and loopbacks.
- Public business contact management with PR / Partnerships / Support classification.
- Manual outcome logger to record brand replies, review unit offers, and physical shipments.

### 4. Draft Studio
- Side-by-side workspace:
  - **Left**: Verified hardware evidence cards, user profile claims, and real-time claim safety scanner.
  - **Right**: Versioned draft editor (`Subject`, `Body`), status badge, and approval lifecycle controls.
- Increments version number on any edit and automatically revokes prior approvals.

### 5. Approval Queue
- Dedicated queue for drafts in `NEEDS_REVIEW` and `APPROVED`.
- Individual explicit approval and individual explicit send (no bulk sending).

### 6. Analytics & Conversion Funnel
- Honest metrics with strict non-zero denominators.
- Direct response tracking and sample offer conversion breakdown.

### 7. Integrations & Safety Registry
- Authentic student profile claims editor (name, bio, hardware focus, approved signature).
- Suppression list manager: block domains or email addresses from outreach permanently.
- Email Provider status and connection test.

---

## Gmail Integration (Optional)
To enable real Gmail sending instead of simulated mock sends:
1. Create a Google Cloud project with the **Gmail API** enabled.
2. Configure OAuth 2.0 Credentials with scope `https://www.googleapis.com/auth/gmail.send`.
3. Set in `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   EMAIL_PROVIDER="gmail"
   ```
4. All messages still require individual human review and approval in the UI before transmission.

---

## Confirmation of Delivery Safety
- **No real emails were sent** during development, testing, or database seeding.
- `MockEmailProvider` is active by default and ensures complete delivery isolation.
