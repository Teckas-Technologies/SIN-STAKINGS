/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useCalculateCurrentAPR = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const [currentAPR, setCurrentAPR] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentAPR = useCallback(async () => {
    if (!wallet) {
      throw new Error("Wallet is not connected");
    }

    setLoading(true);
    setError(null);

    try {
      const result = await wallet.viewMethod({
        contractId,
        method: "calculate_current_apr",
        args: {},
      });

      console.log("view calculate_current_apr result", result);

      setCurrentAPR(result);
    } catch (err: any) {
      console.error("Failed to fetch current APR", err);
      setError("Failed to fetch current APR");
    } finally {
      setLoading(false);
    }
  }, [wallet, contractId]);

  return {
    currentAPR,
    loading,
    error,
    fetchCurrentAPR,
  };
};
