import Footer from "@/Components/Footer/Footer";
import Header from "@/Components/Header/Header";
import StakeSection from "@/Components/Stake/Stake";
import React, { Suspense } from "react";
import { Toaster } from "react-hot-toast";

const page = () => {
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

export default page;
