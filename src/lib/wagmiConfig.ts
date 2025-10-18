import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { anvil } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "ElliptiCheck",
  projectId: "24e57c6a3b887284a36adf7cc5d24b9b",
  chains: [anvil],
  transports: {
    [anvil.id]: http("http://localhost:8545"),
  },
});
