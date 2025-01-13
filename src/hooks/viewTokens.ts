/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useUserRewards = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const [userRewards, setUserRewards] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRewards = useCallback(
    async (stakerId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await wallet.viewMethod({
          contractId,
          method: "get_user_rewards",
          args: {
            staker_id: stakerId,
          },
        });
        console.log("view get_user_rewards result", result?.total_staked_tokens);

        setUserRewards(result);
      } catch (err: any) {
        if (err.message.includes("Staker not found")) {
          setError(
            "You haven't staked any tokens yet. Start staking to claim your rewards here."
          );
        } else {
          setError("Failed to fetch user rewards");
        }
      } finally {
        setLoading(false);
      }
    },
    [wallet, contractId]
  );

  return {
    userRewards,
    loading,
    error,
    fetchUserRewards,
  };
};
