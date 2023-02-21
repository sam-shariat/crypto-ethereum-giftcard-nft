import { Box, Paper } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { Loading } from "web3uikit";
import { contractInfo, ethPriceAtom, ethValueAtom, mintColorIndex, mintFeeAtom, mintFeeUSDAtom, mintText, mintValue, mintWalletAddress } from "../constants/atoms";
import Web3 from "web3";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
const web3 = new Web3(Web3.givenProvider);

const MintFee = () => {
  const [priceIsLoading, setPriceIsLoading] = useState(false);
  const [feeIsLoading, setFeeIsLoading] = useState(false);
  const ethValue = useAtomValue(ethValueAtom);
  const [ethPrice,setEthPrice] = useAtom(ethPriceAtom);
  const value = useAtomValue(mintValue);
  const [mintFee,setMintFee] = useAtom(mintFeeAtom);
  const mintFeeUSD = useAtomValue(mintFeeUSDAtom);
  const contract = useAtomValue(contractInfo);
  const walletAddress = useAtomValue(mintWalletAddress);
  const pickedColorIndex = useAtomValue(mintColorIndex);
  const textValue = useAtomValue(mintText);
  const { isWeb3Enabled, web3: MoralisWeb3, account } = useMoralis();

  const { runContractFunction: getLatestPrice } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "getLatestPrice",
    params: {},
  });

  async function updatePrice() {
    if (!priceIsLoading) {
      console.log("getting eth price...");
      setPriceIsLoading(true);
      let price = await getLatestPrice();
      let ETHPrice;
      if (price) {
        ETHPrice = parseInt(price.toString()) / 1e8;
        setEthPrice((s)=> Math.round(ETHPrice * 100) / 100);
        setPriceIsLoading(false);
        console.log("price is ", ETHPrice);
      } else {
        console.log("error getting eth number");
        setPriceIsLoading(false);
      }
    }
  }

  async function updateFeePrice() {
    if(ethPrice <= 0){
      updatePrice();
      return;
    }
    if (ethPrice > 0 && walletAddress && textValue.length > 0 && value > 0) {
      console.log("getting mint fee...");
      setFeeIsLoading(true);
      const GiftCard = new web3.eth.Contract(contract.abi,contract.address);
      const feeData = await MoralisWeb3.getFeeData();
      const maxGasPrice = feeData.maxPriorityFeePerGas.toString();
      GiftCard.methods
        .safeMint(account, textValue, pickedColorIndex)
        .estimateGas(
          {
            from: web3.currentProvider.selectedAddress,
            value: web3.utils.toWei(`${value}`, "ether"),
          },
          function (error, estimatedGas) {
            let fee =
              Math.round(
                web3.utils.fromWei(String(estimatedGas * maxGasPrice)) * 1e5
              ) / 1e5;
            setMintFee(fee);
            setFeeIsLoading(false);
            console.log(error);
          }
        );
    }
  }

  useEffect(() => {
    updateFeePrice();
  }, [isWeb3Enabled,walletAddress,textValue,value]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("eth price will be updated every 30 seconds");
      updatePrice();
    }, 30000);

    return () => clearInterval(interval);
  }, [isWeb3Enabled]);

  return (
    <Box>
      <Paper
        sx={{
          borderRadius: "10px",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            p: 1,
            justifyContent: "space-between",
          }}
        >
          <div>
            Value : {Math.round(value * 1e5) / 1e5} ETH
            {ethValue && !priceIsLoading ? ` ($${ethValue} USD)` : ""}
          </div>
          <div style={{ display: "flex", alignItems:"center" }}>
            ETH Price :
            {ethPrice && !priceIsLoading ? (
              ` $${ethPrice}`
            ) : (
              <Box sx={{ p: 1 }}>
                <Loading spinnerColor="#fff" spinnerType="wave" />
              </Box>
            )}
          </div>
        </Box>
        <Box
          sx={{
            display: "flex",
            borderTop: "1px solid #777",
            p: 1,
            alignItems:"center"
          }}
        >
          Mint Fee :
          {mintFee && !feeIsLoading ? (
            ` ${mintFee} ETH (~$${mintFeeUSD} USD)`
          ) : (
            <Box sx={{ px: 1 }}>
              {!feeIsLoading ? (
                "Enter All Fields"
              ) : (
                <Loading spinnerColor="#fff" spinnerType="wave" />
              )}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            borderTop: "1px solid #777",
            p: 1,
            alignItems:"center"
          }}
        >
          Total :
          {mintFee && !feeIsLoading ? (
            ` ${Math.round((mintFee + value) * 1e5) / 1e5} ETH (~$${
              mintFeeUSD + ethValue
            } USD)`
          ) : (
            <Box sx={{ px: 1 }}>
              {!feeIsLoading ? (
                "Enter All Fields"
              ) : (
                <Loading spinnerColor="#fff" spinnerType="wave" />
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MintFee;
