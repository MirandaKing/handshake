"use client";
import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi"; // Import copy and check icons from react-icons

const AddressWithCopy = ({ address, short }) => {
  const [isCopied, setIsCopied] = useState(false); // State to track copy status

  const truncatedAddress = short
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);

    // Reset the copy status after 3 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 break-words">{truncatedAddress}</span>
      {isCopied ? (
        <FiCheck className="text-black bg-[#29FF81] rounded-full" />
      ) : (
        <FiCopy className="cursor-pointer" onClick={copyAddress} />
      )}
    </div>
  );
};

export default AddressWithCopy;
