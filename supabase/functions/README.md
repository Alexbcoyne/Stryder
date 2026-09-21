# Edge Functions

Empty by design. The first function to land here is the Monday morning summary
(`weekly-summary`), which is the only proactive touchpoint Stryder has — there
are no mid-week pushes to athletes.

Functions run on Deno and use the service role key, so they are the only place
`weekly_summaries` and `badges` can be written from: those tables have no client
write policy at all.
