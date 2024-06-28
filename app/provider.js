"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  bitTorrentTestnet,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();

const bittorrentchainTestnet = {
  id: 1029,
  name: "BitTorrent Chain Donau",
  nativeCurrency: {
    decimals: 18,
    name: "BitTorrent Chain Donau",
    symbol: "BTT",
  },
  rpcUrls: {
    default: { http: ["https://pre-rpc.bittorrentchain.io/"] },
  },
  blockExplorers: {
    default: { name: "bttc scan", url: "https://testscan.bittorrentchain.io/" },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: "Handshake",
  projectId: "YOUR_PROJECT_ID",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [
    bittorrentchainTestnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
