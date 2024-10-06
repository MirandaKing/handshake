import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { bitTorrentTestnet } from "viem/chains";

export const useGasPrice = () => {
  const [gasPrice, setGasPrice] = (useState < bigint) | (null > null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = (useState < string) | (null > null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const client = createPublicClient({
          chain: bitTorrentTestnet, // You can dynamically set the chain as needed
          transport: http(),
        });

        const price = await client.getGasPrice();
        setGasPrice(price);
      } catch (err) {
        setError("Failed to fetch gas price");
      } finally {
        setLoading(false);
      }
    };

    fetchGasPrice();
  }, []);

  return { gasPrice, loading, error };
};
