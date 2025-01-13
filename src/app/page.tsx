"use client";
import Body from "@/Components/Home/Body";
import Header from "@/Components/Header/Header";
import Footer from "@/Components/Footer/Footer";

export default function Home() {
  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
