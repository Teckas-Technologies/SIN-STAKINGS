"use client";
import NFTStakeSection from "@/Components/Account/Account";
import Footer from "@/Components/Footer/Footer";
import Header from "@/Components/Header/Header";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getTxnStatus } from "@mintbase-js/rpc";
import { NEXT_PUBLIC_NETWORK } from "@/config/constants";
const Page = () => {
  useEffect(() => {
    const checkAndParseTransactionHash = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const txnHash = searchParams.get("transactionHashes");
      const isUnStake = searchParams?.get("isUnStake") || "";
      const isClaimReward = searchParams?.get("isClaim") || "";
      const accountId = searchParams?.get("senderId") || "";

      if (txnHash) {
        console.log("Transaction Hash Found:", txnHash);

        try {
          const senderId = accountId;
          const rpcUrl = `https://rpc.${NEXT_PUBLIC_NETWORK}.near.org`;

          const txnStatus = await getTxnStatus(txnHash, senderId, rpcUrl);

          if (txnStatus === "success") {
            if (isUnStake) {
              toast.success("Unstaking Successful!");
              window.history.replaceState(null, "", "/account");
            }

            if (isClaimReward) {
              toast.success("Reward Claimed Successfully!");
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
      <NFTStakeSection />
      <Footer />
      <Toaster />
    </div>
  );
};

export default Page;
