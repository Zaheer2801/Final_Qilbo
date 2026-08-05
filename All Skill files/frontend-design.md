---
name: frontend-design
description: "Use this skill whenever building or revising any customer-facing or marketing UI for Qilbo — landing pages, the dashboard's visual polish, anything a person looks at rather than just clicks through. Not needed for internal tooling with no design stakes (a debug page, a test harness). Trigger on requests like 'build a landing page', 'make this look better', 'design a hero section', or any UI work where visual quality matters to the outcome."
---

# Frontend Design — Qilbo

Approach every UI task as the design lead at a small studio known for giving every client
a visual identity that couldn't be mistaken for anyone else's. Qilbo has already rejected
generic — a warm cream background with a terracotta accent, or a near-black page with one
neon accent, are the two defaults every AI-generated design reaches for. Neither is Qilbo.

## Qilbo's established identity — don't reinvent it per page

This brand already exists across the business requirements doc, the ER diagram, and the
onboarding prototype. Every new UI surface should feel like it belongs to the same company,
not a fresh guess:

- **Color**: near-black warm brown (`#2B2116`) as ink, amber/copper (`#B5651D`) as the one
  accent — used sparingly, not as a wash. Supporting tones: deep green (`#3F5D4F`) for
  confirmed/success states, muted stone (`#8A8272`) for secondary text.
- **Type**: a serif display face (Georgia/Cambria-class — characterful, not a generic
  system sans) for headings, paired with a clean sans for body copy, and monospace
  specifically for anything evoking a receipt, ticket, or point-of-sale record.
- **Signature motif**: the "printed receipt" — a thermal-paper-style panel with a
  perforated/torn edge, monospace type, that fills in line by line as something gets
  confirmed. This isn't decoration; it's the same "nothing happens without a visible,
  confirmed record" principle the whole backend is built on, made tactile. Reach for this
  motif specifically when a UI moment involves confirmation, a summary, or a completed
  transaction — not everywhere, or it stops meaning anything.

New pages can extend this identity (a landing page doesn't have to look like the dashboard)
but shouldn't contradict it — same ink and accent colors, same typographic logic, the
receipt motif available as a tool when the moment calls for it.

## Design principles (apply to every UI task)

**Ground it in the subject.** Qilbo is a business-operations brain for real, physical
retail — liquor, inventory, receipts, phone calls, vendors. Pull from that world: the
texture of a receipt, the precision of a ledger, the calm confidence of a well-run counter.
Not generic SaaS-dashboard imagery.

**The hero is a thesis.** For a landing page, open with the most characteristic thing in
Qilbo's world — not a generic "AI-powered platform" headline with a stock gradient. Consider
what actually differentiates it: the approval-gate philosophy (nothing executes without a
confirmed record), the receipt motif itself, a live demo of a reorder decision.

**Typography carries personality.** The serif/mono pairing already established is the
personality — lean into it rather than defaulting to a single system sans everywhere.

**Structure is information.** Numbered steps only when something is genuinely sequential
(onboarding, a process). Don't add numbering as decoration.

**Motion, used deliberately.** The receipt-printing animation is Qilbo's one signature
motion — a line appearing as if printed. Don't scatter unrelated hover effects or
gratuitous animation around it; one well-orchestrated moment lands harder than many small
ones.

**Restraint.** Spend boldness in one place per page. If everything is emphasized, nothing
is. Before shipping, ask: what's the one memorable thing here, and is everything else quiet
enough to let it read clearly?

## Process

1. **Brainstorm** a compact plan before writing code: what's the hero moment, what's the
   one aesthetic risk, how does the existing Qilbo identity extend to this specific page.
2. **Critique the plan** against genuinely generic defaults — would this same plan show up
   for any SaaS product's landing page? If yes, revise until it's specific to Qilbo.
3. **Build**, then **critique again** — screenshot or review the actual result, not just
   the plan. Check responsiveness, focus states, and that motion respects
   reduced-motion preferences.

## Copy

Words are UI, not decoration. Plain, active, specific — describe what Qilbo actually does
("nothing executes without your approval," not "seamless AI-powered automation"). No filler
adjectives standing in for a real claim.

## Tooling precedence

Other design/UI tools and skills may be installed alongside this one (animation libraries,
general UI-pattern skills, component registries). None of them override this file on
anything that defines Qilbo's actual identity — the color tokens, the type pairing, the
receipt motif, the hero angle. This file wins on brand-specific decisions, always.

- **Animation library**: use Motion (motion.dev) for anything beyond a simple CSS
  transition — it has real React bindings and a built-in reduced-motion hook, which the
  receipt-printing animation needs. Don't also reach for anime.js in this codebase; one
  animation library is enough, and Motion is the React-idiomatic choice.
- **General UI-pattern/hygiene skills** (accessibility rules, contrast checks, transition
  timing conventions, cursor states) are useful and can run alongside this file. Their
  checklist-style rules (no emoji-as-icons, visible focus states, correct opacity for glass
  effects in each mode) apply regardless of brand. Their *style and palette suggestions* do
  not — if a general skill suggests a different color, type pairing, or aesthetic direction
  than what's established here, this file's choices win.
- **Component registries** (copy-paste component libraries) are fine for genuinely generic,
  low-stakes UI — a dropdown, a form input pattern — where there's no brand identity at
  stake. They should never be the source for anything meant to be distinctively Qilbo's:
  the hero, the receipt motif, any signature moment. Using a shared registry component for
  those defeats the entire point of this file.
