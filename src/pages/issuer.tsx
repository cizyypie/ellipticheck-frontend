import Head from "next/head";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useTicketNft } from "@/hooks/useTicketNft";
import { useToast } from "@/components/Toast";

type MetadataHash = `0x${string}`;

interface MintedTicket {
  ticketId: number;
  eventId: number;
  metadataHash: MetadataHash;
  txHash: `0x${string}`;
  mintedAt: string;
}

const MOCK_TICKETS: MintedTicket[] = [
  {
    ticketId: 101,
    eventId: 4201,
    metadataHash: "0xa5f4c8f7e72c6fa4ed278c4d63cfbd24d26f2d79da6df75dca42d8de7a9b3f11",
    txHash: "0x9f0f2c7d1a5b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    mintedAt: "2025-01-05 14:12",
  },
  {
    ticketId: 102,
    eventId: 4201,
    metadataHash: "0xb3d2a1f9c8e7d6c5b4a39281706f5e4d3c2b1a0987654321ffeeddccbbaa9988",
    txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    mintedAt: "2025-01-12 09:30",
  },
];

function isValidBytes32(value: string): value is MetadataHash {
  const trimmed = value.trim();
  const withoutPrefix = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (withoutPrefix.length !== 64) {
    return false;
  }
  return /^[0-9a-fA-F]{64}$/.test(withoutPrefix);
}

function normalizeMetadataHash(value: string): MetadataHash | null {
  if (!isValidBytes32(value)) {
    return null;
  }
  const trimmed = value.trim();
  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  return `0x${hex.toLowerCase()}`;
}

export default function IssuerPage() {
  const { mint } = useTicketNft();
  const { showToast } = useToast();

  const [eventId, setEventId] = useState<string>("");
  const [metadataHash, setMetadataHash] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<MintedTicket[]>(MOCK_TICKETS);

  const isFormValid = useMemo(() => {
    if (!eventId || Number(eventId) <= 0) {
      return false;
    }
    return Boolean(metadataHash && isValidBytes32(metadataHash));
  }, [eventId, metadataHash]);

  const handleMint = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!eventId || Number(eventId) <= 0) {
        showToast({ type: "error", message: "Please provide a valid event ID." });
        return;
      }
      const normalizedHash = normalizeMetadataHash(metadataHash);
      if (!normalizedHash) {
        showToast({ type: "error", message: "Metadata hash must be a valid bytes32 value." });
        return;
      }
      setIsSubmitting(true);
      try {
        const eventIdValue = BigInt(eventId);
        const result = await mint(eventIdValue, normalizedHash);
        const mintedTicket: MintedTicket = {
          ticketId: Number(result.ticketId),
          eventId: Number(eventIdValue),
          metadataHash: normalizedHash,
          txHash: result.txHash,
          mintedAt: new Date().toLocaleString(),
        };
        setTickets((previous) => [mintedTicket, ...previous]);
        setEventId("");
        setMetadataHash("");
        showToast({
          type: "success",
          message: `Ticket #${mintedTicket.ticketId} minted successfully!`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to mint ticket";
        showToast({ type: "error", message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, metadataHash, mint, showToast],
  );

  return (
    <>
      <Head>
        <title>ElliptiCheck | Issuer Portal</title>
      </Head>
      <section className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Issuer Portal
          </span>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Mint ticket NFTs in seconds</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            Generate event tickets, embed metadata hashes, and keep an auditable trail of blockchain transactions. Connect your
            wallet to publish tickets on-chain once ready.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <form
            onSubmit={handleMint}
            className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
          >
            <div className="space-y-1">
              <label htmlFor="eventId" className="text-sm font-semibold text-slate-700">
                Event ID
              </label>
              <input
                id="eventId"
                name="eventId"
                type="number"
                min={1}
                required
                value={eventId}
                onChange={(inputEvent) => setEventId(inputEvent.target.value)}
                placeholder="4201"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-blue-300 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="metadataHash" className="text-sm font-semibold text-slate-700">
                Metadata Hash (bytes32)
              </label>
              <input
                id="metadataHash"
                name="metadataHash"
                type="text"
                required
                value={metadataHash}
                onChange={(inputEvent) => setMetadataHash(inputEvent.target.value)}
                placeholder="0x..."
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-blue-300 focus:outline-none"
              />
              <p className="text-xs text-slate-500">
                Provide a 32-byte hex string. We accept both prefixed and non-prefixed values.
              </p>
            </div>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? "Minting…" : "Mint Ticket"}
            </button>
          </form>

          <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Minting checklist</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
                <span>Confirm your wallet connection before deploying real tickets.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
                <span>Metadata hashes should represent off-chain ticket details stored securely.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
                <span>Track transaction hashes below for future reconciliation.</span>
              </li>
            </ul>
          </aside>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent mints</h2>
            <span className="text-sm text-slate-500">Showing {tickets.length} ticket(s)</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((ticket) => (
              <div
                key={`${ticket.ticketId}-${ticket.txHash}`}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600">Ticket #{ticket.ticketId}</span>
                  <span className="text-xs text-slate-500">Event {ticket.eventId}</span>
                </div>
                <div className="text-xs text-slate-500">Minted {ticket.mintedAt}</div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metadata hash</p>
                  <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 break-all">
                    {ticket.metadataHash}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction hash</p>
                  <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 break-all">
                    {ticket.txHash}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}