import { DM_Sans } from "next/font/google";
import "./globals.css";
import "../app/style.scss";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./provider";

const dm_sans = DM_Sans({
  weight: ["400", "600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});
export const metadata = {
  title: "HandShake",
  description: "Revolutionizing Token and NFT Transfers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dm_sans.variable}>
      <body>
        <div className="gradient-bg">
          {/* <svg xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="goo">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="10"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                  result="goo"
                />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
          <div className="gradients-container">
            <div className="g1"></div>
            <div className="g2"></div>
            <div className="g3"></div>
            <div className="g4"></div>
            <div className="g5"></div>
            <div className="interactive"></div>
          </div> */}
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
