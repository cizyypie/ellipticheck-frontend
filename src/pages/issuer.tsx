import MintTicket from "@/components/MintTicket";

export default function IssuerPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-semibold mb-4 text-blue-700">
        🎫 Issuer Portal
      </h2>
      <p className="text-gray-500 mb-6">
        Mint a new NFT ticket and register its metadata hash.
      </p>
      <MintTicket />
    </main>
  );
}
