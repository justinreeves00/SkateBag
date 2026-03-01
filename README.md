# SkateBag 🛹

SkateBag is a modern skateboarding trick tracker and progression app. It helps you keep track of every trick you've landed, locked down, or still need to learn, with a comprehensive database of over 500 tricks.

## Features

- **Massive Trick Database:** 524 unique tricks across Flatground, Street, Vert, Freestyle, and more.
- **Progress Tracking:** Mark tricks as "Landed" or "Locked" to visualize your growth.
- **Trick Dice:** Get a random trick to practice, filtered by your current level or category.
- **Tutorials:** One-click access to YouTube tutorials for every single trick.
- **Authentication:** Secure Google Sign-in to save your progress across devices.
- **Modern UI:** Clean, dark-themed interface built for quick use at the skatepark.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google Cloud Console project (for Auth)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/justinreeves00/SkateBag.git
   cd SkateBag
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Database Setup:
   Initialize your Supabase database using the provided seed file:
   ```bash
   supabase db push
   ```

## License

MIT
