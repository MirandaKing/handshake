"use client";

import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createPublicClient, formatUnits, parseSignature, http, createWalletClient, custom } from "viem";
import { useAccount } from "wagmi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import handshakeABI from "../../transaction-queue/[id]/handshakeABI.json";

const TransactionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const Sponsored = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const [transactions, setTransaction] = useState([]);

  const handleExecute = async (transaction) => {
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
        transaction.deadline, // Assuming deadline is part of the transaction object
        transaction.nonce,
      ];

      const args = [
        transaction.senderSignature,
        transaction.receiverSignature,
        transaction.deadline,
        TransactionDetails,
        v,
        r,
        s
      ];

      const { request } = await publicClient.simulateContract({
        account: address,
        address: `${process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS}`,
        abi: handshakeABI.abi,
        functionName: "transferFromWithPermit",
        args,
        gasLimit: 3000000,
      });

      console.log(request);

      let walletClient;
if (typeof window !== "undefined" && window.ethereum) {
  walletClient = createWalletClient({
    chain: {
      id: 1029, // BTTC Donau testnet chain ID
      rpcUrls: {
        public: "https://pre-rpc.bittorrentchain.io/",
        websocket: "https://pre-rpc.bittorrentchain.io/", // WebSocket URL (optional)
      },
    },
    transport: custom(window.ethereum),
  });
}
      const execute = await walletClient.writeContract(request);
      if (execute) {
        await publicClient.waitForTransactionReceipt({ hash: execute });
      } else {
        // throw new Error("Transaction hash is undefined");
        console.log("tranaction hash is undefined");
      }

      // Update transaction status upon success
      if (execute) {
        
        const userData = {
          TransactionId: transaction.TransactionId,
          status: "completed",
          transectionDate: currentDate,
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
          const response = await fetch(url);
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
      <Typography variant="h5" gutterBottom>
        Sponsored Transactions
      </Typography>
      <Grid container spacing={3}>
        {transactions.map((transaction, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <TransactionPaper elevation={3}>
              <InfoItem>
                <Typography variant="subtitle1">
                  ID: {transaction.TransactionId}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Amount: {transaction.isNFT ? "NFT" : `${formatUnits(transaction.amount, transaction.decimals)} ${transaction.tokenName}`}
                </Typography>
              </InfoItem>
              <InfoItem>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Sender: {transaction.senderAddress.slice(0, 6)}...{transaction.senderAddress.slice(-4)}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Receiver: {transaction.receiverAddress.slice(0, 6)}...{transaction.receiverAddress.slice(-4)}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Token Address: {transaction.tokenAddress.slice(0, 6)}...{transaction.tokenAddress.slice(-4)}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Initiated: {new Date(transaction.initiateDate).toLocaleString()}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Typography variant="body2">
                  Deadline: {new Date(parseInt(transaction.deadline) * 1000).toLocaleString()}
                </Typography>
              </InfoItem>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleExecute(transaction)}
                disabled={isLoading || transaction.status !== 'approved'}
              >
                {isLoading ? "Executing..." : "Execute"}
              </Button>
            </TransactionPaper>
          </Grid>
        ))}
      </Grid>
      {transactions.length === 0 && (
        <Typography variant="body1" style={{ textAlign: 'center', marginTop: '20px' }}>
          No sponsored transactions found.
        </Typography>
      )}
      <ToastContainer />
    </div>
  );
};

export default Sponsored;