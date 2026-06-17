import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-slate-50 to-white p-8 text-center">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-teal-600">
          Estateably
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Find your next place to call home.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          The clean, modern UK property portal. Buy, rent, or list — built for
          buyers, renters, sellers, landlords and agents.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Step 1 complete</p>
        <p className="mt-1 font-semibold text-slate-900">
          Project structure + Turso schema + DB connection ready
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-left text-xs text-slate-600 sm:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-2">
            <p className="font-semibold text-slate-900">prisma/</p>
            <p>schema.prisma, schema.sql</p>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <p className="font-semibold text-slate-900">src/lib/</p>
            <p>db.ts, format.ts</p>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <p className="font-semibold text-slate-900">scripts/</p>
            <p>push-schema, check-db</p>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <p className="font-semibold text-slate-900">Turso</p>
            <p>8 tables created ✓</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Awaiting confirmation to proceed to Step 2 (auth).
      </p>

      <Link
        href="https://github.com/Ujjval26/real-estate-demo"
        className="text-xs text-teal-600 underline-offset-2 hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        View on GitHub
      </Link>
    </main>
  );
}
