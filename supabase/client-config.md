# Supabase Self-Hosted Configuration

**Host:** IRIS (Synology DS1520+)
**Last updated:** 2026-02-22

---

## Connection Details

| Service | Internal URL | External URL |
|---------|--------------|--------------|
| PostgreSQL | `10.1.11.98:5433` | N/A (internal only) |
| GoTrue Auth | `http://10.1.11.98:9999` | `https://supabase.conant.com` |

---

## Environment Variables

Copy these to your project's `.env` file:

```bash
# Supabase Self-Hosted (IRIS)
SUPABASE_URL=https://supabase.conant.com
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQwMjY4ODAwLCJleHAiOjIwNTU2Mjg4MDB9.uGDBt2nxihU_5tSrIFO78gX98cSlDVrWsTPoxopXfXs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDAyNjg4MDAsImV4cCI6MjA1NTYyODgwMH0.pgWMhC0GbgWuvB_x2he0-Cghpr6i6d3luf94HtOtbCg

# Direct database connection (if needed)
# Get password from: ssh mike@10.1.11.98 -p 2222 'grep SUPABASE_POSTGRES_PASSWORD /volume3/docker/.env'
DATABASE_URL=postgresql://postgres:<password>@10.1.11.98:5433/postgres

# Auth endpoint (GoTrue)
SUPABASE_AUTH_URL=https://supabase.conant.com
```

---

## Generating JWT Keys

Supabase clients need JWT tokens signed with the server's secret. Generate them using:

```bash
# Get the JWT secret from the server
JWT_SECRET="<SUPABASE_JWT_SECRET from /volume3/docker/.env>"

# Generate anon key (for public/anonymous access)
# Role: anon, exp: far future
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { role: 'anon', iss: 'supabase', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 315360000 },
  '$JWT_SECRET'
);
console.log('SUPABASE_ANON_KEY=' + token);
"

# Generate service_role key (for admin/backend access - keep secret!)
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { role: 'service_role', iss: 'supabase', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 315360000 },
  '$JWT_SECRET'
);
console.log('SUPABASE_SERVICE_ROLE_KEY=' + token);
"
```

Or use the online tool at: https://supabase.com/docs/guides/self-hosting#api-keys

---

## Client SDK Usage

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

### Direct Fetch (Auth API)

```bash
# Health check
curl https://supabase.conant.com/health

# Sign up
curl -X POST https://supabase.conant.com/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}'

# Sign in
curl -X POST https://supabase.conant.com/token?grant_type=password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}'
```

---

## RLS Roles Available

| Role | Purpose |
|------|---------|
| `anon` | Unauthenticated public access |
| `authenticated` | Logged-in user access |
| `service_role` | Backend/admin bypass (use carefully) |

---

## Notes

- **Email:** Auto-confirm enabled (`GOTRUE_MAILER_AUTOCONFIRM=true`) - no email verification required
- **Signup:** Open (`GOTRUE_DISABLE_SIGNUP=false`)
- **JWT expiry:** 1 hour (`GOTRUE_JWT_EXP=3600`)
- **Database:** PostgreSQL 15 with Supabase extensions
- **Backup:** Daily pg_dump at 4 AM, 7-day retention
