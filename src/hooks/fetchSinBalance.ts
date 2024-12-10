/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

interface UseSinBalanceProps {
  wallet: any;
  signedAccountId: string | null;
}

export const useSinBalance = ({ wallet, signedAccountId }: UseSinBalanceProps) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet || !signedAccountId) {
        setError("Wallet not initialized or not signed in");
        return;
      }

      try {
        const result = await wallet.viewMethod({
          contractId: "sin-test-tkn.testnet", 
          method: "ft_balance_of",
          args: { account_id: signedAccountId },
        });
        setBalance(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError("Failed to fetch balance");
      }
    };

    fetchBalance();
  }, [wallet, signedAccountId]);

  return { balance, error };
};

