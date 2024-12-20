import { Wallet } from "@/wallet/WallletSelector";
import { useCallback, useState } from "react";

export const useTransactionDetails = (wallet: Wallet | undefined) => {
  const [approveId, setApproveId] = useState<number | null>(null);
  const [tokenIds, setTokenIds] = useState<string[]>([]); // State to store token IDs

  const getTransactionDetails = useCallback(
    async (txhash: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        // Fetch the full transaction details
        const transaction = await wallet.getTransactionResult(txhash);
        console.log("Full Transaction Details:", transaction);

        // Check if the transaction status is 'success'
        if (transaction?.status !== undefined) {
          const receipts = transaction?.receipts_outcome || [];
          let approvalId = null;
          const extractedTokenIds: string[] = []; // Temporary array to hold token IDs

          // Iterate through the receipts and search for the nft_approve event in the logs
          for (const receipt of receipts) {
            const logs = receipt.outcome?.logs || [];

            for (const log of logs) {
              if (log.startsWith("EVENT_JSON:")) {
                const jsonString = log.slice("EVENT_JSON:".length);
                try {
                  const parsedLog = JSON.parse(jsonString);

                  if (parsedLog.event === "nft_approve") {
                    const approvalIdInLog = parsedLog?.data?.[0]?.approval_id;
                    const tokenIdInLog = parsedLog?.data?.[0]?.token_id;

                    if (approvalIdInLog !== undefined) {
                      approvalId = approvalIdInLog;
                      setApproveId(approvalId);
                      console.log("Approval ID:", approvalId);
                    }

                    if (tokenIdInLog) {
                      extractedTokenIds.push(tokenIdInLog);
                      console.log("Token ID extracted:", tokenIdInLog);
                    }
                  }
                } catch (error) {
                  console.error("Failed to parse log JSON:", error);
                }
              }
            }

            if (approvalId !== null) {
              break; // Exit outer loop if approval_id has been found
            }
          }

          setTokenIds(extractedTokenIds); // Update the token IDs state
          console.log("Extracted Token IDs:", extractedTokenIds);

          // Return the approvalId and tokenIds along with the transaction details
          return { transaction, approvalId, tokenIds: extractedTokenIds };
        } else {
          throw new Error("Transaction status is not success");
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        throw error;
      }
    },
    [wallet]
  );

  return { getTransactionDetails, approveId, tokenIds };
};
