import { Wallet } from "@/wallet/WallletSelector";
import { useCallback } from "react";


export const useNftApprove = (wallet: Wallet | undefined, contractId: string) => {
  const approveNft = useCallback(
    async (tokenId: string, receiverContractId: string,senderId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        console.log("Approve called ............");
        const callbackUrl = `${window.location.origin}/stake?isApprove=true&senderId=${encodeURIComponent(senderId)}`;
        const result = await wallet.callMethod({
          contractId, // Contract to which the method is called
          callbackUrl,
          method: "nft_approve", // Method name
          args: {
            token_id: tokenId,
            account_id: receiverContractId,
          },
          gas: "300000000000000", // Adjust gas as needed
          deposit: "800000000000000000000", // 0.01 NEAR in yoctoNEAR
        });

        console.log("NFT Approval Result:", result);
        return result;
      } catch (error) {
        console.error("Error in nft_approve:", error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { approveNft };
};