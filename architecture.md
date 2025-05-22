/vibescore-app
├── public/                     # Static assets (images, favicons, etc.)
├── src/
│   ├── app/                   # Next.js App Router directory
│   │   ├── layout.tsx        # Shared layout
│   │   ├── page.tsx          # Landing Page
│   │   ├── dashboard/        # Authenticated dashboard
│   │   │   ├── page.tsx      # Dashboard Home (Vibe Analyzer UI)
│   │   │   ├── results/      # Results Page
│   │   │   │   └── [id]/page.tsx
│   │   ├── api/              # Route handlers (Next.js API routes)
│   │   │   └── vibe/score.ts # POST handler for analyzing text
│   ├── components/           # Shared UI components
│   │   ├── VibeForm.tsx
│   │   ├── VibeResult.tsx
│   │   ├── AuthGuard.tsx
│   │   └── NavBar.tsx
│   ├── lib/                  # Utility functions + API clients
│   │   ├── supabaseClient.ts # Supabase client initialization
│   │   ├── openai.ts         # Vibe scoring logic via OpenAI API
│   │   └── extractText.ts    # (Optional) OCR / screenshot processing
│   ├── context/              # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/                # Custom hooks
│   │   └── useUser.ts
│   ├── styles/               # Tailwind or CSS Modules
│   └── types/                # Global TypeScript types
│       └── index.ts
├── .env.local                # Environment variables (API keys, URLs)
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind CSS config (if used)
├── tsconfig.json             # TypeScript config
└── README.md
