"use client";
import React, { useState, useEffect } from "react";
import { NETWORK_ID, SIN_STAKING_CONTRACT } from "@/config/constants";
import { NearContext, Wallet } from "@/wallet/WallletSelector";
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<Wallet>();
  const [signedAccountId, setSignedAccountId] = useState<string>("");

  useEffect(() => {
    const walletInstance = new Wallet({
      networkId: NETWORK_ID,
      createAccessKeyFor: SIN_STAKING_CONTRACT,
    });
    walletInstance.startUp(setSignedAccountId);
    setWallet(walletInstance);
  }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      {children}
    </NearContext.Provider>
  );
};
