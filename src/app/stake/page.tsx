"use client";
import Footer from "@/Components/Footer/Footer";
import Header from "@/Components/Header/Header";
import StakeSection from "@/Components/Stake/Stake";
import { NEXT_PUBLIC_NETWORK } from "@/config/constants";
import React, { Suspense, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getTxnStatus } from "@mintbase-js/rpc";
const Page = () => {
  useEffect(() => {
    const checkAndParseTransactionHash = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const txnHash = searchParams.get("transactionHashes");
      const isTokenStake = searchParams?.get("isStake") || "";
      const isNftStake = searchParams?.get("isNftStake") || "";
      const accountId = searchParams?.get("senderId") || "";

      if (txnHash) {
        console.log("Transaction Hash Found:", txnHash);

        try {
          const senderId = accountId;
          const rpcUrl = `https://rpc.${NEXT_PUBLIC_NETWORK}.near.org`;

          const txnStatus = await getTxnStatus(txnHash, senderId, rpcUrl);

          if (txnStatus === "success") {
            if (isTokenStake) {
              toast.success("Token staking successful!");
              window.history.replaceState(null, "", "/stake");
            }

            if (isNftStake) {
              toast.success("NFT staking successful!");
              window.history.replaceState(null, "", "/stake");
            }
          } else {
            console.warn("Transaction status is not successful:", txnStatus);
          }
        } catch (error) {
          console.error("Error while checking transaction status:", error);
        }
      } else {
        console.log(
          "No valid transaction hash or isStake flag found in the URL."
        );
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
      <Suspense fallback={<div>Loading...</div>}>
        <StakeSection />
      </Suspense>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Page;
