/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { toast, Toaster } from "react-hot-toast";
import { useSinBalance } from "@/hooks/fetchSinBalance";
import { useStake } from "@/hooks/useStake";
import { NearContext, Wallet } from "@/wallet/WallletSelector";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useClaimTokenRewards } from "@/hooks/useClaimTokenRewards";
import { getTxnStatus } from "@mintbase-js/rpc";
import useFetchNFTMedia from "@/hooks/useFeed";
import "./Stake.css";
import Loader from "../Loader/Loader";
import {
  NEXT_PUBLIC_NETWORK,
  SIN_STAKING_CONTRACT_BALANCE,
  SIN_STAKING_CONTRACT_CLAIM_NFT_REWARDS,
  SIN_STAKING_CONTRACT_CLAIM_REWARDS,
  SIN_STAKING_CONTRACT_NFT_STAKE,
  SIN_STAKING_CONTRACT_SHOW_NFTS,
  SIN_STAKING_CONTRACT_STAKE_INFO,
  SIN_STAKING_CONTRACT_TOKEN_STAKE,
} from "@/config/constants";
import { useStakingInfo } from "@/hooks/viewStakingToken";
import { useStakeNFTs } from "@/hooks/stakeNft";
import { useLastRewardDistribution } from "@/hooks/getLastRewardDistribution";
import { useNftApprove } from "@/hooks/approveNftStake";
import { useNftTransferCall } from "@/hooks/transferNftstake";
import { useTransactionDetails } from "@/hooks/getTransactionHash";

export default function StakeSection() {
  const { wallet, signedAccountId } = useContext(NearContext);
  const { balance } = useSinBalance({ wallet, signedAccountId });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "1-Month" | "3-Month" | "6-Month" | "9-Month" | null
  >(null);
  const [isApprove, setIsApprove] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<"STAKE_SIN" | "STAKE_NFT">(
    "STAKE_SIN"
  );
  const [activeSection, setActiveSection] = useState<"stake" | "unstake">(
    "stake"
  );
  const [amount, setAmount] = useState<string>("");
  const [percentage, setPercentage] = useState(0);
  const { stakingInfo, fetchStakingInfo } = useStakingInfo(
    wallet,
    SIN_STAKING_CONTRACT_STAKE_INFO
  );
  const nft_contract_id = SIN_STAKING_CONTRACT_SHOW_NFTS;
  const ownerId = signedAccountId;

  const { nfts, loading, error, fetchNFTData, hasMore } = useFetchNFTMedia({
    nft_contract_id: nft_contract_id,
    owner: ownerId,
  });
  const tokenContractId = SIN_STAKING_CONTRACT_CLAIM_REWARDS;
  const nftContractId = SIN_STAKING_CONTRACT_CLAIM_NFT_REWARDS;
  const yoctoToSin = 1e24; // Conversion factor from yocto to SIN

  const formatSinBalance = (balance: string): string => {
    const sinBalance = parseFloat(balance) / yoctoToSin;
    return sinBalance.toFixed(8); // Display up to 8 decimal places
  };
  const {
    rewardDistribution: tokenRewardDistribution,
    fetchLastRewardDistribution: fetchTokenRewardDistribution,
    loading: tokenLoading,
  } = useLastRewardDistribution(wallet, tokenContractId);

  const {
    rewardDistribution: nftRewardDistribution,
    fetchLastRewardDistribution: fetchNFTRewardDistribution,
    loading: nftLoading,
  } = useLastRewardDistribution(wallet, nftContractId);

  useEffect(() => {
    if (wallet) {
      fetchTokenRewardDistribution();
      fetchNFTRewardDistribution();
    }
  }, [wallet]);

  useEffect(() => {
    if (currentTab === "STAKE_NFT" && signedAccountId) {
      fetchNFTData();
    }
  }, [currentTab, signedAccountId]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (
      containerRef.current &&
      containerRef.current.scrollTop + containerRef.current.clientHeight >=
        containerRef.current.scrollHeight
    ) {
      if (!loading && hasMore) {
        fetchNFTData();
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasMore]);

  const { stake } = useStake(wallet, SIN_STAKING_CONTRACT_TOKEN_STAKE);

  const handleStake = async () => {
    if (!signedAccountId) {
      toast.error("Please connect your wallet before staking your tokens!");
      return;
    }

    if (!amount) {
      toast.error("Please enter the amount.");
      return;
    }

    if (isNaN(parseFloat(amount))) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!selectedPeriod) {
      toast.error("Please select a lock-up period.");
      return;
    }

    const lockupDays = {
      "1-Month": 30,
      "3-Month": 90,
      "6-Month": 180,
      "9-Month": 270,
    }[selectedPeriod];

    if (!lockupDays) {
      toast.error("Invalid lock-up period selected.");
      return;
    }

    try {
      await stake(amount, signedAccountId, lockupDays);
      toast.success("Staking successful!");
    } catch (error: any) {
      console.error("Error staking:", error);
      toast.error(`Staking failed: ${error.message || "Please try again."}`);
    }
  };

  const periods = {
    "1-Month": 25,
    "3-Month": 50,
    "6-Month": 75,
    "9-Month": 100,
  };

  // const handleNftStake = async () => {
  //   if (!signedAccountId) {
  //     toast.error("Please connect your wallet before stake your NFTs!");
  //     return;
  //   }
  //   if (selectedNFTs.length === 0) {
  //     toast.error("Please select an NFT to stake.");
  //     return;
  //   }

  //   try {
  //     const senderId = signedAccountId;
  //     const result = await stakeNFTs(selectedNFTs, senderId);
  //     console.log("Staked NFTs result:", result);
  //   } catch (error) {
  //     console.error("Error staking NFTs:", error);
  //     toast.error("Staking failed. Please try again.");
  //   }
  // };
  const { approveNft } = useNftApprove(wallet, "artbattle.mintspace2.testnet");
  const { transferNft } = useNftTransferCall(
    wallet,
    "artbattle.mintspace2.testnet"
  );

  const handleNftStake = async () => {
    try {
      for (const tokenId of selectedNFTs) {
        const receiverContractId = "sin-nft-contract-account23.testnet";

        const approveResult = await approveNft(
          tokenId,
          receiverContractId,
          signedAccountId
        );
        console.log(`NFT approved successfully:`, approveResult);
      }

      alert("All selected NFTs staked successfully!");
    } catch (error) {
      console.error("Error staking NFTs:", error);
      alert("Failed to stake one or more NFTs. Please try again.");
    }
  };

  const { getTransactionDetails, approveId, tokenIds } = useTransactionDetails(wallet);

  useEffect(() => {
    console.log("Extracting query parameters from URL...");
    const params = new URLSearchParams(window.location.search);
    const isApproveParam = params.get("isApprove") === "true";
    const transactionHashes = params.get("transactionHashes");
  
    console.log("isApprove:", isApproveParam);
    console.log("transactionHashes:", transactionHashes);
  
    setIsApprove(isApproveParam);
    setTransactionHash(transactionHashes);
  }, []);
  
  // Fetch transaction details and approvalId if `isApprove` is true
  useEffect(() => {
    const fetchAndHandleTransaction = async () => {
      console.log("Starting fetchAndHandleTransaction...");
      console.log("isApprove:", isApprove);
      console.log("transactionHash:", transactionHash);
  
      if (isApprove && transactionHash) {
        try {
          console.log("Fetching transaction details...");
          const { transaction, approvalId, tokenIds: fetchedTokenIds } = await getTransactionDetails(transactionHash);
  
          console.log("Transaction Details:", transaction);
          console.log("Fetched Approval ID:", approvalId);
          console.log("Fetched Token IDs:", fetchedTokenIds);
  
          if (approvalId && fetchedTokenIds.length > 0) {
            console.log("Approval ID and Token IDs found, proceeding to handleClick...");
            await handleClick(approvalId, fetchedTokenIds);
          } else {
            console.error("Approval ID or Token IDs not found in the transaction logs.");
          }
        } catch (error) {
          console.error("Error fetching transaction details:", error);
        }
      } else {
        console.log("isApprove is false or transactionHash is null. Skipping fetch.");
      }
    };
  
    fetchAndHandleTransaction();
  }, [isApprove, transactionHash, getTransactionDetails]);
  
  // Function to handle NFT transfer
  const handleClick = async (approvalId: number, selectedNFTs: string[]) => {
    console.log("Starting handleClick with approvalId:", approvalId);
    console.log("Selected NFTs for transfer:", selectedNFTs);
  
    const receiverContractId = "sin-nft-contract-account23.testnet";
  
    for (const tokenId of selectedNFTs) {
      console.log(`Initiating transfer for tokenId: ${tokenId}`);
      try {
        const transferResult = await transferNft(
          tokenId,
          approvalId,
          receiverContractId,
          signedAccountId
        );
        console.log(
          `NFT transfer successful for tokenId: ${tokenId}`,
          transferResult
        );
      } catch (error) {
        console.error(
          `Error transferring NFT with tokenId: ${tokenId}`,
          error
        );
      }
    }
  };
  
  const handlePeriodSelection = (
    period: "1-Month" | "3-Month" | "6-Month" | "9-Month"
  ) => {
    setSelectedPeriod(period);
  };
  // Format the raw yocto balance to readable SIN balance
  const parsedBalance = balance ? formatSinBalance(balance) : "0";

  // Update the range click handler to use human-readable balance
  const handleRangeClick = (clickedPercentage: number) => {
    const parsedBalanceFloat = parseFloat(parsedBalance);
    const newAmount = ((clickedPercentage / 100) * parsedBalanceFloat).toFixed(
      8
    ); // Use parsedBalance in SIN format
    setAmount(newAmount);
    setPercentage(clickedPercentage);
  };

  // Handle input change and update the range based on the value
  const handleInputChange = (value: string) => {
    setAmount(value);
    const numericValue = parseFloat(value);
    const parsedBalanceFloat = parseFloat(parsedBalance);

    if (!isNaN(numericValue) && parsedBalanceFloat > 0) {
      const calculatedPercentage = (numericValue / parsedBalanceFloat) * 100;
      setPercentage(Math.min(100, Math.max(0, calculatedPercentage))); // Keep percentage within 0-100 range
    } else {
      setPercentage(0); // Reset to 0 if input is invalid
    }
  };
  const toggleSelectNFT = (token_id: string) => {
    console.log("Selected NFT token_id:", token_id);

    setSelectedNFTs((prevSelectedNFTs) => {
      if (prevSelectedNFTs.includes(token_id)) {
        return prevSelectedNFTs.filter((id) => id !== token_id);
      } else {
        return [...prevSelectedNFTs, token_id];
      }
    });
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "STAKE_NFT") {
      setCurrentTab("STAKE_NFT");
    }
  }, [searchParams]);

  const handleSignIn = async () => {
    return wallet?.signIn();
  };
  const handleSignout = async () => {
    return wallet?.signOut();
  };
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    if (signedAccountId) {
      fetchStakingInfo(signedAccountId);
    }
  }, [signedAccountId]);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing until it's on the client.
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-2 py-10 pt-[100px]">
      {signedAccountId ? (
        <div className="w-[95%] md:w-[500px]">
          {" "}
          <div className="flex flex-row items-center justify-between mt-10 px-6 py-3 bg-[#f8b12c] rounded-full md:w-[500px]">
            <span
              className="md:text-lg text-sm font-bold text-[#353333] uppercase cursor-pointer"
              style={{ fontFamily: "montserrat-variablefont" }}
              onClick={handleSignout}
            >
              DISCONNECT
            </span>
            <span
              className="flex flex-row items-center justify-center gap-1 font-medium md:text-lg text-sm text-black"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              <img src="/images/green-btn.png" className="w-4 h-4" />{" "}
              {signedAccountId}
            </span>
          </div>
          <div className="flex flex-row items-center justify-between mt-5 px-6 py-3 bg-[#f8b12c] rounded-full md:w-[500px]">
            <span
              className="md:text-lg text-sm font-bold text-[#353333] uppercase"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              SIN BALANCE
            </span>
            <span
              className="font-medium md:text-lg text-sm text-black"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              {balance ? formatSinBalance(balance) : ""}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="w-[95%] md:w-[500px] flex items-center justify-center"
          onClick={handleSignIn}
        >
          <button
            className="mt-10 px-6 py-3 bg-[#f8b12c] rounded-full w-[90%] md:w-[500px] md:text-lg text-sm font-bold text-[#353333] uppercase"
            style={{ fontFamily: "montserrat-variablefont" }}
          >
            CONNECT
          </button>
        </div>
      )}
      <div
        className="flex justify-between items-center w-[90%] md:w-[500px] mb-6 mt-6"
        style={{ fontFamily: "montserrat-variablefont" }}
      >
        <button
          onClick={() => setCurrentTab("STAKE_SIN")}
          className={`${
            currentTab === "STAKE_SIN" ? "bg-[#f8b12c]" : "bg-yellow-700"
          } text-[#3b2d2f] md:text-sm text-xs font-bold px-4 py-2 rounded-full shadow-md`}
        >
          STAKE $SIN
        </button>
        <button
          onClick={() => setCurrentTab("STAKE_NFT")}
          className={`${
            currentTab === "STAKE_NFT" ? "bg-[#f8b12c]" : "bg-yellow-700"
          } text-[#3b2d2f] md:text-sm text-xs font-bold px-4 py-2 rounded-full shadow-md`}
        >
          STAKE NFT
        </button>
      </div>

      <div className="rounded-xl bg-black bg-opacity-70 shadow-lg w-[90%] md:w-[500px] md:px-6 md:py-6 px-5 py-5 border border-yellow-400 ">
        {currentTab === "STAKE_SIN" && (
          <>
            <div>
              <h4
                className="text-center font-semibold text-sm mb-3 uppercase"
                style={{ fontFamily: "montserrat-variablefont" }}
              >
                <span className="text-[#e88852] md:text-sm text-xs ">
                  Last Reward Distribution:
                </span>{" "}
                <span className="text-yellow-300 md:text-sm text-xs ">
                  {tokenRewardDistribution
                    ? new Date(
                        Number(tokenRewardDistribution) / 1_000_000
                      ).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "No rewards claimed yet"}
                </span>
              </h4>

              <div className="flex flex-row items-center justify-between">
                <h2
                  className="text-center text-yellow-400 font-semibold mb-4 text-xs md:text-sm"
                  style={{ fontFamily: "montserrat-variablefont" }}
                >
                  CHOOSE A LOCK-UP PERIOD
                </h2>
                <div
                  className="text-center bg-black text-yellow-500 font-bold rounded-lg md:text-sm text-xs md:px-4 px-2 py-2 mb-6"
                  style={{
                    border: "1px solid #eeb636",
                    fontFamily: "montserrat-variablefont",
                  }}
                >
                  Est APR: 118%
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                {Object.keys(periods).map((period) => (
                  <div key={period}>
                    <button
                      className={`${
                        selectedPeriod === period
                          ? "bg-yellow-600"
                          : "bg-[#eeb636]"
                      } text-[#3b2d2f] font-semibold rounded-full md:py-2 md:px-4 px-2 py-1 text-[11px] md:text-sm hover:bg-yellow-600`}
                      onClick={() =>
                        handlePeriodSelection(
                          period as
                            | "1-Month"
                            | "3-Month"
                            | "6-Month"
                            | "9-Month"
                        )
                      }
                      style={{ fontFamily: "montserrat-variablefont" }}
                    >
                      {period}
                    </button>
                    <p
                      className="md:text-sm text-xs mt-1"
                      style={{ fontFamily: "Garet-book" }}
                    >
                      {period === "1-Month"
                        ? "base ARP"
                        : `${
                            (periods[period as keyof typeof periods] - 25) / 25
                          }x ARP`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 mt-9 relative w-full h-1 bg-yellow-400 rounded-lg">
              {[0, 25, 50, 75, 100].map((point) => (
                <div key={point} className="relative">
                  <div
                    className="absolute top-[-20px] text-xs text-yellow-600 font-semibold transform -translate-x-1/2 -translate-y-4"
                    style={{ left: `${point}%`, fontFamily: "Garet-book" }}
                  >
                    {point}%
                  </div>

                  <div
                    className="absolute top-[-10px] h-6 w-1 bg-yellow-400 transform -translate-x-1/2 cursor-pointer"
                    style={{ left: `${point}%` }}
                    onClick={() => handleRangeClick(point)}
                  ></div>
                </div>
              ))}

              <div
                className="absolute top-[-7px] h-4 w-4 rounded-full bg-yellow-600 transform -translate-x-1/2"
                style={{ left: `${percentage}%` }}
              ></div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <input
                type="text"
                placeholder="Enter the amount"
                className="bg-[#3b2d2f] text-yellow-500 rounded-full md:py-2 md:px-4 py-1 px-2 w-[180px] md:w-[230px] md:placeholder:text-base placeholder:text-[13px]"
                style={{ fontFamily: "Garet-book" }}
                value={amount}
                onChange={(e) => handleInputChange(e.target.value)}
              />

              <div className="text-center">
                <button
                  onClick={handleStake}
                  className="bg-yellow-500 text-[#3b2d2f] md:text-sm text-xs font-bold md:px-[50px] px-[20px] py-2 rounded-full shadow-md hover:bg-yellow-600"
                  style={{ fontFamily: "montserrat-variablefont" }}
                >
                  STAKE
                </button>
              </div>
            </div>
          </>
        )}
        {currentTab === "STAKE_NFT" && (
          <div>
            <h4
              className="text-center font-semibold text-sm mb-3 uppercase"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              <span className="text-[#e88852] md:text-sm text-xs ">
                Last Reward Distribution:
              </span>{" "}
              <span className="text-yellow-300 md:text-sm text-xs ">
                {nftRewardDistribution
                  ? new Date(
                      Number(nftRewardDistribution) / 1_000_000
                    ).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "No rewards claimed yet"}
              </span>
            </h4>
            <div
              className="flex justify-center mb-6"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              <h2 className="cursor-pointer md:text-lg text-sm font-bold text-yellow-400">
                YOUR NFTs
              </h2>
            </div>
            {signedAccountId && nfts.length === 0 && !loading && !error && (
              <div className="flex items-center justify-center h-[350px]">
                <p
                  className="text-gray-500 text-center text-sm"
                  style={{ fontFamily: "montserrat-variablefont" }}
                >
                  You don&apos;t have any NFTs
                </p>
              </div>
            )}
            {!signedAccountId && !loading && !error && (
              <div className="flex items-center justify-center h-[350px]">
                <p
                  className="text-gray-500 text-center text-sm"
                  style={{ fontFamily: "montserrat-variablefont" }}
                >
                  Connect your wallet and start staking your NFTs
                </p>
              </div>
            )}
            {nfts.length > 0 && (
              <div
                className="overflow-y-auto h-[250px] container mb-3 md:p-2 p-0"
                ref={containerRef}
              >
                {nfts.length > 0 && (
                  <div className="grid grid-cols-4 md:gap-5 gap-2 mb-6 ">
                    {nfts.map((nft, index) => (
                      <div
                        key={index}
                        className="relative cursor-pointer"
                        onClick={() => toggleSelectNFT(nft.token_id)}
                      >
                        <img
                          src={nft.media || "/images/mintbase.png"}
                          alt={`NFT ${index + 1}`}
                          className="rounded-lg md:w-[100px] md:h-[90px] w-[100px] h-[70px]"
                        />
                        <div
                          className="absolute bottom-2 right-2 h-4 w-4 rounded-sm flex items-center justify-center bg-black"
                          style={{ border: "1px solid #eeb636" }}
                        >
                          {selectedNFTs.includes(nft.token_id) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-yellow-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex items-center justify-center">
                        <Loader />
                      </div>
                    )}
                    {error && (
                      <p
                        className="text-red-500"
                        style={{ fontFamily: "montserrat-variablefont" }}
                      >
                        Failed to load NFT
                      </p>
                    )}
                    {/* {!hasMore && (
                  <p
                    className="flex items-center justify-center text-gray-500 text-center text-xs"
                    style={{ fontFamily: "montserrat-variablefont" }}
                  >
                    No more NFT&apos;s to load
                  </p>
                )} */}
                  </div>
                )}
              </div>
            )}
            <div
              className="flex flex-row items-center justify-between"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              <button
                className="bg-yellow-500 text-[#3b2d2f] font-bold md:px-[40px] px-4 md:text-sm text-xs py-2 rounded-full shadow-md hover:bg-yellow-600"
                onClick={handleNftStake}
              >
                STAKE
              </button>
              <span className="text-[#eeb636] font-semibold md:text-sm text-xs">
                *LOCK-UP PERIOD IS ONE MONTH
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 text-center text-yellow-400">
        <p
          style={{ fontFamily: "Garet-book" }}
          className="md:text-base text-xs font-semibold"
        >
          DONT HAVE $SIN? BUY SOME ON REF FINANCE
        </p>
        <a
          href="https://app.ref.finance/pool/5583"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/ref-finace.png"
            alt="Ref Finance"
            className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] mx-auto mt-4"
          />
        </a>
      </div>
      <Toaster />
    </div>
  );
}
