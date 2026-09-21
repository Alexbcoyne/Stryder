export { clientEnv } from './client';
// serverEnv is intentionally NOT re-exported here: importing it from a shared
// barrel is the easiest way to drag server-only code into a client bundle.
// Import it directly: `import { serverEnv } from '@/lib/env/server'`.
