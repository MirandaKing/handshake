"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import infoImg from "../../public/info.png";
import Image from "next/image";
const MarqueeContainer = styled("div")({
  width: "100%",
  overflow: "hidden",
  // backgroundColor: "#29FF81",
  // color: "black",
  backgroundColor: "black",
  color: "white",
  whiteSpace: "nowrap",
  marginTop: "80px",
});

const MarqueeText = styled("div")({
  display: "inline-block",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  padding: "10px 20px",
  //   paddingLeft: "100%",

  margin: "0 auto",
});
const values = [
  "This is a testnet site and if you want to initiate a tx on mainnet then go to",
  "This is a testnet site and if you want to initiate a tx on mainnet then go to",
];

const Marquee = ({ message }) => (
  // <MarqueeContainer>
  //   <MarqueeText className="flex items-center animate-marquee2 ">
  //     <div className="flex items-center justify-end">
  //       <Image
  //         src="/image.png"
  //         width={24}
  //         height={24}
  //         alt="Picture of the author"
  //         style={{ marginRight: "10px" }}
  //       />
  //       This is a testnet site and if you want to initiate a tx on mainnet then
  //       go to
  //       <a
  //         href="https://handshake-mainnet.vercel.app/dashboard"
  //         style={{ textDecoration: "underline", marginLeft: "10px" }}
  //       >
  //         Handshake Mainnet Site
  //       </a>
  //     </div>
  //   </MarqueeText>
  // </MarqueeContainer>

  <div className="bg-black text-white overflow-hidden py-3 mt-[80px]">
    <div className="animate-marquee whitespace-nowrap">
      {[...values, ...values, ...values].map((value, index) => (
        <React.Fragment key={index}>
          <span className="text-white text-md mx-4 ">
            <Image
              src="/image.png"
              width={24}
              height={24}
              alt="Picture of the author"
              style={{ marginRight: "10px" }}
              className="inline-block"
            />
            {value}
            <a
              href="https://handshake-mainnet.vercel.app/dashboard"
              style={{ textDecoration: "underline", marginLeft: "10px" }}
            >
              Handshake Mainnet Site
            </a>
          </span>

          {index < values.length * 3 - 1 && (
            <span className="text-white text-xl mx-4">•</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default Marquee;
