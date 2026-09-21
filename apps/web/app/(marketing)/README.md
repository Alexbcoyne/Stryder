# `(marketing)` route group

Reserved and deliberately empty.

The public marketing surface is kept in its own route group, separate from
`(app)`, so that public pages never inherit the authenticated shell, its nav or
its data fetching. Middleware protects `(app)` only.

Keeping this boundary clean is also what leaves room for **Stryder Stories**
later: curated, opt-in, editorial comeback stories are public, editorial pages,
not a feed inside the product. Stories is post-MVP and out of scope — do not
build it here yet, just do not collapse this group into `(app)`.
