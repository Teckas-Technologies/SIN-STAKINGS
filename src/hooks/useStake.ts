import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";
import { utils } from "near-api-js"; // Utility functions for NEAR amounts

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

        // Convert lock-up period to the desired format (e.g., seconds or milliseconds)
        const lockupPeriodInSeconds = lockupPeriodInDays * 24 * 60 * 60;

        // Call the smart contract method
        const result = await wallet.callMethod({
          contractId,
          method: "stake",
          args: {
            sender_id: senderId,
            amount: yoctoAmount,
            lockup_period: lockupPeriodInSeconds, // Pass lock-up period
            msg: "Staking SIN tokens with lock-up period",
          },
          gas: "300000000000000", 
          deposit: "1", 
        });
console.log("useStake ",result);

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
