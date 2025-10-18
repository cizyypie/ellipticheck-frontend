import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function MintTicket() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null; // prevents hydration mismatch

  return (
    <div className="flex flex-col items-center gap-4">
      {isConnected ? (
        <>
          <p>Connected: {address}</p>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={status === "pending"}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {connector.name}
            </button>
          ))}
          {error && <p className="text-red-500">{error.message}</p>}
        </>
      )}
    </div>
  );
}
