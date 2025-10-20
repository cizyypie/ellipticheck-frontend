import Head from "next/head";
import Link from "next/link";

interface PortalCardProps {
  title: string;
  description: string;
  href: string;
  accent: "blue" | "green";
}

function PortalCard({ title, description, href, accent }: PortalCardProps) {
  const accentClasses =
    accent === "blue"
      ? "from-blue-500/10 to-blue-500/0 border-blue-200 hover:border-blue-300"
      : "from-emerald-500/10 to-emerald-500/0 border-emerald-200 hover:border-emerald-300";

  return (
    <div className={`flex flex-1 flex-col gap-4 rounded-3xl border bg-gradient-to-br p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${accentClasses}`}>
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="mt-auto">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Enter portal
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>ElliptiCheck | NFT Ticketing</title>
      </Head>
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-12 pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
              Secure ticketing for Web3 events
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Mint and verify event tickets with confidence
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              ElliptiCheck combines NFT ownership, EIP-712 signatures, and anti-replay protection to deliver a seamless ticketing
              experience for issuers and verifiers alike.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">EIP-712 Signatures</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">On-chain ownership</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">Real-time verification</span>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Start your journey</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Choose the portal that matches your role. Issuers can mint new tickets and manage metadata, while verifiers validate
                attendee signatures on-site or remotely.
              </p>
              <div className="grid gap-4">
                <Link
                  href="/issuer"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-slate-900"
                >
                  Go to Issuer Portal
                </Link>
                <Link
                  href="/verifier"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-slate-900"
                >
                  Go to Verifier Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <PortalCard
            title="Issuer Portal"
            description="Deploy new tickets, capture metadata hashes, and get instant feedback on blockchain transactions."
            href="/issuer"
            accent="blue"
          />
          <PortalCard
            title="Verifier Portal"
            description="Scan attendee QR codes, validate signatures, and stop replay attacks with built-in anti-fraud guards."
            href="/verifier"
            accent="green"
          />
        </div>
      </section>
    </>
  );
}