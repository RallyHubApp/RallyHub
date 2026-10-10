# RallyHub Testing and Release Protocol
Version 1.0 — 10 October 2026
Status: Draft; requires super-admin sign-off.

## Non-negotiable rules
- Base44 AI Builder is prohibited unless the super-admin explicitly says "Use the Base44 AI Builder" for a specific task. No implied permission.
- Never change live tenant data, publish events, deploy, send communications, or run destructive production tests without explicit approval.
- Never report an unexecuted, blocked, or skipped test as passed.

## Environments
1. Development: isolated feature branches or Base44 checkpoints for experimental changes.
2. Independent runner: clean GitHub Actions runner with Node, locked dependencies, and Playwright-managed Chromium. Runner is disposable; configuration and test evidence are persistent in GitHub.
3. Integration/UAT: dedicated non-production Base44 app with synthetic tenant data, test users, sandbox integrations, and controlled credentials; not operational until verified separately.
4. Production: live RallyHub; read-only smoke checks after approved release.

## Change control
1. Record change request, risk level, affected tenants/modules, expected result, baseline commit and rollback checkpoint.
2. Implement a small scoped change on a branch or checkpoint.
3. Run lint/typecheck/build and targeted unit/fixture tests.
4. Run browser tests in independent Chromium runner; collect traces, screenshots, logs and failures.
5. Run regression checks on affected modules: KOTC, interclub, booking, payments, directory/events, communication, access control and tenant isolation as applicable.
6. Run integration/UAT against verified isolated environment, never live production with test writes.
7. Report exact revision, environment, commands, pass/fail/blocked/skipped counts, evidence and outstanding risks.
8. Require explicit super-admin release approval. Freeze tested revision; publish only approved code.
9. Verify post-deploy production behaviour and maintain rollback reference.

## Release gates
- GREEN: all required tests executed and passed; evidence recorded; explicit approval received.
- AMBER: tests skipped/blocked, unverified integration, or open low-risk defects; hold release for review.
- RED: tenant leakage, payment/booking/data-integrity/security failure; do not release.

## Test evidence template
Date | Change ID | Branch/commit | Base44 checkpoint | Tenant/module | Runner | Test commands | Passed/Failed/Skipped/Blocked | Evidence URLs | Reviewer | Approval | Release revision | Rollback | Production smoke result

## CI safeguards
- Start with manual-only workflow (workflow_dispatch); no automated deployment.
- Minimal read-only GitHub token permissions.
- Never put API keys or credentials in repository or logs.
- CI passing does not establish that Base44's deployed version matches the tested GitHub commit; verify sync explicitly.
