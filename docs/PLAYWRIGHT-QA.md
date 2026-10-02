# PORTELA CULTURE — PLAYWRIGHT QA CONTRACT

## Purpose
Use this checklist for every user-facing change. The goal is to verify real behavior, not only code appearance.

## Baseline
Start from a clean local preview/build. Use the project's normal build and preview flow. Do not point browser QA at production unless the task explicitly requires production verification.

## Viewports
Test at minimum:
- Desktop: 1440x900
- Mobile: 390x844
- Small mobile: 320x700

## Critical flows

### Home and navigation
- Home loads without a blank screen.
- Brand opening does not trap navigation.
- Main navigation and mobile menu open/close correctly.
- No horizontal overflow.
- Reduced-motion behavior remains usable.

### Catalog
- Catalog renders expected products.
- Search returns relevant matches.
- Brand/category filters do not cross-label products.
- Adidas/Nike and equivalent brand mix-ups are treated as failures.
- Product cards open the correct product detail.
- Product images load or fail gracefully.

### Product detail
- Correct product name/reference is shown.
- Gallery navigation works.
- Optional size and city fields accept input.
- Sticky/contact CTA remains usable on mobile.
- Closing the dialog restores focus/interaction correctly.

### WhatsApp conversion
- Generic CTA opens the intended WhatsApp flow.
- Product CTA includes the selected product context.
- Optional size/city appear only when entered.
- The app does not claim that a click equals a sent message or sale.
- WhatsApp failure must not destroy the current browsing state.

### Quiz / lead capture
- Quiz opens and closes.
- Steps move forward/back correctly.
- Completion produces the expected next action.
- Failed lead-record submission does not block WhatsApp.
- No unintended sensitive data is exposed in the browser.

## Technical checks
- No uncaught critical console errors in tested flows.
- No failed critical network request caused by the change.
- No dead internal route/link introduced.
- No broken image caused by the change.
- No desktop/mobile layout regression in affected areas.

## Evidence
For a meaningful UI change, keep:
- at least one desktop screenshot;
- at least one 390px screenshot;
- screenshots of any failing state found;
- exact test/build command output in the task report.

## Completion gate
Do not report a UI task complete until:
1. automated tests pass;
2. production build passes when applicable;
3. affected flows above have been exercised;
4. any failure found has either been fixed and re-tested or reported explicitly.
