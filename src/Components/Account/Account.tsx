import { SIN_STAKING_CONTRACT_NFT_STAKE } from "@/config/constants";
import { useSinBalance } from "@/hooks/fetchSinBalance";
import { useStakingInfo } from "@/hooks/viewStakingToken";
import { NearContext } from "@/wallet/WallletSelector";
import { useContext, useEffect } from "react";
import Loader from "../Loader/Loader";

// Function to convert yocto-units to NEAR and format it
function formatYoctoAmount(amountYocto: string) {
  // Convert yocto-units to NEAR (or the token's base unit)
  const amountBase = Number(amountYocto) / Math.pow(10, 24);

  // Format with two decimal places for readability
  return amountBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NFTStakeSection() {
  const { wallet, signedAccountId } = useContext(NearContext);
  const { balance} = useSinBalance({ wallet, signedAccountId });
  const { stakingInfo,fetchStakingInfo} = useStakingInfo(wallet, SIN_STAKING_CONTRACT_NFT_STAKE);
  const handleSignIn = async () => {
    return wallet?.signIn();
  };
  const handleSignout = async () => {
    return wallet?.signOut();
  };

  const totalTokensStaked = stakingInfo?.amount ? formatYoctoAmount(stakingInfo.amount) : <Loader/>; 
  const totalNFTsStaked = 5;

  useEffect(() => {
    if (signedAccountId) {
      fetchStakingInfo(signedAccountId);
    }
  }, [signedAccountId]);

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
        className="flex flex-col md:flex-row items-center justify-between gap-4 mt-10 p-6 bg-black bg-opacity-80 shadow-lg w-[90%] md:w-[500px] border border-yellow-400 rounded-lg"
        style={{ fontFamily: "montserrat-variablefont" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-yellow-400">
            Total Tokens Staked
          </span>
          <span className="text-2xl font-bold text-white">
            {totalTokensStaked}
          </span>
        </div>
        <div className="hidden md:block h-12 w-[1px] bg-yellow-400"></div>
        <div className="block md:hidden w-full h-[1px] bg-yellow-400"></div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-yellow-400">
            Total NFTs Staked
          </span>
          <span className="text-2xl font-bold text-white">
            {totalNFTsStaked}
          </span>
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
    </div>
  );
}
