/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SIN_STAKING_CONTRACT_NFT_STAKE,
  SIN_STAKING_CONTRACT_STAKE_INFO,
} from "@/config/constants";
import { useSinBalance } from "@/hooks/fetchSinBalance";
import { useStakingInfo } from "@/hooks/viewStakingToken";
import { NearContext } from "@/wallet/WallletSelector";
import { useContext, useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useClaimRewards } from "@/hooks/useClaimRewards";
import { useUnstake } from "@/hooks/useUnstake";
import './Account.css'
interface StakingInfo {
  amount: string;
  staked_tokens: string;
  claimed_rewards: string;
  start_timestamp: number;
  lockup_period: number;
}

// Function to convert yocto-units to NEAR and format it
function formatYoctoAmount(amountYocto: string) {
  // Convert yocto-units to NEAR (or the token's base unit)
  const amountBase = Number(amountYocto) / Math.pow(10, 24);

  // Format with two decimal places for readability
  return amountBase.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function NFTStakeSection() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [activeTable, setActiveTable] = useState<"tokens" | "nfts">("tokens");
  const { wallet, signedAccountId } = useContext(NearContext);
  const { balance } = useSinBalance({ wallet, signedAccountId });
  const { stakingInfo, fetchStakingInfo, loading } = useStakingInfo(
    wallet,
    SIN_STAKING_CONTRACT_STAKE_INFO
  );
  const { claimRewards } = useClaimRewards(
    wallet,
    SIN_STAKING_CONTRACT_NFT_STAKE
  );
  const { unstake } = useUnstake(wallet, SIN_STAKING_CONTRACT_STAKE_INFO);
  const handleSignIn = async () => {
    return wallet?.signIn();
  };
  const handleSignout = async () => {
    return wallet?.signOut();
  };

  const totalTokensStaked = stakingInfo?.amount ? (
    formatYoctoAmount(stakingInfo.amount)
  ) : (
    <Loader />
  );

  useEffect(() => {
    if (signedAccountId) {
      fetchStakingInfo(signedAccountId);
    }
  }, [signedAccountId]);

  const handleClaim = async (staking: StakingInfo, index: number) => {
    if (isClaiming) return;

    if (!stakingInfo) {
      toast.error("No staking information available.");
      return;
    }

    const currentTime = Date.now();
    const stakingEndTime =
      staking.start_timestamp / 1000000 + staking.lockup_period * 1000;

    if (currentTime < stakingEndTime) {
      const remainingTime = Math.ceil(
        (stakingEndTime - currentTime) / 86400000
      );
      toast.error(
        `You are in the lockup period. Please wait ${remainingTime} days to claim.`
      );
      return;
    }

    setIsClaiming(true);

    try {
      const stakeIndex = index;
      await claimRewards(stakeIndex,signedAccountId);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards. Please try again.");
    } finally {
      setIsClaiming(false);
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

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center mt-[100px]">
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
              {balance}
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
        className="flex flex-col items-center justify-center table-container"
        style={{ fontFamily: "montserrat-variablefont" }}
      >
        <div className="flex flex-col items-center justify-between gap-4 mt-10 md:p-6 p-3 bg-black bg-opacity-80 shadow-lg w-[95%] md:w-[900px] border border-yellow-400 rounded-lg h-[400px] overflow-y-auto custom-scrollbar">
          <div className="flex flex-row items-center justify-between w-full">
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

          <div className="w-full mt-4 bg-transparent text-black rounded-lg shadow-lg p-4">
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
                  {stakingInfo && stakingInfo.length > 0 ? (
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
                      const lockupPeriod = staking.lockup_period / 86400; // Convert lockup period to days
                      const reward = staking.claimed_rewards
                        ? staking.claimed_rewards
                        : 0;

                      return (
                        <tr key={index}>
                          <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm ">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 border-b text-yellow-400 text-center text-[10px] md:text-sm truncate max-w-[120px] overflow-hidden whitespace-nowrap">
                            {staking.staked_tokens}
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
                                className="px-4 py-1 bg-yellow-400 text-black rounded-full text-[8px] md:text-xs font-medium"
                              >
                                Claim
                              </button>
                            </div>
                          </td>
                          <td className="md:px-4 px-2 py-2 border-b text-yellow-400 text-center align-middle">
                            <div className="flex justify-center items-center">
                              <button
                                onClick={() => handleUnstake(staking, index)}
                                className="px-4 py-1 bg-yellow-400 text-black rounded-full text-[8px] md:text-xs font-medium"
                              >
                                Unstake
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : stakingInfo && stakingInfo.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-yellow-400 text-xs md:text-sm"
                      >
                        You haven&apos;t staked any tokens yet. Start staking to
                        claim your rewards here.
                      </td>
                    </tr>
                  ) : (
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
                  )}
                </tbody>
              </table>
            )}

            {activeTable === "nfts" && (
              <table className="table-auto w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b text-yellow-700">
                      NFT ID
                    </th>
                    <th className="px-4 py-2 border-b text-yellow-700">Name</th>
                    <th className="px-4 py-2 border-b text-yellow-700 hidden sm:table-cell">
                      Date Staked
                    </th>
                    <th className="px-4 py-2 border-b text-yellow-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b text-yellow-400">101</td>
                    <td className="px-4 py-2 border-b text-yellow-400">
                      Golden NFT
                    </td>
                    <td className="px-4 py-2 border-b text-yellow-400 hidden sm:table-cell">
                      2024-12-15
                    </td>
                    <td className="px-4 py-2 border-b text-yellow-400">
                      Staked
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div
        className="mt-10 text-center text-yellow-400"
        style={{ fontFamily: "Garet-book" }}
      >
        <p>DONT HAVE THE NFT? GET ONE ON MITTE</p>
        <img
          src="/images/mitte.png"
          alt="Mitte Logo"
          className="h-[60px] w-[60px] mx-auto mt-4"
        />
      </div>
      <Toaster />
    </div>
  );
}
