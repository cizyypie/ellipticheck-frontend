import VerifyAccess from "@/components/VerifyAccess";

export default function VerifierPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-semibold mb-4 text-green-700">
        🔍 Verifier Portal
      </h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Verify the legitimacy of an NFT ticket signature and check its expiry.
      </p>
      <VerifyAccess />
    </main>
  );
}
