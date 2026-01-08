## Code Review Checklist

<details open>
<summary><strong>Context First</strong></summary>

- [ ] Read the PR description and confirm it clearly explains what changed and why
- [ ] Review linked tickets/discussions for motivation and scope
- [ ] Ask for migration or rollout context if unclear

</details>

<details>
<summary><strong>High-Level Review</strong></summary>

- [ ] Does code follow established structure and naming conventions?
- [ ] Are responsibilities and data flow clear and cohesive?
- [ ] Are security, reliability, and performance considerations addressed?
- [ ] Is backward compatibility maintained for APIs and data models?
- [ ] Are logging and metrics useful and do they omit sensitive data?
- [ ] Were tests added or updated, and do all tests pass before merge? (partially handled by workflows)

</details>

<details>
<summary><strong>Implementation Review</strong></summary>

- [ ] Focus on patterns, not lines — verify consistency across modules
- [ ] Review one layer at a time (models → services → UI)
- [ ] Check edge cases, error handling, and cleanup of dead/debug code
- [ ] Confirm no unnecessary dependencies or ad-hoc utilities introduced

</details>

<details>
<summary><strong>Frontend Reviews</strong></summary>

- [ ] Are accessibility and UX states handled (loading, error, empty)?
- [ ] Is styling consistent and responsive?
- [ ] Are unnecessary re-renders avoided and proper hooks/memoization used?
- [ ] Were Jest/RTL tests added or updated for new features?
- [ ] Were empty Cypress tests added for greenfield work?

</details>

<details>
<summary><strong>Backend Reviews</strong></summary>

- [ ] Are input/output validation and error handling consistent?
- [ ] Are migrations safe, reversible, and ordered correctly?
- [ ] Are external calls resilient (timeouts, retries, idempotency)?
- [ ] Are logs and metrics included for critical paths?
- [ ] Were unit/integration tests added or updated for new logic?

</details>

<details>
<summary><strong>Risk & Testing</strong></summary>

- [ ] Were high-risk areas (migrations, data boundaries, async logic) validated?
- [ ] Are critical paths observable and testable?
- [ ] Were removed tests replaced with equivalent or better coverage?

</details>

<details>
<summary><strong>Communication & Wrap-Up</strong></summary>

- [ ] Leave early comments if review is in progress
- [ ] Group feedback: architecture, patterns, blockers
- [ ] Summarize findings and highlight strengths
- [ ] Note follow-ups or documentation needs if applicable

</details>

<details>
<summary><strong>Time Management Tips</strong></summary>

- [ ] Limit sessions to ~60 minutes; continue later if needed
- [ ] Review highest-risk areas first; triage minor nits to the end

</details>

---

## Reviewing Guide
- Check out the [Reviewing Guide](https://github.com)
