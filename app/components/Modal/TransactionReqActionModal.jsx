"use client";

import React, { useState } from "react";
import "./Modal.css";
import { getTokenDetails } from "@/app/quickaccess/getTokenDetails";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { createWalletClient, custom } from "viem";

const TransactionReqActionModal = ({ onClose }) => {
  const { address, isConnected } = useAccount();

  const [transaction, setTransaction] = useState({
    sender: "",
    receiver: "",
    token: "",
    amount: "",
  });
  const [isERC20, setIsERC20] = useState(false);
  const defaultTokenDetails = {
    name: null,
    symbol: null,
    decimals: null,
    balance: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);

  // Handle onchange event for input fields and update the transaction state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction({ ...transaction, [name]: value });
  };

  const loadTokenDetails = async () => {
    console.log(transaction.token, address);
    console.log(await getTokenDetails(transaction.token));
    const getToken = await getTokenDetails(transaction.token);
    if (getToken !== null) {
      setTokenDetails(getToken);
    }
  };

  const handleCheckboxChange = () => {
    setIsERC20(!isERC20);
  };

  const signTransaction = async () => {
    // if (recipient === "" || amount === "") {
    //   console.log("Please Enter Details");
    //   return;
    // }
    // if (!isValidAddress(recipient)) {
    //   console.log("invalid Ethereum Address");
    //   return;
    // }
    // if (!isValidValue(amount)) {
    //   console.log("Invalid Amount");
    //   return;
    // }
    // const { ethereum } = window;
    // if (!ethereum) {
    //   throw new Error("Metamask is not installed, please install!");
    // }
    // let amount = parseUnits(transaction.amount, tokenDetails.decimals);
    // console.log(amount);

    try {
      const client = createWalletClient({
        chain: {
          id: 1029, // BTTC Donau testnet chain ID
          rpcUrls: {
            public: "https://pre-rpc.bittorrentchain.io/",
            websocket: "https://pre-rpc.bittorrentchain.io/", // WebSocket URL (optional)
          },
        },
        transport: custom(window.ethereum),
      });

      const signature = await client.signTypedData({
        account: address,
        domain: {
          name: "HandshakeTokenTransfer",
          version: "1",
          chainId: "1029",
          verifyingContract: "0xf6f9791c7eE8CbE0eD5876B653e6F195798eA9d2",
        },
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          initiateTransaction: [
            { name: "sender", type: "address" },
            { name: "receiver", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "tokenName", type: "string" },
          ],
        },
        primaryType: "initiateTransaction",
        message: {
          sender: address,
          receiver: transaction.receiver,
          amount: 1,
          tokenName: tokenDetails.symbol,
        },
      });

      console.log("Signature:", signature);
      if (signature) {
        const userData = {
          senderAddress: address,
          receiverAddress: transaction.receiver,
          amount: 1,
          tokenAddress: transaction.token,
          senderSignature: signature,
          receiverSignature: "",
          status: "inititated",
        };
        console.log(userData);
        try {
          console.log("entered into try block");
          let result = await fetch(`api/store-transaction`, {
            method: "POST",
            body: JSON.stringify(userData),
          });
          const response = await result.json();
          // console.log(response.message);
        } catch (error) {
          console.error("Error signing transaction:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }
  };
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-card">
          <h1 className="text-center">Send Transaction</h1>

          <div className="my-6 flex flex-col item-center justify-center w-full">
            <div className="w-full inputParent">
              <label>Receiver:</label>
              <input
                type="text"
                name="receiver"
                placeholder="Receiver's Address"
                value={transaction.receiver || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="w-full inputParent">
              <label>Type:</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isERC20}
                  onChange={handleCheckboxChange}
                />
                <span className="ml-2">Send ERC-20 Token</span>
              </div>
            </div>

            {isERC20 && (
              <div className="w-full inputParent">
                <label>Token:</label>
                <input
                  type="text"
                  name="token"
                  placeholder="Token Address"
                  value={transaction.token || ""}
                  onChange={handleInputChange}
                />
                <button onClick={loadTokenDetails}>Load Token</button>
              </div>
            )}
            {tokenDetails.name && (
              <div className="token-details">
                <p>Name: {tokenDetails.name}</p>
                <p>Symbol: {tokenDetails.symbol}</p>
                <p>
                  Total Balance:{" "}
                  {tokenDetails.balance
                    ? `${formatUnits(
                        tokenDetails.balance,
                        tokenDetails.decimals
                      )} ${tokenDetails.symbol}`
                    : null}
                </p>
              </div>
            )}

            <div className="w-full inputParent">
              <label>Amount:</label>
              <input
                type="text"
                name="amount"
                placeholder="Enter Amount"
                value={transaction.amount || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="w-full inputParent">
              <button className="sendReqBtn" onClick={signTransaction}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReqActionModal;