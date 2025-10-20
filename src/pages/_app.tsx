import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { wagmiConfig } from "@/lib/wagmiConfig";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#2563eb",
            accentColorForeground: "#ffffff",
            borderRadius: "large",
            fontStack: "rounded",
          })}
        >
          <ToastProvider>
            <div className="min-h-screen bg-slate-50 text-slate-900">
              <Navbar />
              <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                <Component {...pageProps} />
              </main>
            </div>
          </ToastProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}