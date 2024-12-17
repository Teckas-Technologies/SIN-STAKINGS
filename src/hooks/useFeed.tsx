/* eslint-disable @typescript-eslint/no-explicit-any */
import { graphQLService } from "@/data/queries/graphqlService";
import { FETCH_FEED } from "@/data/queries/showNft";
import { useState, useCallback } from "react";

interface NFT {
  token_id: string;
  media: string;
  title: string;
  owner: string;
}

const useFetchNFTMedia = ({
  nft_contract_id,
  owner,
  limit = 10,
  order = "asc", // or "asc"
}: {
  nft_contract_id: string;
  owner: string;
  limit?: number;
  order?: "desc" | "asc";
}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchNFTData = useCallback(async () => {
    if (loading || !hasMore) return; // Prevent multiple requests

    console.log("Fetching NFT data with parameters:", {
      nft_contract_id,
      owner,
      limit,
      offset,
      order,
    });

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await graphQLService({
        query: FETCH_FEED,
        variables: {
          nft_contract_id,
          owner,
          limit,
          offset,
          order,
        },
      });

      if (error) {
        console.error("GraphQL error:", error);
        setError("Error fetching NFT data");
        setLoading(false);
        return;
      }

      console.log("GraphQL response data:", data);

      if (data?.mb_views_nft_tokens) {
        const nftData = data.mb_views_nft_tokens.map((nft: any) => ({
          token_id: nft.token_id,
          media: nft.media,
          title: nft.title,
          owner: nft.owner,
        }));

        console.log("Parsed NFT data:", nftData);

        setNfts((prevNfts) => [...prevNfts, ...nftData]); // Append new data
        setOffset((prevOffset) => prevOffset + limit);

        if (nftData.length < limit) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Unexpected error while fetching NFT data:", err);
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [nft_contract_id, owner, limit, offset, order, loading, hasMore]);

  // useEffect(() => {
  //   fetchNFTData();
  // }, [fetchNFTData]);

  return { nfts, loading, error, fetchNFTData, hasMore };
};

export default useFetchNFTMedia;
