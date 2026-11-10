# Study OS — Official Content Coverage Report

Verification date: 2026-11-10. Statuses: COMPLETE / PARTIAL / UNVERIFIED / UNAVAILABLE / OUTDATED.

## Board & qualification availability (verified from official sites)

| Board | GCSE | IGCSE | A-level | IAL |
|---|---|---|---|---|
| AQA | yes | no | yes | no |
| Pearson Edexcel | yes | yes | yes | yes |
| OCR | yes | yes (OCR doesn't use "IGCSE" branding; check) | yes | yes |
| WJEC | yes | yes | yes | no |
| Eduqas | yes | no | yes | no |
| CCEA | yes | no | yes | no |

Notes: WJEC offers GCSE/IGCSE/A-level per its site; Eduqas GCSE/A-level; CCEA GCSE/A-level. Exact availability verified against each board's qualifications listing. Subject lists were NOT exhaustively imported — only verified landing-page URLs are recorded.

## Past-paper resource pages

| Board | Status | Verified URL |
|---|---|---|
| AQA | VERIFIED | https://www.aqa.org.uk/find-past-papers-and-mark-schemes |
| Pearson Edexcel | VERIFIED | https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html |
| OCR | VERIFIED | https://www.ocr.org.uk/qualifications/past-papers/ |
| WJEC | UNVERIFIED | https://www.wjec.co.uk/qualifications/ (past papers within qualifications section) |
| Eduqas | UNVERIFIED | https://www.eduqas.co.uk/qualifications/ |
| CCEA | UNVERIFIED | https://www.ccea.org.uk/ (returns 403 to automated requests; verify manually) |

## Specifications

No specification content has been imported. The app uses a TS catalogue (`lib/catalog.ts`) and the `specifications`/`topics` tables exist but are empty (admin import required). Status for all boards/subjects: **UNVERIFIED / not imported**.

## What exists (code, not content)

- Import pipeline: `lib/import/` (types, validate, dedupe, dry-run) — tested.
- Admin preview endpoint: `POST /api/import/preview` (dry-run only, admin-gated).
- Admin page: `/import`.
- Source register type: `OfficialResource` in `lib/official-resources.ts`.
- Spec update monitoring: `/api/spec-updates` (manual, admin-gated).
- Coverage dashboard UI: not yet built (admin page is a stub).

## Remaining (manual / approval-gated)

1. Apply migration + RLS to live Supabase (already done in prior pass).
2. Build the import UI for browsing official sources and running dry-run imports.
3. Populate verified subject/specification/past-paper records via the pipeline (requires manual curation + admin approval).
4. Re-verify URLs periodically (board sites change).
