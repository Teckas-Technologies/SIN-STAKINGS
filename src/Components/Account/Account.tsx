/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSinBalance } from "@/hooks/fetchSinBalance";
import { NearContext } from "@/wallet/WallletSelector";
import { useContext } from "react";

export default function NFTStakeSection() {
  const { wallet, signedAccountId } = useContext(NearContext);
  const { balance, error } = useSinBalance({ wallet, signedAccountId });
  const handleSignIn = async () => {
    return wallet?.signIn();
  };
  const handleSignout = async () => {
    return wallet?.signOut();
  };
  const totalTokensStaked = "25,00000000";
  const totalNFTsStaked = 5;

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center mt-[100px]">
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
        <div className="w-[90%] md:w-[500px]" onClick={handleSignIn}>
          <button className="flex flex-row items-center justify-center mt-10 px-6 py-3 bg-[#f8b12c] rounded-full md:w-[500px]">
            <span
              className="md:text-lg text-sm font-bold text-[#353333] uppercase"
              style={{ fontFamily: "montserrat-variablefont" }}
            >
              CONNECT
            </span>
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

        {/* Vertical line for md and above */}
        <div className="hidden md:block h-12 w-[1px] bg-yellow-400"></div>

        {/* Horizontal line for sm screens */}
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
