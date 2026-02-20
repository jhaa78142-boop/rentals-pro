# Mumbai Rentals — Premium Landing Page v2

A conversion-optimised, mobile-first React + TypeScript + Vite landing page for Mumbai Western Suburbs rentals (Malad / Kandivali / Borivali).

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Add your Apps Script URL to VITE_LEAD_API_URL in .env.local

# 3. Run dev server
npm run dev
```

> If `VITE_LEAD_API_URL` is missing, a yellow banner will appear at the bottom of the page.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_LEAD_API_URL` | Your Google Apps Script Web App `/exec` URL |

---

## Key Features (v2)

### A — Premium UI/UX
- SaaS-style sticky navbar with dark mode toggle (persisted to `localStorage`)
- Framer Motion page-load & section reveal animations
- Confetti micro-animation on successful lead submission
- Sonner toast notifications (top-right)

### B — Multi-Step Lead Form (3 Steps)
- **Step 1** — Area, Locality, Budget slider, BHK, Furnishing
- **Step 2** — Move-in timeline, Profile, Notes
- **Step 3** — Name + WhatsApp contact + full review summary
- React Hook Form + Zod validation with friendly inline errors
- **Lead Quality Score** badge (Hot / Warm / Planning Ahead) based on move-in timeline
- Honeypot anti-spam field + 60-second rate limiting + double-submit prevention
- Post-submit: Lead ID display + Copy button + WhatsApp & Call CTAs + confetti

### C — WhatsApp Growth
- Floating WhatsApp FAB with pre-filled message from form values
- After submit: "Send WhatsApp Now" with auto-generated message
- Local analytics in `localStorage` (`mr_events`): view_form_step, completed_step, submit_success, whatsapp_click

### D — Trust + Differentiation
- WhySection: "Why we don't show listings" + trust badges
- Response time promise: 10–15 minutes
- "What you get" checklist + testimonials

### E — Code Quality
- Feature-based structure: `src/features/lead-form/`, `src/features/lead-resume/`
- Typed API client: `submitLead(payload) → LeadResult`
- Robust error handling + Sonner toasts + retry
- Environment validation banner

---

## API Contract (unchanged)

`POST VITE_LEAD_API_URL` — `Content-Type: text/plain;charset=utf-8`

Fields sent: `name, phone, area, locality, budgetRange, bhk, furnishing, moveIn, profile, notes, source="Website", abVariant, createdAtIso, landingUrl, device`

Expected response: `{ "leadId": "ABC123" }` or `{ "id": "ABC123" }`

---

## Deploy to Vercel

```bash
npm run build   # production build
npm run preview # local preview
```

1. Push to GitHub → Import in Vercel
2. Add `VITE_LEAD_API_URL` in Vercel → Settings → Environment Variables
3. Deploy

---

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · React Hook Form · Zod · Sonner · Lucide React · React Router v6

---

## Manual QA Checklist

- [ ] `npm install && npm run dev` starts without errors
- [ ] Yellow banner appears if `VITE_LEAD_API_URL` not set
- [ ] Dark mode toggle in navbar persists on refresh
- [ ] Hero mini-form pre-fills the lead form below
- [ ] Step 1 → Cannot proceed without BHK + Furnishing
- [ ] Step 2 → Lead score badge changes with move-in selection
- [ ] Step 3 → Phone rejects non-10-digit input
- [ ] Submit → spinner, double-submit blocked
- [ ] Success panel: Lead ID + confetti + WhatsApp CTA
- [ ] WhatsApp FAB opens with pre-filled message from form values
- [ ] 60s rate limit works (submit twice quickly → error shown)
- [ ] `localStorage` `mr_events` key populated after form steps
- [ ] Responsive on 375px mobile and 1440px desktop
