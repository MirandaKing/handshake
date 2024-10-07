import { createPublicClient, http, pubKeyToAddress } from "viem";
import erc20Abi from "./ERC20ABI.json";
import erc721Abi from "./ERC721ABI.json";
import { getContract } from "viem";
const publicClient = createPublicClient({
  chain: {
    id: 1029, // BTTC Donau testnet chain ID
    rpcUrls: {
      public: "https://pre-rpc.bittorrentchain.io/", // BTTC Donau testnet RPC URL
    },
  },
  transport: http("https://pre-rpc.bittorrentchain.io/"), // Passing RPC URL to http function
});

export async function getTokenDetails(TokenAddress) {
  try {
    const contract = getContract({
      address: TokenAddress,
      abi: erc20Abi.abi,
      client: publicClient,
    });
    const name = await contract.read.name();
    const symbol = await contract.read.symbol();
    const decimals = await contract.read.decimals();
    const balance = await contract.read.balanceOf([
      "0xF0F21D6AAc534345E16C2DeE12c3998A4e32e789",
    ]);
    console.log(balance);
    return {
      name,
      symbol,
      decimals: decimals.toString(),
      balance: balance,
    };
  } catch (error) {
    console.log("loading token error", error.message);
    return null;
  }
}

export async function getNftDetails(address, tokenAddress, tokenId){
  try {
    const contract = getContract({
      address: tokenAddress,
      abi: erc721Abi.abi,
      client: publicClient,
    });
    const name = await contract.read.name();
    const symbol = await contract.read.symbol();
    const tokenUri = await contract.read.tokenURI([tokenId]);
    const balance = await contract.read.balanceOf([address]);
    const owner = await contract.read.ownerOf([tokenId])
    
    console.log("hi");
    console.log(name);
    
    return {
      name: name,
      symbol: symbol,
      tokenUri: tokenUri,
      balance: balance,
      owner: owner
    };
  } catch(error) {
    console.log(error);
    throw error; 
  }
}