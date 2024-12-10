'use client'
import NFTStakeSection from '@/Components/Account/Account'
import Footer from '@/Components/Footer/Footer'
import Header from '@/Components/Header/Header'
import React from 'react'

const page = () => {
  return (
    <div
    className="bg-cover bg-center min-h-screen"
    style={{ backgroundImage: "url('/images/bg.png')" }}
  >
    <Header />
    <NFTStakeSection/>
    <Footer/>
  </div>
  )
}

export default page