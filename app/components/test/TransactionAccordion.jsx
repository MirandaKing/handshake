"use client";

import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Grid } from "@mui/material";

import handshakeABI from "../../transaction-queue/[id]/handshakeABI.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import TimeAgoComponent from "../TimeAgoComponent";
import { useAccount } from "wagmi";
import { ToastContainer, toast } from "react-toastify";

import SingleTranscationAccordianExpanded from "../SingleTranscationAccordianExpanded";
import { approveNftToken, approveToken } from "@/app/quickaccess/ApproveTokens";

const CustomAccordion = styled(Accordion)({
  margin: "10px 0",
  marginBottom: "20px",
  "&:before": {
    display: "none",
  },

  boxShadow: "none",
  borderRadius: "10px",
  "&.Mui-expanded": {
    border: "1px solid rgb(176, 255, 201)",
    background: "rgb(239, 255, 244)",
  },
  "&.MuiAccordion-root": {
    borderRadius: "10px",
  },
});

const CustomAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "white",
  padding: "10px 20px",
  borderRadius: "10px",
  border: "1px solid #dcdee0",
  "&.MuiAccordionSummary-content": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  "&:hover": {
    border: "1px solid rgb(176, 255, 201)",
    background: "rgb(239, 255, 244)",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
  },
  "&.Mui-expanded": {
    border: "none",
    borderBottom: "1px solid #dcdee0",
    background: "rgb(239, 255, 244)",
    borderTopRightRadius: "10px",
    borderTopLeftRadius: "10px",
    borderBottomRightRadius: "0",
    borderBottomLeftRadius: "0",
  },
});

const CustomAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "white",
  borderBottomRightRadius: "10px",
  borderBottomLeftRadius: "10px",
});
const CustomGridItem = styled(Grid)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
const publicClient = createPublicClient({
  chain: {
    id: 1029, // BTTC Donau testnet chain ID
    rpcUrls: {
      public: "https://pre-rpc.bittorrentchain.io/", // BTTC Donau testnet RPC URL
    },
  },
  transport: http("https://pre-rpc.bittorrentchain.io/"), // Passing RPC URL to http function
});
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
const TransactionAccordion = ({ transactions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isRejectedBtn, setIsRejectedBtn] = useState(-1);
  const { address } = useAccount();

  const signTransaction = async (transaction) => {
    console.log(transaction);
    try {
      setIsLoading(true);
      console.log("cp3");

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
      console.log("cp2");

      // const amount = parseUnits(transaction.amount, transaction.decimals);
      let signature;
      console.log("cp1");
      if (transaction.isNFT) {
        console.log("inside NFT");
        signature = await client.signTypedData({
          account: address,
          domain: {
            name: "HandshakeTokenTransfer",
            version: "1",
            chainId: "1029",
            verifyingContract: `${process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS}`,
          },
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            signByReceiver: [
              { name: "sender", type: "address" },
              { name: "receiver", type: "address" },
              { name: "tokenAddress", type: "address" },
              { name: "tokenId", type: "uint256" },
              { name: "deadline", type: "uint256" },
              { name: "nonce", type: "uint256" },
            ],
          },
          primaryType: "signByReceiver",
          message: {
            sender: transaction.senderAddress,
            receiver: transaction.receiverAddress,
            tokenAddress: transaction.tokenAddress,
            tokenId: transaction.tokenId,
            deadline: transaction.deadline,
            nonce: transaction.nonce,
          },
        });
      } else {
        console.log("inside token");
        // const amount = parseUnits(transaction.amount, transaction.decimals);    // cn1 change needed in API
        // amount can't be null but api passed it null because when data is null

        signature = await client.signTypedData({
          account: address,
          domain: {
            name: "HandshakeTokenTransfer",
            version: "1",
            chainId: "1029",
            verifyingContract: `${process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS}`,
          },
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            signByReceiver: [
              { name: "nonce", type: "uint256" },
              { name: "sender", type: "address" },
              { name: "receiver", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "tokenName", type: "string" },
            ],
          },
          primaryType: "signByReceiver",
          message: {
            nonce: transaction.nonce,
            sender: transaction.senderAddress,
            receiver: transaction.receiverAddress,
            amount: amount,
            tokenName: transaction.tokenName,
          },
        });
      }
      const currentDate = new Date();
      console.log("Signature:", signature);
      if (signature) {
        const userData = {
          TransactionId: transaction.TransactionId, // This should be passed in the request to identify the transaction to update
          receiverSignature: signature,
          status: "approved",
          approveDate: currentDate,
        };
        console.log(userData);
        try {
          console.log("entered into try block");
          let result = await fetch(`api/store-transaction`, {
            method: "PUT",
            body: JSON.stringify(userData),
            headers: {
              "Content-Type": "application/json", // This header is crucial for sending JSON data
            },
          });
          const response = await result.json();
          // console.log(response.message);
          setIsLoading(false);
          toast.success("Signed Sucessfully");

          await new Promise((resolve) => setTimeout(resolve, 3000));

          window.location.reload();
        } catch (error) {
          console.error("Error signing transaction:", error);
          setIsLoading(false);
          toast.error("Error while signing");
        }
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTransaction = async (transaction, index) => {
    // setSelectedIndex(index);
    setIsRejectedBtn(index);
    setIsLoading(true);
    const currentDate = new Date();
    const userData = {
      TransactionId: transaction.TransactionId, // This should be passed in the request to identify the transaction to update
      receiverSignature: "rejection-no signature",
      status: "rejected",
      approveDate: currentDate,
    };
    console.log(userData);
    try {
      console.log("entered into try block");
      let result = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}api/store-transaction`,
        {
          method: "PUT",
          body: JSON.stringify(userData),
          headers: {
            "Content-Type": "application/json", // This header is crucial for sending JSON data
          },
        }
      );
      const response = await result.json();

      setIsLoading(false);
      toast.success("Rejected Sucessfully");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      window.location.reload();
    } catch (error) {
      console.error("Error Rejecting transaction:", error);
      setIsLoading(false);
      toast.error("Error while rejecting transaction");
    } finally {
      setIsLoading(false);
    }
  };
  const executeTransaction = async (transaction) => {
    setIsLoading(true);

    try {
      let functionCalled;
      let TransactionDetails;

      // Define function and parameters based on transaction type (NFT, Token, or Native)
      if (transaction.isNFT) {
        // NFT transfer logic
        TransactionDetails = [
          transaction.senderAddress,
          transaction.receiverAddress,
          transaction.tokenAddress,
          transaction.tokenId, // NFT specific parameter
          transaction.deadline,
          transaction.nonce,
        ];
        functionCalled = "transferNft"; // Call the NFT transfer function

        // Handle NFT approval
        let approve = await approveNftToken(
          transaction.tokenId,
          transaction.tokenAddress,
          address
        );
        console.log("NFT approved: ", approve);
      } else if (transaction.tokenAddress === "") {
        // Native token transfer logic, no approval needed
        TransactionDetails = [
          transaction.senderAddress,
          transaction.receiverAddress,
          transaction.amount,
          transaction.deadline, // Assuming deadline is part of the transaction object
          transaction.nonce,
        ];
        functionCalled = "transferNative"; // Call the native token transfer function
      } else {
        // ERC20 token transfer logic
        TransactionDetails = [
          transaction.senderAddress,
          transaction.receiverAddress,
          transaction.tokenAddress,
          transaction.amount,
          transaction.deadline, // Assuming deadline is part of the transaction object
          transaction.nonce,
        ];
        functionCalled = "transferTokens"; // Call the token transfer function

        // Handle ERC20 token approval
        let approve = await approveToken(
          transaction.amount,
          transaction.tokenAddress,
          address
        );
        console.log("Token approved: ", approve);
      }

      console.log("Transaction Details: ", TransactionDetails);
      console.log("Function Called: ", functionCalled);

      // Prepare arguments for contract call
      const args = [
        transaction.senderSignature,
        transaction.receiverSignature,
        TransactionDetails,
      ];

      console.log("cp1");
      // Simulate the contract execution
      const { request } = await publicClient.simulateContract({
        account: address,
        address: `${process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS}`,
        abi: handshakeABI.abi,
        functionName: functionCalled,
        args,
        ...(functionCalled === "transferNative"
          ? { value: transaction.amount ?? 0 }
          : {}),
        gasLimit: 3000000,
      });

      // Execute the contract function
      const currentDate = new Date();
      const execute = await walletClient.writeContract(request);

      if (execute) {
        await publicClient.waitForTransactionReceipt({ hash: execute });
      } else {
        throw new Error("Transaction hash is undefined");
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
          let result = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}api/payment-completed`,
            {
              method: "PUT",
              body: JSON.stringify(userData),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const response = await result.json();
          console.log("Payment update response: ", response);
        } catch (error) {
          console.error("Error updating payment status:", error);
        }

        toast.success("Execution successful");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        window.location.reload();
      }
    } catch (error) {
      toast.error("Execution failed");
      console.error("Error executing transaction: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionButtonClick = async (transaction, index) => {
    setSelectedIndex(index);
    if (
      address &&
      transaction.senderAddress === address &&
      transaction.status === "inititated"
    ) {
      console.log("wait for receiver to approve");
    }

    if (
      address &&
      transaction.senderAddress === address &&
      transaction.status === "approved"
    ) {
      await executeTransaction(transaction);
    }

    if (
      address &&
      transaction.receiverAddress === address &&
      transaction.status === "inititated"
    ) {
      await signTransaction(transaction);
    }
  };
  return (
    <div className="accordian-parent">
      {transactions.length > 0 &&
        transactions.map((transaction, index) => (
          <CustomAccordion key={index} classes={"muiTopContainer"}>
            <CustomAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Grid
                container
                spacing={{ xs: 2, md: 3 }}
                columns={{ xs: 6, sm: 10, md: 10 }}
              >
                <CustomGridItem item xs={3} sm={1} md={1}>
                  <div>{transaction.TransactionId}</div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div className="senderOrReceiverOnAccordian">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`${
                        transaction.senderAddress === address
                          ? "send"
                          : "receive"
                      }`}
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M9.56854 5.0101H6.9697C6.41462 5.0101 5.96465 4.56012 5.96465 4.00505C5.96465 3.44998 6.41462 3 6.9697 3H11.9949C12.2725 3 12.5237 3.11249 12.7056 3.29437C12.8875 3.47625 13 3.72751 13 4.00505V9.0303C13 9.58538 12.55 10.0354 11.9949 10.0354C11.4399 10.0354 10.9899 9.58538 10.9899 9.0303V6.43146L4.71573 12.7056C4.32323 13.0981 3.68687 13.0981 3.29437 12.7056C2.90188 12.3131 2.90188 11.6768 3.29437 11.2843L9.56854 5.0101Z"
                        fill="#F02525"
                      />
                    </svg>
                    {transaction.senderAddress === address ? "Send" : "Receive"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  {transaction.isNFT ? (
                    <div style={{ fontWeight: "700" }}>NFT</div>
                  ) : (
                    <div style={{ fontWeight: "700" }}>
                      {formatUnits(transaction.amount, transaction.decimals)}
                      <span style={{ marginLeft: "10px" }}>
                        {transaction.tokenName}
                      </span>
                    </div>
                  )}
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div style={{ color: "#a1a3a7" }}>
                    <TimeAgoComponent timestamp={transaction.initiateDate} />
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={1} md={1}>
                  <div className="accordian-txn-status">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="16px"
                      viewBox="0 0 24 24"
                      width="16px"
                      fill="#028d4c"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z" />
                    </svg>
                    {transaction.status === "inititated"
                      ? "1 out of 3"
                      : transaction.status === "approved"
                      ? "2 out of 3"
                      : transaction.status === "completed"
                      ? "3 out of 3"
                      : "0 out of 3"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <button
                    className={
                      address &&
                      transaction.senderAddress === address &&
                      transaction.status === "inititated"
                        ? "waiting-action-btn action-btn"
                        : transaction.senderAddress === address &&
                          transaction.status === "approved"
                        ? "execute-action-btn action-btn"
                        : transaction.receiverAddress === address &&
                          transaction.status === "inititated"
                        ? "execute-action-btn action-btn"
                        : transaction.status === "completed"
                        ? "completed-action-btn action-btn"
                        : transaction.status === "rejected"
                        ? "rejected-action-btn action-btn pointer-none"
                        : "waiting-action-btn action-btn"
                    }
                    onClick={() => handleActionButtonClick(transaction, index)}
                  >
                    {isLoading &&
                    isRejectedBtn !== index &&
                    selectedIndex === index
                      ? "Loading..."
                      : address &&
                        transaction.senderAddress === address &&
                        transaction.status === "inititated"
                      ? "Waiting"
                      : transaction.senderAddress === address &&
                        transaction.status === "approved"
                      ? "Execute"
                      : transaction.receiverAddress === address &&
                        transaction.status === "inititated"
                      ? "Approve"
                      : transaction.status === "rejected"
                      ? "Rejected"
                      : transaction.status === "completed"
                      ? "Completed"
                      : "waiting"}
                  </button>
                </CustomGridItem>
              </Grid>
            </CustomAccordionSummary>
            <CustomAccordionDetails>
              <SingleTranscationAccordianExpanded
                transaction={transaction}
                cancelTransaction={cancelTransaction}
                isLoading={isLoading}
                index={index}
                handleActionButtonClick={handleActionButtonClick}
                selectedIndex={selectedIndex}
                isRejectedBtn={isRejectedBtn}
              />
            </CustomAccordionDetails>
          </CustomAccordion>
        ))}
      <ToastContainer />
      {transactions.length === 0 && (
        <CustomAccordion key={"0"} classes={"muiTopContainer"}>
          <CustomAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel0-content`}
            id={`panel0-header`}
          >
            <div style={{ textAlign: "center", width: "100%" }}>
              No transactions found for this address.
              <div style={{ marginTop: "10px" }}>
                To start a new request, please click on the "Initiate Request"
                button located in the top right corner.
              </div>
            </div>
          </CustomAccordionSummary>
        </CustomAccordion>
      )}
    </div>
  );
};

export default TransactionAccordion;
