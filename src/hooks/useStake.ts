/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";
import { utils } from "near-api-js"; // Utility functions for NEAR amounts
import { SIN_STAKING_CONTRACT_TOKEN_STAKE } from "@/config/constants";

export const useStake = (wallet: Wallet | undefined, contractId: string) => {
  const stake = useCallback(
    async (amount: string, senderId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        // Convert the amount to yocto using 18 digits instead of 24
        const yoctoAmount = (parseFloat(amount) * 10 ** 18).toFixed(0); // Convert to integer-like string
        console.log("yocto>>", yoctoAmount);

        if (isNaN(parseFloat(yoctoAmount))) {
          throw new Error("Invalid amount entered");
        }

        // const msg = JSON.stringify({ lockup_days: lockupPeriodInDays });
        const msg = "Staking Tokens";

        const callbackUrl = `${
          window.location.origin
        }/account?isStake=true&senderId=${encodeURIComponent(senderId)}`;
        const result = await wallet.callMethod({
          contractId,
          callbackUrl,
          method: "ft_transfer_call",
          args: {
            receiver_id: SIN_STAKING_CONTRACT_TOKEN_STAKE,
            amount: yoctoAmount,
            msg,
          },
          gas: "300000000000000",
          deposit: "1",
        });
        console.log("useStake ", result);

        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { stake };
};
