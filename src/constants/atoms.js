import { atom } from "jotai";
import contracts from "./contracts.json";
const mintStatusAtom = atom("OPEN");
const mintValue = atom(0);
const mintText = atom("");
const mintColorIndex = atom(0);
const mintWalletAddress = atom("");
const ethPriceAtom = atom(null);
const ethValueAtom = atom((get) => {
  return Math.round(get(mintValue) * get(ethPriceAtom));
});
const colorIndexAtom = atom(0);
const colorCodesAtom = atom([]);
const colorAtom = atom((get) => {
  return "#" + get(colorCodesAtom)[get(mintColorIndex)];
});
const mintFeeAtom = atom(0);
const mintFeeUSDAtom = atom((get) => {
  return Math.round(get(mintFeeAtom) * get(ethPriceAtom) * 10) / 10;
});

const contractInfo = atom({
  address: contracts[5][0].contracts.GiftCard.address,
  abi: contracts[5][0].contracts.GiftCard.abi,
});

const mintedAtom = atom(null);
const redeemStatusAtom = atom("IDLE");
const transferStatusAtom = atom("IDLE");
const redeemIndexAtom = atom(null);
const transferIndexAtom = atom(null);
const transferWalletAtom = atom("");
const NFTsAtom = atom([]);
const URIsAtom = atom([]);
const valuesAtom = atom([]);
const allValueAtom = atom(null);
const selectedTokenIndexAtom = atom(null);

export {
  mintStatusAtom,
  mintValue,
  mintText,
  mintColorIndex,
  mintWalletAddress,
  contractInfo,
  ethPriceAtom,
  ethValueAtom,
  colorIndexAtom,
  colorCodesAtom,
  colorAtom,
  mintFeeAtom,
  mintFeeUSDAtom,
  mintedAtom,
  redeemStatusAtom,
  NFTsAtom,
  URIsAtom,
  valuesAtom,
  redeemIndexAtom,
  transferIndexAtom,
  transferStatusAtom,
  transferWalletAtom,
  allValueAtom,
  selectedTokenIndexAtom
};
