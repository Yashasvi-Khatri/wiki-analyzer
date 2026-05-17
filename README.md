# WikiLens — Wikipedia Category Analyzer

A modern Next.js application that analyzes Wikipedia categories and visualizes word frequencies across articles.

## Features

- Analyze any Wikipedia category
- Visualize top 50 most frequent words
- View scanned articles with direct links
- Beautiful dark UI with Tailwind CSS
- No API key required (uses free Wikipedia API)

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React** - UI library

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Vercel Deployment

This project is optimized for Vercel deployment.

### Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure settings
4. Click **Deploy**

### Environment Variables

No environment variables are required for this project as it uses the free Wikipedia API.

## Project Structure

```
wiki-analyzer/
├── src/
│   └── app/
│       ├── api/
│       │   └── analyze/
│       │       └── route.ts    # Wikipedia API integration
│       ├── globals.css         # Global styles
│       ├── layout.tsx          # Root layout
│       └── page.tsx            # Main page component
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## API Endpoints

- `POST /api/analyze` - Analyzes a Wikipedia category and returns word frequency data

## License

MIT
