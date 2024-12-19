/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useNftStakingInfo = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const [nftStakingInfo, setNftStakingInfo] = useState<any>(null);
  const [nftLoading, setNftLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNftStakingInfo = useCallback(
    async (accountId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      setNftLoading(true);
      setError(null);

      try {
        const result = await wallet.viewMethod({
          contractId,
          method: "get_staking_info",
          args: {
            staker_id: accountId,
          },
        });
        console.log("result staking", result);

        setNftStakingInfo(result);
      } catch (err) {
        console.error("Error fetching staking info:", err);
        setError("Failed to fetch staking info");
      } finally {
        setNftLoading(false);
      }
    },
    [wallet, contractId]
  );

  return {
    nftStakingInfo,
    nftLoading,
    error,
    fetchNftStakingInfo,
  };
};
