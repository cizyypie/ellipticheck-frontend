export interface VerificationSuccess {
  ok: true;
}

export interface VerificationError {
  ok: false;
  reason: string;
}

export type VerificationResult = VerificationSuccess | VerificationError;

export function useVerifier() {
  async function verifySignature(): Promise<VerificationResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return Math.random() > 0.5
      ? { ok: true }
      : { ok: false, reason: "Invalid signature" };
  }

  return { verifySignature };
}