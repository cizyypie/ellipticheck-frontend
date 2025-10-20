"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface ConnectorButtonProps {
  name: string;
  onClick: () => void;
  disabled: boolean;
}

function ConnectorButton({ name, onClick, disabled }: ConnectorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {name}
    </button>
  );
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletButton() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  const isConnected = !isDisconnected && Boolean(address);
  const connectionStatus = useMemo(() => {
    if (connectStatus === "connecting" || isConnecting) return "Connecting";
    if (connectStatus === "reconnecting") return "Reconnecting";
    return null;
  }, [connectStatus, isConnecting]);

  const handleConnectorClick = (connectorId: string) => {
    const connector = connectors.find((item) => item.id === connectorId);
    if (!connector) {
      return;
    }
    connect({ connector });
    setOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {isConnected && address ? (
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 sm:inline-flex">
            {truncateAddress(address)}
          </span>
          <button
            type="button"
            onClick={() => disconnect()}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            {connectionStatus ?? "Connect Wallet"}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Available Wallets
              </div>
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <ConnectorButton
                    key={connector.id}
                    name={connector.name}
                    onClick={() => handleConnectorClick(connector.id)}
                    disabled={!connector.ready}
                  />
                ))}
              </div>
              {connectError && (
                <p className="mt-3 text-xs text-rose-500">
                  {connectError.message ?? "Connection failed"}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}