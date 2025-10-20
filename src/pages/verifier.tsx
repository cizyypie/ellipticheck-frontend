import Head from "next/head";
import { FormEvent, useCallback, useMemo, useState } from "react";
import QRScanner from "@/components/QRScanner";
import { useToast } from "@/components/Toast";
import { useVerifier } from "@/hooks/useVerifier";

type VerificationStatus = "idle" | "success" | "error";

type MetadataHash = `0x${string}`;

type VerifyFormField =
  | "ticketId"
  | "owner"
  | "nonce"
  | "deadline"
  | "metadataHash"
  | "signature";

interface VerifyFormValues {
  ticketId: string;
  owner: string;
  nonce: string;
  deadline: string;
  metadataHash: string;
  signature: string;
}

function isHexAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function isValidBytes32(value: string): value is MetadataHash {
  const trimmed = value.trim();
  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  return /^[0-9a-fA-F]{64}$/.test(hex);
}

export default function VerifierPage() {
  const { verifySignature } = useVerifier();
  const { showToast } = useToast();

  const [form, setForm] = useState<VerifyFormValues>({
    ticketId: "",
    owner: "",
    nonce: "",
    deadline: "",
    metadataHash: "",
    signature: "",
  });
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const isFormComplete = useMemo(() => Object.values(form).every((value) => value.trim() !== ""), [form]);

  const updateField = useCallback(
    (field: VerifyFormField, value: string) => {
      setForm((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isFormComplete) {
        showToast({ type: "error", message: "Please complete all verification fields." });
        return;
      }
      if (!isHexAddress(form.owner)) {
        showToast({ type: "error", message: "Owner address must be a valid 0x-prefixed value." });
        return;
      }
      if (!isValidBytes32(form.metadataHash)) {
        showToast({ type: "error", message: "Metadata hash must be a 32-byte hex string." });
        return;
      }
      if (!form.signature.trim().startsWith("0x")) {
        showToast({ type: "error", message: "Signature must be a hex string starting with 0x." });
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await verifySignature();
        if (result.ok) {
          setStatus("success");
          setResultMessage("Ticket signature verified successfully.");
          showToast({ type: "success", message: "Ticket verified." });
        } else {
          setStatus("error");
          setResultMessage(result.reason);
          showToast({ type: "error", message: result.reason });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Verification failed.";
        setStatus("error");
        setResultMessage(message);
        showToast({ type: "error", message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isFormComplete, showToast, verifySignature],
  );

  const handleScanResult = useCallback(
    (payload: string) => {
      try {
        const parsed = JSON.parse(payload) as Partial<Record<VerifyFormField, string | number>>;
        setForm((previous) => ({
          ticketId: parsed.ticketId !== undefined ? String(parsed.ticketId) : previous.ticketId,
          owner: typeof parsed.owner === "string" ? parsed.owner : previous.owner,
          nonce: parsed.nonce !== undefined ? String(parsed.nonce) : previous.nonce,
          deadline: parsed.deadline !== undefined ? String(parsed.deadline) : previous.deadline,
          metadataHash:
            typeof parsed.metadataHash === "string"
              ? parsed.metadataHash
              : previous.metadataHash,
          signature: typeof parsed.signature === "string" ? parsed.signature : previous.signature,
        }));
        showToast({ type: "success", message: "QR data applied to the form." });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid QR payload.";
        showToast({ type: "error", message });
      }
    },
    [showToast],
  );

  const statusClasses: Record<VerificationStatus, string> = useMemo(
    () => ({
      idle: "bg-slate-100 text-slate-600",
      success: "bg-emerald-100 text-emerald-700",
      error: "bg-rose-100 text-rose-700",
    }),
    [],
  );

  return (
    <>
      <Head>
        <title>ElliptiCheck | Verifier Portal</title>
      </Head>
      <section className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Verifier Portal
          </span>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Verify ticket signatures effortlessly</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            Scan attendee QR codes, autofill verification details, and confirm authenticity with on-chain aware validation flows
            designed for front-of-house teams.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="ticketId" className="text-sm font-semibold text-slate-700">
                  Ticket ID
                </label>
                <input
                  id="ticketId"
                  name="ticketId"
                  type="number"
                  min={0}
                  value={form.ticketId}
                  onChange={(event) => updateField("ticketId", event.target.value)}
                  placeholder="101"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-emerald-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="owner" className="text-sm font-semibold text-slate-700">
                  Owner address
                </label>
                <input
                  id="owner"
                  name="owner"
                  type="text"
                  value={form.owner}
                  onChange={(event) => updateField("owner", event.target.value)}
                  placeholder="0x1234..."
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-emerald-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="nonce" className="text-sm font-semibold text-slate-700">
                  Nonce
                </label>
                <input
                  id="nonce"
                  name="nonce"
                  type="number"
                  min={0}
                  value={form.nonce}
                  onChange={(event) => updateField("nonce", event.target.value)}
                  placeholder="1"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-emerald-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="deadline" className="text-sm font-semibold text-slate-700">
                  Deadline (timestamp)
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="number"
                  min={0}
                  value={form.deadline}
                  onChange={(event) => updateField("deadline", event.target.value)}
                  placeholder="1737062400"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-emerald-300 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="metadataHash" className="text-sm font-semibold text-slate-700">
                Metadata Hash (bytes32)
              </label>
              <input
                id="metadataHash"
                name="metadataHash"
                type="text"
                value={form.metadataHash}
                onChange={(event) => updateField("metadataHash", event.target.value)}
                placeholder="0x..."
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-emerald-300 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="signature" className="text-sm font-semibold text-slate-700">
                Signature
              </label>
              <textarea
                id="signature"
                name="signature"
                rows={3}
                value={form.signature}
                onChange={(event) => updateField("signature", event.target.value)}
                placeholder="0x..."
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-emerald-300 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                Scan QR
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSubmitting ? "Verifying…" : "Verify Ticket"}
              </button>
            </div>
          </form>

          <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Verification status</h2>
            <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${statusClasses[status]}`}>
              {status === "idle" ? "Awaiting verification" : resultMessage}
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p>Use QR scanning to speed up check-in. QR payloads should include ticketId, owner, nonce, deadline, metadataHash, and signature.</p>
              <p>Ensure the deadline has not passed and the signature comes from the trusted issuer wallet.</p>
              <p className="text-xs text-slate-500">These checks mimic the on-chain TicketVerifier contract logic.</p>
            </div>
          </aside>
        </div>
      </section>

      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanResult}
      />
    </>
  );
}