import { useCallback } from "react";
import { Wallet } from "@/wallet/WallletSelector";

export const useStakeNFTs = (
  wallet: Wallet | undefined,
  contractId: string
) => {
  const stakeNFTs = useCallback(
    async (nftIds: string[], senderId: string) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      try {
        if (!nftIds || nftIds.length === 0) {
          throw new Error("No NFT IDs provided");
        }

        const callbackUrl = `${
          window.location.origin
        }/stake?isNftStake=true&senderId=${encodeURIComponent(senderId)}`;
        const result = await wallet.callMethod({
          contractId,
          callbackUrl,
          method: "stake_nfts",
          args: {
            nft_ids: nftIds,
          },
          gas: "300000000000000",
          deposit: "1",
        });
        console.log("useStakeNFTs result", result);

        return result;
      } catch (error) {
        console.error("Error staking NFTs:", error);
        throw error;
      }
    },
    [wallet, contractId]
  );

  return { stakeNFTs };
};
