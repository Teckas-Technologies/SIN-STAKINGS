import Footer from "@/Components/Footer/Footer";
import Header from "@/Components/Header/Header";
import StakeSection from "@/Components/Stake/Stake";
import React from "react";

const page = () => {
  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <Header />
      <StakeSection />
      <Footer/>
    </div>
  );
};

export default page;
