import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        🎟️ ElliptiCheck NFT Ticketing DApp
      </h1>
      <p className="text-gray-600 text-center max-w-lg">
        A blockchain-based ECDSA verification system for authentic NFT ticket
        ownership — preventing replay attacks and ticket forgery.
      </p>
      <div className="flex gap-6 mt-8">
        <Link
          href="/issuer"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          🎫 Issuer Portal
        </Link>
        <Link
          href="/verifier"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          🔍 Verifier Portal
        </Link>
      </div>
      <footer className="absolute bottom-6 text-gray-400 text-sm">
        ElliptiCheck — Blockchain NFT Ticket Verification Research (2025)
      </footer>
    </main>
  );
}
