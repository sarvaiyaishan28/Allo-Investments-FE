# Allo-Investments Frontend

This is the frontend application for Allo-Investments, built with [Next.js](https://nextjs.org/), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) (Headless UI components)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Backend as a Service**: [Supabase](https://supabase.com/)

## Getting Started

First, make sure to install the dependencies. The project appears to use `pnpm` based on the lockfile, but you can also use `npm` or `yarn`.

```bash
pnpm install
# or
npm install
# or
yarn install
```

Next, set up your environment variables. Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Then, run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (including Radix UI based components).
- `/hooks`: Custom React hooks.
- `/lib`: Utility functions and shared logic.
- `/public`: Static assets.
- `/styles`: Global styles and CSS configurations.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
