import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useClaimNftRewards = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const claimNftRewards = useCallback(
    async (stakeIndex: number, senderId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        const callbackUrl = `${
          window.location.origin
        }/account?isNftClaim=true&senderId=${encodeURIComponent(senderId)}`;
        const result = await wallet.callMethod({
          contractId,
          callbackUrl,
          method: "claim_reward",
          args: {
            stake_index: stakeIndex,
          },
          gas: "200000000000000",
        });
        console.log("Claim rewards result:", result);
        return result;
      } catch (error) {
        console.error("Error claiming rewards:", error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { claimNftRewards };
};
