# Casify

Casify is a browser-based investigative puzzle game inspired by titles like Scrutinized and Wordle. Players analyze suspicious person reports, search databases, and gather evidence to identify a daily culprit. Every decision matters, and critical thinking is key to solving each case.

## Game Overview
- **Genre:** Investigative Puzzle
- **Platform:** Browser
- **Core Loop:** Analyze reports, search databases, collect evidence, and make deductions to solve daily cases.

## Gameplay Loop
1. **Case Briefing:**
   - The player receives a Suspicious Person Report with ambiguous and incomplete details.
2. **Report Examination:**
   - Review the report fields, which may include:
     - Suspect Name (optional)
     - Date and Time (optional)
     - Sex (optional)
     - Height (specific or range, optional)
     - Hair (optional)
     - Age (specific or range, optional)
     - Eyes (optional)
     - Weight (specific or range, optional)
     - Report Summary (always provided)
3. **Decision Point:**
   - **Shred the Report:** Discard if unreliable (risk: may lose a valid lead).
   - **Submit the Report:** Attach at least one piece of evidence and, if possible, identify the suspect.
4. **Investigation Phase:**
   - Use report details to search various databases:
     - **Police Records:** Search by name for criminal history.
     - **DMV Records:** Search by physical description (height, eye color, etc.) if name is missing.
     - **Social Media:** Search by name or alias for posts and connections.
     - **SIM Card/Phone Records:** Search by name; use a root kit to unlock phones (risk: penalty for hacking innocents).
     - **Recent Purchases:** Search by name for transaction history.
5. **Evidence Aggregation:**
   - Collect and cross-reference findings to build a case.
6. **Outcome & Feedback:**
   - The game processes the player's decisions, providing feedback, penalties, or progression based on accuracy and thoroughness.

## Game Mechanics
- **Reports:**
  - Each report contains a mix of optional and required fields, challenging players to work with incomplete data.
- **Database Searches:**
  - Each database offers unique information and search parameters. Strategic use is required to avoid penalties and dead ends.
- **Risk-Reward Actions:**
  - Actions like hacking phones carry penalties if misused, adding moral and strategic depth.
- **Evidence Submission:**
  - At least one piece of evidence is required to submit a report. Correct identification and evidence advance the case.

## Scoring
- Players start with 1000 points per case.
- Penalties are applied for:
  - Incorrect or weak evidence
  - Shredding a valid report
  - Hacking innocent suspects
- The goal is to solve the case with the highest possible score.

## Practice Mode
- An optional mode allows players to practice outside the daily challenge.

## Summary
Casify challenges players to think critically, manage risk, and make tough decisions with incomplete information. Every choice impacts the investigation, making each case a unique and engaging puzzle.
