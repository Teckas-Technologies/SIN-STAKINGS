"use client";
import Body from "@/Components/Home/Body";
import Header from "@/Components/Header/Header";
import Footer from "@/Components/Footer/Footer";
import { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function Home() {
  useEffect(() => {
    const checkAndParseTransactionHash = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const txnHash = searchParams.get("transactionHashes");

      if (txnHash) {
        console.log("Transaction Hash Found:", txnHash);
        toast.success(`Staking successful!`);
      } else {
        console.log("No transaction hash found in the URL.");
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
      <Body />
      <Footer/>
      <Toaster/>
    </div>
  );
}
