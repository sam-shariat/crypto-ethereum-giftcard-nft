import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { contractInfo, ethPriceAtom, mintWalletAddress } from "../constants/atoms";
import { sleep } from "../utils/functions";
import NFTs from "./NFTs";

const NFTsContainer = () => {
  const { isWeb3Enabled, account } = useMoralis();
  const [priceIsLoading, setPriceIsLoading] = useState(false);
  const contract = useAtomValue(contractInfo);
  const setEthPrice = useSetAtom(ethPriceAtom);
  const setWalletAddress = useSetAtom(mintWalletAddress)

  const { runContractFunction: getLatestPrice } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "getLatestPrice",
    params: {},
  });

  async function updatePrice() {
    if (!priceIsLoading) {
      setPriceIsLoading(true);
      let price = await getLatestPrice();
      if (price) {
        let ETHPrice = parseInt(price.toString()) / 1e8;
        setEthPrice(Math.round(ETHPrice * 100) / 100);
        setPriceIsLoading(false);
        console.log("price is ", ETHPrice);
      } else {
        console.log("error getting eth number");
        setPriceIsLoading(false);
        await sleep(5000);
        updatePrice();
      }
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      setWalletAddress(account);
      updatePrice();
    }
  }, [isWeb3Enabled, account]);
  return <NFTs />;
};

export default NFTsContainer;
