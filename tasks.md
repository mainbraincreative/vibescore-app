# VibeScore MVP – `tasks.md`

## GOAL
Deliver one unforgettable emotional moment: **paste a conversation → get a VibeScore → share a viral visual card.**

MVP is about emotional payoff first, infrastructure second.

---

## SECTION 1: Project Setup

### 1. Initialize Next.js project with TypeScript
- **Start**: Run `create-next-app` with TypeScript flag
- **End**: Local dev server shows default homepage

### 2. Install core dependencies
- **Start**: Install Tailwind CSS, PostCSS, Supabase, html2canvas
- **End**: Tailwind styles render correctly on test element

### 3. Create folder structure
- **Start**: Create `/components`, `/pages/api`, `/lib`, `/styles`, `/types`
- **End**: Each folder contains a dummy file

---

## SECTION 2: AI Vibe Analysis (Core Moment First)

### 4. Create API route stub
- **Start**: `pages/api/analyze.ts` returns hardcoded tone JSON
- **End**: Logs input, returns `{ score, label, flags }`

### 5. Add OpenAI helper
- **Start**: `lib/openai.ts` to wrap GPT-4o call
- **End**: Logs mock analysis output with prompt injection

### 6. Connect API to OpenAI
- **Start**: Update `analyze.ts` to use `openai.ts`
- **End**: Returns structured JSON: score, label, red flags, summary, emoji line, pull quote

---

## SECTION 3: Vibe Input & Shareable Result

### 7. Build Input Form
- **Start**: `components/VibeForm.tsx` – textarea + submit
- **End**: On submit, sends text to `/api/analyze`

### 8. Build Results Page
- **Start**: `pages/result.tsx` – show score, label, flags, pull quote
- **End**: Result from API displays cleanly after form submission

### 9. Build VibeScoreCard Component
- **Start**: `components/VibeScoreCard.tsx` – visual output block
- **End**: Color-coded card renders score, flags, summary

### 10. Add Shareable Export
- **Start**: Integrate `html2canvas` to export card as PNG
- **End**: "Download / Share" button works

---

## SECTION 4: Optional Auth (Post-Payoff)

### 11. Add Supabase Auth (Optional)
- **Start**: Install and configure Supabase client + env vars
- **End**: User can log in via magic link or Google

### 12. Save Result to DB (if logged in)
- **Start**: Create `vibe_checks` table with Supabase
- **End**: Store score metadata per user (not convo text)

### 13. Vibe History (Optional View)
- **Start**: Query and display past scores
- **End**: Table shows score, label, date

---

## SECTION 5: Polish & MVP Deployment

### 14. Add Toast Notifications
- **Start**: Use `react-hot-toast` or custom toaster
- **End**: Toast on analyze success/fail, login success

### 15. Add Mobile-Responsive Styling
- **Start**: Make VibeScoreCard stack vertically on mobile
- **End**: Looks clean and readable on all screen sizes

### 16. Final QA Test
- **Start**: Paste → Score → Share loop end-to-end
- **End**: No crashes, scores feel insightful, card downloads cleanly

### 17. Deploy to Vercel
- **Start**: Connect repo, add env vars
- **End**: Live on `vibescore.app` (or similar)

---

## OPTIONAL: Screenshot Upload Flow (Post-MVP)

### 18. Add screenshot upload input
- **Start**: File input for `.jpg/.png`
- **End**: Image preview or console log

### 19. Add OCR pipeline
- **Start**: Install Tesseract.js, create `lib/extractText.ts`
- **End**: Extracts convo text from screenshot

### 20. Connect OCR to scoring flow
- **Start**: Replace manual paste with parsed text
- **End**: Full flow from image → analysis → result
