/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { toast, Toaster } from "react-hot-toast";
import { useSinBalance } from "@/hooks/fetchSinBalance";
import { useStake } from "@/hooks/useStake";
import { NearContext } from "@/wallet/WallletSelector";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useClaimRewards } from "@/hooks/useClaimRewards";
import { useStakingInfo } from "@/hooks/viewStakingToken";
import useFetchNFTMedia from "@/hooks/useFeed";
import "./Stake.css";
import Loader from "../Loader/Loader";
import { SIN_STAKING_CONTRACT_NFT_STAKE } from "@/config/constants";
export default function StakeSection() {
  const { wallet, signedAccountId } = useContext(NearContext);
  const { balance } = useSinBalance({ wallet, signedAccountId });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "1-Month" | "3-Month" | "6-Month" | "9-Month" | null
  >(null);
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<"STAKE_SIN" | "STAKE_NFT">(
    "STAKE_SIN"
  );
  const [activeSection, setActiveSection] = useState<"stake" | "unstake">(
    "stake"
  );
  const [amount, setAmount] = useState<string>("");
  const [isClaiming, setIsClaiming] = useState(false);
  const { claimRewards } = useClaimRewards(
    wallet,
    "sin-contract-account10.testnet"
  );
  const { stakingInfo, fetchStakingInfo } = useStakingInfo(
    wallet,
    "sin-contract-account10.testnet"
  );
  const nft_contract_id = SIN_STAKING_CONTRACT_NFT_STAKE;
  const { nfts, loading, error, fetchNFTData, hasMore } = useFetchNFTMedia({
    nft_contract_id: nft_contract_id,
    owner: signedAccountId,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const bottom =
        containerRef.current.scrollHeight ===
        containerRef.current.scrollTop + containerRef.current.clientHeight;

      if (bottom && !loading && hasMore) {
      
        fetchNFTData();
      }
    }
  };

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
    }

    
    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [fetchNFTData, loading, hasMore]);
  const { stake } = useStake(wallet, "sin-contract-account10.testnet");
  const handleStake = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!selectedPeriod) {
      toast.error("Please select a lock-up period."); 
      return;
    }

    try {
    
      console.log("Selected lock-up period:", selectedPeriod);
      const lockupDays = {
        "1-Month": 30,
        "3-Month": 90,
        "6-Month": 180,
        "9-Month": 270,
      }[selectedPeriod];

      await stake(amount, signedAccountId, lockupDays);
      toast.success("Staking successful!");
    } catch (error) {
      console.error("Error staking:", error);
      toast.error("Staking failed. Please try again."); 
    }
  };

  const periods = {
    "1-Month": 25,
    "3-Month": 50,
    "6-Month": 75,
    "9-Month": 100,
  };
  // const nfts = Array.from({ length: 8 }, (_, i) => `nft-${i + 1}`);
  const handlePeriodSelection = (
    period: "1-Month" | "3-Month" | "6-Month" | "9-Month"
  ) => {
    setSelectedPeriod(period);
  };
  const toggleSelectNFT = (nft: string) => {
    setSelectedNFTs((prev) =>
      prev.includes(nft) ? prev.filter((item) => item !== nft) : [...prev, nft]
    );
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

  const handleClaim = async () => {
    if (isClaiming) return;

    if (!stakingInfo) {
      toast.error("No staking information available.");
      return;
    }

    const lockupEndDate = new Date(
      (stakingInfo.start_time + stakingInfo.lockup_duration) * 1000
    );
    console.log("lock up ", lockupEndDate);

    const currentDate = new Date();
    console.log("current ", currentDate);

    const lockupDurationMonths = Math.ceil(
      stakingInfo.lockup_duration / (60 * 60 * 24 * 30)
    );

    if (currentDate < lockupEndDate) {
      const diffInMs = lockupEndDate.getTime() - currentDate.getTime();

      const formattedLockupEndDate = lockupEndDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      toast.error(
        `You are in the lock-up period of ${lockupDurationMonths} month(s). Rewards can only be claimed after ${formattedLockupEndDate}.`
      );
      return;
    }

    setIsClaiming(true);
    try {
      await claimRewards();
      toast.success("Rewards claimed successfully!");
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-2 py-10 mt-[100px]">
      {signedAccountId ? (
        <div className="w-[90%] md:w-[500px]">
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

      <div className="rounded-lg bg-black bg-opacity-70 shadow-lg w-[90%] md:w-[500px] md:px-6 md:py-6 px-4 py-5 border border-yellow-400 ">
        {currentTab === "STAKE_SIN" && (
          <>
            <div>
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
                      } text-[#3b2d2f] font-semibold rounded-full md:py-2 md:px-4 px-2 py-1 text-xs md:text-sm hover:bg-yellow-600`}
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

            <div className="mb-6 mt-9">
              <div className="relative w-full h-1 bg-yellow-400 rounded-lg">
                {Object.values(periods).map((percent, index) => (
                  <div
                    key={index}
                    className="absolute top-[-10px] h-6 w-[4px] bg-yellow-400 transform -translate-x-1/2"
                    style={{ left: `${percent}%` }}
                  />
                ))}

                {[0, ...Object.values(periods)].map((percent, index) => (
                  <div
                    key={index}
                    className="absolute text-yellow-400 md:text-sm text-[10px] font-semibold transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${percent}%`,
                      top: "-20px",
                      fontFamily: "montserrat-variablefont",
                    }}
                  >
                    {percent}%
                  </div>
                ))}

                <div
                  className="absolute top-1/2 w-4 h-4 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: selectedPeriod ? `${periods[selectedPeriod]}%` : "0%",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <input
                type="text"
                placeholder="Enter the amount"
                className="bg-[#3b2d2f] text-yellow-500 rounded-full md:py-2 md:px-4 py-2 px-2"
                style={{ fontFamily: "Garet-book" }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            <button
              onClick={handleClaim}
              className={`bg-yellow-500 text-[#3b2d2f] md:text-sm text-xs font-bold md:px-[50px] px-[20px] py-2 flex items-center justify-center rounded-full shadow-md ${
                isClaiming
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-600"
              }`}
              style={{
                margin: "0 auto",
                marginTop: "20px",
                fontFamily: "montserrat-variablefont",
              }}
            >
              {isClaiming ? "Claiming..." : "Claim Rewards"}
            </button>
          </>
        )}
        {currentTab === "STAKE_NFT" && (
          <div>
            <div
              className="flex justify-between mb-6"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              <h2
                className={`cursor-pointer md:text-lg text-sm font-bold ${
                  activeSection === "stake"
                    ? "text-yellow-400"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveSection("stake")}
              >
                YOUR NFTs
              </h2>
              <h2
                className={`cursor-pointer md:text-lg text-sm font-bold ${
                  activeSection === "unstake"
                    ? "text-yellow-400"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveSection("unstake")}
              >
                YOUR STAKED NFTs
              </h2>
            </div>
            {nfts.length === 0 && !loading && !error && (
              <div className="flex items-center justify-center h-[350px]">
                <p
                  className="text-gray-500 text-center text-sm"
                  style={{ fontFamily: "montserrat-variablefont" }}
                >
                  You don&apos;t have any NFTs
                </p>
              </div>
            )}

            {nfts.length > 0 && (
              <div
                className="grid grid-cols-4 md:gap-5 gap-2 mb-6 overflow-y-auto h-[350px] container"
                ref={containerRef}
              >
                {nfts.map((nft, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer rounded-lg"
                    onClick={() => toggleSelectNFT(nft.token_id)}
                  >
                    <img
                      src={nft.media || "/images/mintbase.png"}
                      alt={`NFT ${index + 1}`}
                      className="rounded-lg md:w-[100px] md:h-[80px] w-[100px] h-[70px]"
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
                {!hasMore && (
                  <p
                    className="flex items-center justify-center text-gray-500 text-center text-xs"
                    style={{ fontFamily: "montserrat-variablefont" }}
                  >
                    No more NFT&apos;s to load
                  </p>
                )}
              </div>
            )}

            <div
              className="flex flex-row items-center justify-between"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              <button className="bg-yellow-500 text-[#3b2d2f] font-bold w-[100px] md:text-sm text-xs py-2 rounded-full shadow-md hover:bg-yellow-600">
                {activeSection === "stake" ? "STAKE" : "UNSTAKE"}
              </button>
              <span className="text-[#eeb636] md:text-sm text-xs">
                *LOCK-UP PERIOD IS ONE MONTH
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 text-center text-yellow-400">
        <p style={{ fontFamily: "Garet-book" }}>
          DONT HAVE $SIN? BUY SOME ON REF FINANCE
        </p>
        <img
          src="/images/Ref-finace.png"
          alt="Ref Finance"
          className="w-16 h-16 mx-auto mt-4"
        />
      </div>
      <Toaster />
    </div>
  );
}
