import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useUnstake = (wallet: Wallet | undefined, contractId: string) => {
  const unstake = useCallback(async () => {
    if (!wallet) {
      throw new Error("Wallet is not connected");
    }

    try {
      const result = await wallet.callMethod({
        contractId,
        method: "unstake",
        args: {},
        gas: "300000000000000",
      });
      return result;
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      throw error;
    }
  }, [wallet, contractId]);

  return { unstake };
};
