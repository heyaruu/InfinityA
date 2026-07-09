---
name: Concurrency-safe wallet withdrawals
description: How to prevent double-spend when a wallet/withdrawal balance check and the debit write are two separate steps.
---

Computing an available balance (e.g. `total earned - total withdrawn`) and then inserting a new withdrawal row as two separate steps is a classic check-then-act race: two concurrent requests can both read the same balance and both pass validation, together withdrawing more than what's available.

**Fix:** wrap the balance recomputation and the insert in a single DB transaction at `SERIALIZABLE` isolation (`db.transaction(async (tx) => { ...check...; ...insert...; })` with `tx.execute(sql\`set transaction isolation level serializable\`)` in Postgres/Drizzle). This forces one of two concurrent transactions to fail/retry rather than both succeeding.

**Why:** a code-review subagent caught this as a blocking issue in AffilTrak's wallet withdraw endpoint — verified by firing 3 concurrent same-size withdrawals against a balance that could only cover one; exactly one succeeded after the fix.

**How to apply:** any endpoint that debits a computed balance (wallets, credits, inventory counts, seat limits) needs the read-check-write sequence to be atomic, not just individually validated.
