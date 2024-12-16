/* eslint-disable @typescript-eslint/no-unused-vars */
import { Wallet } from "@/wallet/WallletSelector";
import { useCallback } from "react";

export const useUnstake = (wallet: Wallet | undefined, contractId: string) => {
  const unstake = useCallback(
    async (stakeIndex: number, senderId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        const callbackUrl = `${
          window.location.origin
        }/account?isUnStake=true&senderId=${encodeURIComponent(senderId)}`;
        const result = await wallet.callMethod({
          contractId,
          callbackUrl,
          method: "unstake_tokens",
          args: {
            stake_index: stakeIndex,
          },
          gas: "300000000000000",
        });
        console.log("useUnstake result: ", result);

        return result;
      } catch (error) {
        console.error("Error unstaking tokens:", error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { unstake };
};
