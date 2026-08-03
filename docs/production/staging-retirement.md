# Staging retirement

Repository staging code and configuration are retired. The former staging credentials are considered compromised or obsolete and must not be reused.

Cloud staging deletion has not happened in Phase 8. It remains a manual owner action and is prohibited until all of the following are true:

- a production database backup exists;
- Prisma migration status is clean;
- catalogue reconciliation passes;
- owner authentication passes;
- customer/business registration passes;
- deployed Web, Admin, and API acceptance checks pass;
- Ahmed explicitly authorizes cloud staging deletion.

Until that gate is complete, do not delete or modify the old cloud project from repository automation or provider APIs.
