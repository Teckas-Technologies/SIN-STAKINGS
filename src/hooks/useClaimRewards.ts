import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useClaimRewards = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const claimRewards = useCallback(async () => {
    if (!wallet) {
      throw new Error("Wallet is not connected");
    }

    try {
      const result = await wallet.callMethod({
        contractId,
        method: "claim_rewards",
        args: {},
        gas: "300000000000000",
      });
      return result;
    } catch (error) {
      console.error("Error claiming rewards:", error);
      throw error;
    }
  }, [wallet, contractId]);

  return { claimRewards };
};
