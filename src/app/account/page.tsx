"use client";

import Footer from "@/Components/Footer/Footer";
import Header from "@/Components/Header/Header";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getTxnStatus } from "@mintbase-js/rpc";
import { NEXT_PUBLIC_NETWORK } from "@/config/constants";
import { NFTStakeSection } from "@/Components/Account/Account";
const Page = () => {
  const [activeTable, setActiveTable] = useState<"tokens" | "nfts">("tokens");
  useEffect(() => {
    const checkAndParseTransactionHash = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const txnHash = searchParams.get("transactionHashes");
      const isUnStake = searchParams?.get("isUnStake") || "";
      const isNftUnStake = searchParams?.get("isNftUnStake") || "";
      const isClaimReward = searchParams?.get("isClaim") || "";
      const isNftClaimReward = searchParams?.get("isNftClaim") || "";
      const isTokenStake = searchParams?.get("isStake") || "";
      const isNftStake = searchParams?.get("isNftStake") || "";
      const accountId = searchParams?.get("senderId") || "";

      if (txnHash) {
        console.log("Transaction Hash Found:", txnHash);

        try {
          const senderId = accountId;
          const rpcUrl = `https://rpc.${NEXT_PUBLIC_NETWORK}.near.org`;

          const txnStatus = await getTxnStatus(txnHash, senderId, rpcUrl);
          console.log("staus", txnStatus);

          if (txnStatus === "success") {
            if (isUnStake) {
              toast.success("You have successfully unstaked your tokens!");
              window.history.replaceState(null, "", "/account");
            }

            if (isClaimReward && txnHash) {
              toast.success(
                "You have successfully claimed your rewards for tokens!"
              );
              window.history.replaceState(null, "", "/account");
            }

            if (isNftUnStake && txnHash) {
              toast.success("You have successfully unstaked your NFTs!");
              window.history.replaceState(null, "", "/account");
            }

            if (isNftClaimReward && txnHash) {
              toast.success(
                "You have successfully claimed your rewards for NFTs!"
              );
              window.history.replaceState(null, "", "/account");
            }
            if (isTokenStake && txnHash) {
              toast.success("Token staking successful!");
              setActiveTable("tokens");
              window.history.replaceState(null, "", "/account");
            }

            if (isNftStake && txnHash) {
              toast.success("NFT staking successful!");
              setActiveTable("nfts");
              window.history.replaceState(null, "", "/account");
            }
          } else {
            console.warn("Transaction status is not successful:", txnStatus);
          }
        } catch (error) {
          console.error("Error while checking transaction status:", error);
        }
      } else {
        console.log("No valid transaction hash found in the URL.");
      }
    };

    checkAndParseTransactionHash();
  }, []);

  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <Header />
      <NFTStakeSection
        activeTable={activeTable}
        setActiveTable={setActiveTable}
      />
      <Footer />
      <Toaster />
    </div>
  );
};

export default Page;
