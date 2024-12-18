import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";
import { utils } from "near-api-js"; // Utility functions for NEAR amounts
import { SIN_STAKING_CONTRACT_STAKE_INFO } from "@/config/constants";

export const useStake = (wallet: Wallet | undefined, contractId: string) => {
  const stake = useCallback(
    async (amount: string, senderId: string, lockupPeriodInDays: number) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        // Convert the entered amount from NEAR to yoctoNEAR
        const yoctoAmount = utils.format.parseNearAmount(amount);
        console.log("yocto>>", yoctoAmount);

        if (!yoctoAmount) {
          throw new Error("Invalid amount entered");
        }

       
        const msg = JSON.stringify({ lockup_days: lockupPeriodInDays });
        // Call the smart contract method
        const callbackUrl = `${window.location.origin}/account?isStake=true&senderId=${encodeURIComponent(senderId)}`;
        const result = await wallet.callMethod({
          contractId,
          callbackUrl,
          method: "ft_transfer_call",
          args: {
            receiver_id: SIN_STAKING_CONTRACT_STAKE_INFO, // Specify the receiver contract account
            amount: yoctoAmount, // Amount to transfer
            msg,
          },
          gas: "300000000000000",
          deposit: "1",
        });
        console.log("useStake ", result);

        return result;
      } catch (error) {
        console.error("Error staking tokens:", error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { stake };
};
