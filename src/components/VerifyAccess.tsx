import { useState } from "react";
import { useWalletClient } from "wagmi";
import { BrowserProvider, Contract } from "ethers";
import { TICKET_VERIFIER_ADDRESS, TICKET_VERIFIER_ABI } from "@/lib/contracts";

export default function VerifyAccess() {
  const { data: walletClient } = useWalletClient();
  const [ticketId, setTicketId] = useState("");
  const [owner, setOwner] = useState("");
  const [nonce, setNonce] = useState("");
  const [deadline, setDeadline] = useState("");
  const [metadataHash, setMetadataHash] = useState("");
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState("");

  const handleVerify = async () => {
    if (!walletClient) return alert("Wallet not connected!");
    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new Contract(
        TICKET_VERIFIER_ADDRESS,
        TICKET_VERIFIER_ABI,
        signer
      );
      const tx = await contract.verifyAccess(
        ticketId,
        owner,
        nonce,
        deadline,
        metadataHash,
        signature
      );
      await tx.wait();
      setResult("✅ Access verified");
    } catch (err) {
      console.error(err);
      setResult("❌ Verification failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow space-y-3">
      <h2 className="text-xl font-semibold text-center">🔍 Verify Access</h2>
      <input placeholder="Ticket ID" className="border p-2 rounded w-full" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
      <input placeholder="Owner Address" className="border p-2 rounded w-full" value={owner} onChange={(e) => setOwner(e.target.value)} />
      <input placeholder="Nonce" className="border p-2 rounded w-full" value={nonce} onChange={(e) => setNonce(e.target.value)} />
      <input placeholder="Deadline (timestamp)" className="border p-2 rounded w-full" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      <input placeholder="Metadata Hash" className="border p-2 rounded w-full" value={metadataHash} onChange={(e) => setMetadataHash(e.target.value)} />
      <input placeholder="Signature (0x...)" className="border p-2 rounded w-full" value={signature} onChange={(e) => setSignature(e.target.value)} />
      <button onClick={handleVerify} className="bg-green-600 text-white p-2 rounded w-full hover:bg-green-700">
        Verify Ticket
      </button>
      {result && <p className="text-center mt-2">{result}</p>}
    </div>
  );
}
