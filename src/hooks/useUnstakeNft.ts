/* eslint-disable @typescript-eslint/no-unused-vars */

import { Wallet } from "@/wallet/WallletSelector";
import { useCallback } from "react";

export const useUnstakeNfts = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const unstakeNfts = useCallback(
    async (stakeIndex: number, senderId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        // Callback URL to be used after the operation is completed
        const callbackUrl = `${
          window.location.origin
        }/account?isNftUnStake=true&senderId=${encodeURIComponent(senderId)}`;

        // Call the `unstake_nfts` method on the contract
        const result = await wallet.callMethod({
          contractId,
          method: "unstake_nfts",
          args: {
            stake_index: stakeIndex,
          },
          gas: "200000000000000", 

          callbackUrl,
        });

        console.log("useUnstakeNfts result: ", result);
        return result;
      } catch (error) {
        console.error("Error unstaking NFTs:", error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { unstakeNfts };
};
