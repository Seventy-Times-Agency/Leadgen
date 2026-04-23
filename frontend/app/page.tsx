import { HealthBadge } from "@/components/HealthBadge";

/**
 * Landing page.
 *
 * For the internal-use phase this is just a status-check surface + a
 * "what this thing does" blurb. Once the dashboard is wired up, this
 * becomes the marketing page and /dashboard gets the authenticated UI.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-neutral-500">
          Seventy Times Agency · Lead Generator
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Find qualified B2B leads <br /> in under two minutes.
        </h1>
        <p className="max-w-xl text-lg text-neutral-300">
          Describe what you're looking for — the bot pulls the matching
          companies from Google Maps, reads their websites and reviews, and
          hands back a ready-to-contact base with AI-written outreach.
        </p>
      </section>

      <HealthBadge />

      <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Web UI scaffolding. The Telegram bot is fully functional right now;
          this page will host the dashboard, search flow and live progress
          stream as the backend routes are wired in.
        </p>
      </section>
    </main>
  );
}
