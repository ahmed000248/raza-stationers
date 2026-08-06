# Git History Secret Removal & Remediation Plan

- Date: 2026-08-07
- Target Repository: ahmed000248/raza-stationers
- Active Branch: phase-10-finalizing
- Incident Summary: Exposure of historical TOTP secrets in previous certification progress commits.

## Affected Commits and Files

| Commit SHA | Commit Message | Affected File |
|---|---|---|
| `f8eda4c` | docs: update production verification progress report with certified status | `docs/production/production_verification_progress.md` |
| `4ed907a` | test: complete production verification runbook — all security-critical gates certified | `docs/production/production_verification_progress.md` |
| `454508b` | docs: 100% complete production verification — all gates certified | `docs/production/production_verification_progress.md` |

## History Rewrite Strategy (`git filter-repo`)

To scrub exposed material from all historical commits across git history:

### 1. Install `git-filter-repo` (Python tool)
```bash
pip install git-filter-repo
```

### 2. Prepare Replacement Expressions File (`expressions.txt`)
Create a local expressions file containing patterns to redact without printing exposed secrets:
```text
regex:VERIFY_OWNER_TOTP_SECRET=[A-Z2-7]{16,64}==>VERIFY_OWNER_TOTP_SECRET=[REDACTED]
regex:otpauth://[^\s"'`]+==>[REDACTED_TOTP_URI]
```

### 3. Run History Filter Command
```bash
git filter-repo --replace-text expressions.txt --force
```

### 4. Force Push Safety Guard
Do NOT execute `git push --force` or force-push rewritten history unless the environment variable:
```dotenv
AUTHORIZE_GIT_HISTORY_REWRITE=YES
```
is explicitly set and confirmed by repository owner.

### 5. Post-Rewrite Verification & Invalidation Steps
1. Run `npm run security:scan` to verify zero secret patterns remain anywhere in history.
2. Invalidate all local developer clones and forks (`git fetch origin` / fresh re-clone).
3. Contact GitHub Support if cached commit views remain accessible via direct commit SHA URLs on github.com.
