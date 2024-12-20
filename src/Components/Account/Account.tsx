/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SIN_STAKING_CONTRACT_CLAIM_NFT_REWARDS,
  SIN_STAKING_CONTRACT_CLAIM_REWARDS,
  SIN_STAKING_CONTRACT_NFT_STAKE,
  SIN_STAKING_CONTRACT_NFT_STAKE_INFO,
  SIN_STAKING_CONTRACT_STAKE_INFO,
} from "@/config/constants";
import { useSinBalance } from "@/hooks/fetchSinBalance";
import { useStakingInfo } from "@/hooks/viewStakingToken";
import { NearContext } from "@/wallet/WallletSelector";
import { useContext, useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useClaimTokenRewards } from "@/hooks/useClaimTokenRewards";
import { useUnstake } from "@/hooks/useUnstake";
import "./Account.css";
import { useNftStakingInfo } from "@/hooks/viewStakingNft";
import { useClaimNftRewards } from "@/hooks/useClaimNftRewards";
import { useUnstakeNfts } from "@/hooks/useUnstakeNft";
import { useRewardDistribution } from "@/hooks/getNextRewardDistribution";
import { useSearchParams } from "next/navigation";

interface StakingInfo {
  staked_tokens: string;
  claimed_rewards: string;
  start_timestamp: number;
  lockup_period: number;
}
export interface StakeNftInfo {
  nft_ids: string[];
  lockup_period: number;
  start_timestamp: number;
  claimed_rewards: string;
  queen: string;
  drone: string;
  worker: string;
}

interface NFTStakeSectionProps {
  activeTable: "tokens" | "nfts";
  setActiveTable: (value: "tokens" | "nfts") => void;
}
export const NFTStakeSection: React.FC<NFTStakeSectionProps> = ({
  activeTable,
  setActiveTable,
}) => {
  const [selectedStaking, setSelectedStaking] = useState<StakingInfo | null>(
    null
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTokenPopupVisible, setIsTokenPopupVisible] = useState(false);
  const [selectedNftStaking, setSelectedNftStaking] =
    useState<StakeNftInfo | null>(null);
  const [selectedNftIndex, setSelectedNftIndex] = useState<number | null>(null);

  const [isNftPopupVisible, setIsNftPopupVisible] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isNftClaiming, setNftIsClaiming] = useState(false);

  const { wallet, signedAccountId } = useContext(NearContext);
  const { balance } = useSinBalance({ wallet, signedAccountId });
  const {
    stakingInfo,
    fetchStakingInfo,
    loading: stakingLoading,
    error: stakinginfoerror,
  } = useStakingInfo(wallet, SIN_STAKING_CONTRACT_STAKE_INFO);
  const {
    nftStakingInfo,
    nftLoading,
    error: nftStakingerror,
    fetchNftStakingInfo,
  } = useNftStakingInfo(wallet, SIN_STAKING_CONTRACT_NFT_STAKE_INFO);
  const { claimTokenRewards } = useClaimTokenRewards(
    wallet,
    SIN_STAKING_CONTRACT_CLAIM_REWARDS
  );
  const { claimNftRewards } = useClaimNftRewards(
    wallet,
    SIN_STAKING_CONTRACT_CLAIM_NFT_REWARDS
  );
  const { unstake } = useUnstake(wallet, SIN_STAKING_CONTRACT_STAKE_INFO);
  const { unstakeNfts } = useUnstakeNfts(
    wallet,
    SIN_STAKING_CONTRACT_NFT_STAKE
  );
  const handleSignIn = async () => {
    return wallet?.signIn();
  };
  const handleSignout = async () => {
    return wallet?.signOut();
  };
  const formatSinBalance = (balance: string): string => {
    const yoctoToSin = 1e24; // Conversion factor from yocto to SIN
    const sinBalance = parseFloat(balance) / yoctoToSin;
    return sinBalance.toFixed(8); // Display up to 8 decimal places
  };
  // const totalTokensStaked = stakingInfo?.amount ? (
  //   formatYoctoAmount(stakingInfo.amount)
  // ) : (
  //   <Loader />
  // );

  // useEffect(() => {
  //   const tab = searchParams.get("tab");
  //   if (tab === "Token") {
  //     setActiveTable("tokens");
  //   }
  //   if (tab === "Nft") {
  //     setActiveTable("nfts");
  //   }
  // }, [searchParams]);
  const formatYoctoAmount = (balance: string): string => {
    const yoctoToSin = 1e24; // Conversion factor from yocto to SIN
    const sinBalance = parseFloat(balance) / yoctoToSin;
    return sinBalance.toFixed(8); // Display up to 8 decimal places
  };

  const tokenContractId = SIN_STAKING_CONTRACT_CLAIM_REWARDS;
  const nftContractId = SIN_STAKING_CONTRACT_CLAIM_NFT_REWARDS;
  const {
    rewardDistribution: nftReward,
    loading: nftRewardLoading,
    error: nftError,
    fetchRewardDistribution: fetchNftReward,
  } = useRewardDistribution(wallet, nftContractId);
  const {
    rewardDistribution: tokenReward,
    loading: tokenLoading,
    error: tokenError,
    fetchRewardDistribution: fetchTokenReward,
  } = useRewardDistribution(wallet, tokenContractId);
  useEffect(() => {
    if (wallet && activeTable == "tokens") {
      fetchTokenReward();
    }
    if (wallet && activeTable == "nfts") {
      fetchNftReward();
    }
  }, [wallet, activeTable]);
  useEffect(() => {
    if (activeTable === "tokens" && signedAccountId) {
      fetchStakingInfo(signedAccountId);
      console.log("signedAccount id", signedAccountId);
    }
  }, [signedAccountId, activeTable]);
  useEffect(() => {
    if (activeTable === "nfts" && signedAccountId) {
      fetchNftStakingInfo(signedAccountId);
      console.log("called nft");
    }
  }, [activeTable, signedAccountId]);

  const handleNftClaim = async (stakeInfo: StakeNftInfo, index: number) => {
    if (isNftClaiming) return;

    if (!nftStakingInfo) {
      toast.error("No staking information available.");
      return;
    }

    if (parseFloat(stakeInfo.claimed_rewards) > 0) {
      setNftIsClaiming(true);

      try {
        const stakeIndex = index;
        await claimNftRewards(stakeIndex, signedAccountId);
      } catch (error) {
        console.error("Error claiming rewards:", error);
        toast.error("Failed to claim rewards. Please try again.");
      } finally {
        setNftIsClaiming(false);
      }
    }
  };
  const handleClaim = async (staking: StakingInfo, index: number) => {
    if (isClaiming) return;

    if (!stakingInfo) {
      toast.error("No staking information available.");
      return;
    }

    if (parseFloat(staking.claimed_rewards) > 0) {
      setIsClaiming(true);

      try {
        const stakeIndex = index;
        console.log(stakeIndex);

        await claimTokenRewards(stakeIndex, signedAccountId);
      } catch (error) {
        console.error("Error claiming rewards:", error);
        toast.error("Failed to claim rewards. Please try again.");
      } finally {
        setIsClaiming(false);
      }
    }
  };

  const handleUnstakeClick = (staking: StakingInfo, index: number) => {
    const currentTime = Date.now();
    const lockupEndTime =
      staking.start_timestamp / 1000000 + staking.lockup_period * 1000; // Convert lockup period to milliseconds

    // Check if the lockup period is completed
    // if (currentTime < lockupEndTime) {
    //   const unlockDate = new Date(lockupEndTime).toLocaleDateString("en-GB", {
    //     day: "2-digit",
    //     month: "short",
    //     year: "numeric",
    //   });
    //   toast.error(
    //     `Lockup period not completed. You can unstake your tokens after ${unlockDate}.`
    //   );
    //   return;
    // }

    // If lockup period is completed and tokenReward is 0
    if (tokenReward === 0) {
      handleUnstake(staking, index);
    } else {
      setSelectedStaking(staking);
      setSelectedIndex(index);
      setIsTokenPopupVisible(true);
    }
  };
  const handleUnstake = async (staking: StakingInfo, index: number) => {
    try {
      const stakeIndex = index;

      const result = await unstake(stakeIndex, signedAccountId);
      console.log("Unstake result:", result);
    } catch (error) {
      console.error("Error unstaking:", error);
    }
  };

  const handleUnstakeNftClick = (stakeInfo: StakeNftInfo, index: number) => {
    const currentTime = Date.now();
    const lockupEndTime =
      stakeInfo.start_timestamp / 1000000 + stakeInfo.lockup_period * 1000;
    console.log("end ", lockupEndTime);

    // Check if the lockup period is completed
    if (currentTime < lockupEndTime) {
      const unlockDate = new Date(lockupEndTime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      toast.error(
        `Lockup period not completed. You can unstake your tokens after ${unlockDate}.`
      );
      return;
    }

    // If lockup period is completed and tokenReward is 0
    if (nftReward === 0) {
      handleUnstakeNft(stakeInfo, index);
    } else {
      setSelectedNftStaking(stakeInfo);
      setSelectedNftIndex(index);
      setIsNftPopupVisible(true);
    }
  };
  const handleUnstakeNft = async (staking: StakeNftInfo, index: number) => {
    try {
      const stakeIndex = index;

      const result = await unstakeNfts(stakeIndex, signedAccountId);
      console.log("Unstake result:", result);
    } catch (error) {
      console.error("Error unstaking:", error);
    }
  };
  console.log("staking error", stakinginfoerror);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center pt-[100px]">
      {signedAccountId ? (
        <div className="w-[90%] md:w-[500px]">
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
        className="flex flex-col items-center justify-center"
        style={{ fontFamily: "montserrat-variablefont" }}
      >
        <div className="flex flex-col  mt-10 md:p-6 p-3 bg-black bg-opacity-80 shadow-lg w-[95%] md:w-[1100px] border border-yellow-400 rounded-xl h-[400px] overflow-y-auto custom-scrollbar">
          <div className="flex flex-row items-center justify-between w-full mt-5">
            <div
              className={`flex flex-col items-center gap-2 cursor-pointer ${
                activeTable === "tokens" ? "text-yellow-400" : "text-gray-400"
              } p-2 rounded-md`}
              onClick={() => setActiveTable("tokens")}
            >
              <span className="md:text-lg text-sm font-semibold">
                Total Tokens Staked
              </span>
            </div>
            <div
              className={`flex flex-col items-center gap-2 cursor-pointer ${
                activeTable === "nfts" ? "text-yellow-400" : "text-gray-400"
              } p-2 rounded-md`}
              onClick={() => setActiveTable("nfts")}
            >
              <span className="md:text-lg text-sm font-semibold">
                Total NFTs Staked
              </span>
            </div>
          </div>

          <div className="w-full mt-4 bg-transparent flex items-center justify-center p-3">
            {activeTable === "tokens" && (
              <table className="table-auto w-full text-left">
                <thead>
                  <tr>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center">
                      S.NO
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center md:w-[160px] w-[134px]">
                      Staked Tokens
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center hidden md:table-cell">
                      Lockup Period
                    </th>
                    <th className="md:px-4 px-2 py-2 text-[12px] md:text-sm border-b text-yellow-700 text-center hidden md:table-cell">
                      Date of Staked
                    </th>
                    <th className="md:px-4 px-2 py-2 text-[12px] md:text-sm border-b text-yellow-700 text-center">
                      Reward
                    </th>
                    <th className="md:px-4 px-2 py-2 text-[12px] md:text-sm border-b text-yellow-700 text-center">
                      Unstake
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {signedAccountId ? (
                    stakingInfo && stakingInfo.length > 0 ? (
                      stakingInfo.map((staking: StakingInfo, index: number) => {
                        const formattedAmount = formatYoctoAmount(
                          staking.staked_tokens.toString()
                        );
                        const dateStaked = new Date(
                          staking.start_timestamp / 1000000
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const lockupPeriod = staking.lockup_period / 86400;
                        return (
                          <tr key={index}>
                            <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm ">
                              {index + 1}
                            </td>
                            <td className="px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm truncate max-w-[120px] overflow-hidden whitespace-nowrap">
                              {formattedAmount}
                            </td>
                            <td className="px-4 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden sm:table-cell">
                              {lockupPeriod} Days
                            </td>
                            <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden sm:table-cell">
                              {dateStaked}
                            </td>
                            <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center align-middle">
                              <div className="flex justify-center items-center">
                                <button
                                  onClick={() => handleClaim(staking, index)}
                                  className={`px-4 py-1 rounded-full text-[8px] md:text-xs font-medium ${
                                    parseFloat(staking.claimed_rewards) > 0
                                      ? "bg-yellow-400 text-black"
                                      : "bg-gray-400 text-gray-700 cursor-not-allowed "
                                  }`}
                                >
                                  Claim
                                </button>
                              </div>
                            </td>
                            <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center align-middle">
                              <div className="flex justify-center items-center">
                                <button
                                  onClick={() =>
                                    handleUnstakeClick(staking, index)
                                  }
                                  className="px-4 py-1 bg-yellow-400 text-black rounded-full text-[8px] md:text-xs font-medium"
                                >
                                  Unstake
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : stakingLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="w-5 h-5 border-4 border-t-yellow-400 border-solid rounded-full animate-spin"></div>
                            <span className="text-yellow-400 text-xs md:text-sm">
                              Loading...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Display error if no staking info is found
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-yellow-400 text-xs md:text-sm"
                        >
                          {stakinginfoerror ||
                            "You haven't staked any tokens yet. Start staking to claim your rewards here."}
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-yellow-400 text-xs md:text-sm"
                      >
                        Please connect your wallet to see the details.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTable === "nfts" && (
              <table className="table-auto w-full text-left">
                <thead>
                  <tr>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center">
                      S.NO
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center md:w-[160px] w-[126px]">
                      Staked NFTs
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center hidden md:table-cell">
                      Lockup Period
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center hidden md:table-cell">
                      Date Staked
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center hidden md:table-cell">
                      Queen
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center hidden md:table-cell">
                      Drone
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center hidden md:table-cell">
                      Worker
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center">
                      Reward
                    </th>
                    <th className="md:px-4 px-2 py-2 border-b text-[12px] md:text-sm text-yellow-700 text-center">
                      Unstake
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {signedAccountId ? (
                    nftStakingInfo && nftStakingInfo.length > 0 ? (
                      nftStakingInfo.map(
                        (stakeInfo: StakeNftInfo, index: number) => {
                          const lockupPeriodDays =
                            stakeInfo.lockup_period / 86400;
                          const dateStaked = new Date(
                            stakeInfo.start_timestamp / 1000000
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });
                          const claimedRewards = formatYoctoAmount(
                            stakeInfo.claimed_rewards.toString()
                          );

                          return (
                            <tr key={index}>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm">
                                {index + 1}
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm">
                                {stakeInfo.nft_ids.length} NFTs
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden md:table-cell">
                                {lockupPeriodDays} Days
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden md:table-cell">
                                {dateStaked}
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden md:table-cell">
                                {stakeInfo.queen}
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden md:table-cell">
                                {stakeInfo.drone}
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm hidden md:table-cell">
                                {stakeInfo.worker}
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center align-middle">
                                <button
                                  onClick={() =>
                                    handleNftClaim(stakeInfo, index)
                                  }
                                  className={`px-4 py-1 rounded-full text-[8px] md:text-xs font-medium ${
                                    parseFloat(stakeInfo.claimed_rewards) > 0
                                      ? "bg-yellow-400 text-black"
                                      : "bg-gray-400 text-gray-700 cursor-not-allowed "
                                  }`}
                                >
                                  Claim
                                </button>
                              </td>
                              <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center align-middle">
                                <div className="flex justify-center items-center">
                                  <button
                                    className="px-4 py-1 bg-yellow-400 text-black rounded-full text-[8px] md:text-xs font-medium"
                                    onClick={() => {
                                      handleUnstakeNftClick(stakeInfo, index);
                                    }}
                                  >
                                    Unstake
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )
                    ) : nftLoading ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="w-5 h-5 border-4 border-t-yellow-400 border-solid rounded-full animate-spin"></div>
                            <span className="text-yellow-400 text-xs md:text-sm">
                              Loading...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-8 text-center text-yellow-400 text-xs md:text-sm"
                        >
                          {nftStakingerror
                            ? nftStakingerror
                            : "No NFTs staked yet. Stake your NFTs to earn rewards."}
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-yellow-400 text-xs md:text-sm"
                      >
                        Please connect your wallet to see the details.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {isNftPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-[#1a1a1a] w-[350px] border border-yellow-400 p-6 text-center text-white rounded-xl"
            style={{ fontFamily: "Garet-book" }}
          >
            <p className="mb-6 font-semibold  text-sm ">
              Only {nftReward} days left for reward distribution. Are you sure
              you want to unstake your NFT??
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-full text-sm font-semibold"
                onClick={() => setIsNftPopupVisible(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2=1 bg-yellow-400 hover:bg-yellow-300 text-black text-sm rounded-full font-semibold"
                onClick={() => {
                  if (selectedNftStaking && selectedNftIndex !== null) {
                    handleUnstakeNft(selectedNftStaking, selectedNftIndex);
                    setIsNftPopupVisible(false);
                  }
                }}
              >
                Unstake
              </button>
            </div>
          </div>
        </div>
      )}
      {isTokenPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-[#1a1a1a] w-[350px] border border-yellow-400 p-6 text-center text-white rounded-xl"
            style={{ fontFamily: "Garet-book" }}
          >
            <p className="mb-6 font-semibold  text-sm ">
              Only {tokenReward} days left for reward distribution. Are you sure
              you want to unstake your token??
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-full text-sm font-semibold"
                onClick={() => setIsTokenPopupVisible(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2=1 bg-yellow-400 hover:bg-yellow-300 text-black text-sm rounded-full font-semibold"
                onClick={() => {
                  if (selectedStaking && selectedIndex !== null) {
                    handleUnstakeClick(selectedStaking, selectedIndex);
                    setIsTokenPopupVisible(false);
                  }
                }}
              >
                Unstake
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="mt-10 text-center text-yellow-400"
        style={{ fontFamily: "Garet-book" }}
      >
        <p className="font-semibold md:text-base text-xs">
          DONT HAVE THE NFT? GET ONE ON MITTE
        </p>
        <a
          href="https://beta.mitte.gg/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/mitte.png"
            alt="Mitte Logo"
            className="md:h-[60px] md:w-[60px] h-[40px] w-[40px] mx-auto mt-4 mb-3"
          />
        </a>
      </div>
      <Toaster />
    </div>
  );
};
