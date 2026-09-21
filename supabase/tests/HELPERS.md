# Test conventions

Shared preamble, inlined by each test file rather than imported: `supabase
test db` runs every file as an independent transaction, so there is no shared
session state to hang a helper off.

Conventions used by the suite:

  set local role authenticated;
  set local request.jwt.claims to '{"sub":"<uuid>","role":"authenticated"}';

puts the session in the same position as a browser client holding that user's
JWT. `reset role;` returns to the migration role (which bypasses RLS) for
fixture setup.

This file intentionally contains no tests.

This file is documentation, not a test: `supabase test db` only picks up `*.sql`.
