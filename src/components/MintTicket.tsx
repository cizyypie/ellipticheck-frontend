import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Contract, BrowserProvider } from "ethers";
import { TICKET_NFT_ADDRESS, TICKET_NFT_ABI } from "@/lib/contracts";

export default function MintTicket() {
  const { data: walletClient } = useWalletClient();
  const [eventId, setEventId] = useState("");
  const [metadataHash, setMetadataHash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

const handleMint = async (): Promise<void> => {
  if (!walletClient) return alert("Wallet not connected!");
  if (!eventId) return alert("Please enter an Event ID!");
  if (!metadataHash) return alert("Please enter a metadata hash!");

  setLoading(true);
  try {
    const provider = new BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const contract = new Contract(TICKET_NFT_ADDRESS, TICKET_NFT_ABI, signer);

    const to = await signer.getAddress();
    const eventIdNum = BigInt(eventId);

    const validHash = metadataHash.startsWith("0x")
      ? metadataHash
      : "0x" + metadataHash.padEnd(64, "0");

    const tx = await contract.mintTicket(to, eventIdNum, validHash);
    await tx.wait();

    setTxHash(tx.hash);
    alert("✅ Ticket minted successfully!");
  } catch (err: unknown) {
    console.error("Mint error:", err);

    if (err instanceof Error) {
      alert(`Mint failed: ${err.message}`);
    } else if (typeof err === "object" && err !== null && "reason" in err) {
      const reason = (err as { reason?: string }).reason ?? "Unknown reason";
      alert(`Mint failed: ${reason}`);
    } else {
      alert("Mint failed: Unknown error");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow space-y-3">
      <h2 className="text-xl font-semibold text-center">🎟️ Mint Ticket</h2>
      <input
        type="number"
        placeholder="Event ID"
        className="border p-2 rounded w-full"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Metadata Hash (bytes32)"
        className="border p-2 rounded w-full"
        value={metadataHash}
        onChange={(e) => setMetadataHash(e.target.value)}
      />
      <button
        disabled={loading}
        onClick={handleMint}
        className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700"
      >
        {loading ? "Minting..." : "Mint Ticket"}
      </button>
      {txHash && (
        <p className="text-sm text-gray-500 break-all">
          Tx Hash: {txHash}
        </p>
      )}
    </div>
  );
}
