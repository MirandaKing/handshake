"use client";

import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  createPublicClient,
  formatUnits,
  parseSignature,
  http,
  createWalletClient,
  custom,
} from "viem";
import { useAccount } from "wagmi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import handshakeABI from "../../transaction-queue/[id]/handshakeABI.json";
import TransactionAccordion from "../test/TransactionAccordion";

const TransactionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  height: "auto",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center", // Align items vertically centered
  border: "1px solid", // Optional: Add a border for visibility
  marginBottom: theme.spacing(1), // Space between transactions
}));

const InfoItem = styled("div")(({ theme }) => ({
  margin: theme.spacing(1), // Space between info items
}));

const Sponsored = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const [transactions, setTransaction] = useState([]);

  const handleSponsoredTxExecute = async (transaction) => {
    setIsLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: {
          id: 1029,
          rpcUrls: {
            public: "https://pre-rpc.bittorrentchain.io/",
          },
        },
        transport: http("https://pre-rpc.bittorrentchain.io/"),
      });

      const permitsignaturs = transaction.permitSignature;
      const { v, r, s } = parseSignature(permitsignaturs);
      const TransactionDetails = [
        transaction.senderAddress,
        transaction.receiverAddress,
        transaction.tokenAddress,
        transaction.amount,
        transaction.deadline,
        transaction.nonce,
      ];

      const args = [
        transaction.senderSignature,
        transaction.receiverSignature,
        transaction.deadline,
        TransactionDetails,
        v,
        r,
        s,
      ];

      const { request } = await publicClient.simulateContract({
        account: address,
        address: `${process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS}`,
        abi: handshakeABI.abi,
        functionName: "transferFromWithPermit",
        args,
        gasLimit: 3000000,
      });

      let walletClient;
      if (typeof window !== "undefined" && window.ethereum) {
        walletClient = createWalletClient({
          chain: {
            id: 1029,
            rpcUrls: {
              public: "https://pre-rpc.bittorrentchain.io/",
              websocket: "https://pre-rpc.bittorrentchain.io/",
            },
          },
          transport: custom(window.ethereum),
        });
      }

      const execute = await walletClient.writeContract(request);
      if (execute) {
        await publicClient.waitForTransactionReceipt({ hash: execute });
      } else {
        console.log("transaction hash is undefined");
      }

      if (execute) {
        const userData = {
          TransactionId: transaction.TransactionId,
          status: "completed",
          transectionDate: new Date().toISOString(),
          transactionHash: execute,
        };

        try {
          let result = await fetch(`/api/payment-completed`, {
            method: "PUT",
            body: JSON.stringify(userData),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const response = await result.json();
          console.log("Payment update response: ", response);
        } catch (error) {
          console.error("Error updating payment status:", error);
        }

        toast.success("Transaction executed successfully");
      }
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to execute transaction");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      const fetchTransactions = async () => {
        const url = `/api/fetch-sponsored-transaction`;
        try {
          const response = await fetch(url, { cache: "no-store" });
          const data = await response.json();
          console.log(data);
          setTransaction(data);
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
        }
      };
      fetchTransactions();
    }
  }, [address]);

  return (
    <div>
      <h1 className="text-black font-semibold text-xl my-4">
        Sponsored Transactions
      </h1>
      {/* <Grid container spacing={3}>
        {transactions.map((transaction, index) => (
          <Grid item xs={12} key={index}>
            <TransactionPaper elevation={3}>
              <InfoItem>
                <Typography variant="subtitle1">{index + 1}</Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Amount:{" "}
                  {transaction.isNFT
                    ? "NFT"
                    : `${formatUnits(
                        transaction.amount,
                        transaction.decimals
                      )} ${transaction.tokenName}`}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Sender: {transaction.senderAddress.slice(0, 6)}...
                  {transaction.senderAddress.slice(-4)}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Receiver: {transaction.receiverAddress.slice(0, 6)}...
                  {transaction.receiverAddress.slice(-4)}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Token Address: {transaction.tokenAddress.slice(0, 6)}...
                  {transaction.tokenAddress.slice(-4)}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Initiated:{" "}
                  {new Date(transaction.initiateDate).toLocaleString()}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Deadline:{" "}
                  {new Date(
                    parseInt(transaction.deadline) * 1000
                  ).toLocaleString()}
                </Typography>
              </InfoItem>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSponsoredTxExecute(transaction)}
                disabled={isLoading || transaction.status !== "approved"}
              >
                {isLoading ? "Executing..." : "Execute"}
              </Button>
            </TransactionPaper>
          </Grid>
        ))}
      </Grid> */}
      <TransactionAccordion
        transactions={transactions}
        isSponsorTab={true}
        handleSponsoredTxExecute={handleSponsoredTxExecute}
      />
      {transactions.length === 0 && (
        <Typography
          variant="body1"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          No sponsored transactions found.
        </Typography>
      )}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default Sponsored;
