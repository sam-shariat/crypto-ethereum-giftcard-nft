import { Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useApolloClient } from "@apollo/client";
import GET_MY_NFTS from "../constants/subgraphQueries";
import Web3 from "web3";
import { Buffer } from "buffer";
import { useAtom, useAtomValue } from "jotai";
import { allValueAtom, contractInfo, ethPriceAtom, NFTsAtom, selectedTokenIndexAtom, URIsAtom, valuesAtom } from "../constants/atoms";
const web3 = new Web3(Web3.givenProvider);

const RedeemStats = () => {
  const { isWeb3Enabled } = useMoralis();
  const { query } = useApolloClient();
  const contract = useAtomValue(contractInfo);
  const [allRedeemed, setAllRedeemed] = useState(null);
  const [redeemeds, setRedeemeds] = useState(null);
  const [myNfts, setMyNfts] = useAtom(NFTsAtom);
  const [myURIs, setMyURIs] = useAtom(URIsAtom);
  const [allValue, setAllValue] = useAtom(allValueAtom);
  const [values, setValues] = useAtom(valuesAtom);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedTokenIndex,setSelectedTokenIndex] = useAtom(selectedTokenIndexAtom);
  const ethPrice = useAtomValue(ethPriceAtom);

  async function updateUI() {
    if (!isFetching) {
      console.log(
        "Fetching GiftCards For",
        web3.currentProvider.selectedAddress
      );
      query({
        query: GET_MY_NFTS,
        variables: {
          destination: web3.currentProvider.selectedAddress,
        },
      })
        .then((results) => {
          let _myNfts = [];
          let _allValue = 0;
          let _allRedeemed = 0;
          let _redeemeds = 0;
          let allGiftCards = [...results.data.giftCardMinteds];

          if (results.data.received.length > 0) {
            allGiftCards = [
              ...results.data.giftCardMinteds,
              ...results.data.received,
            ];
          }
          allGiftCards.forEach(async (nft, i) => {
            console.log("token Id: " + nft.tokenId);
            const redeemed = results.data.giftCardRedeemeds.find(
              ({ destination, tokenId }) =>
                destination === nft.destination && tokenId === nft.tokenId
            );
            const sent = results.data.sent.find(
              ({ tokenId }) => tokenId === nft.tokenId
            );

            let isRedeemed;
            if (redeemed || sent) {
              isRedeemed = true;
              _allRedeemed +=
                Math.round(web3.utils.fromWei(nft.value) * 1e5) / 1e5;
              _redeemeds += 1;
            } else {
              isRedeemed = false;
              _allValue += nft.value
                ? Math.round(web3.utils.fromWei(nft.value) * 1e5) / 1e5
                : 0;
              _myNfts.push({
                tokenId: nft.tokenId,
                destination: nft.destination ? nft.destination : nft.to,
                value: nft.value
                  ? Math.round(web3.utils.fromWei(nft.value) * 1e5) / 1e5
                  : 0,
                id: nft.id,
                from: nft.value ? nft.destination : nft.from,
                isRedeemed: isRedeemed,
                isReceived: nft.value ? false : true,
                timestamp: new Date(nft.blockTimestamp * 1000).toLocaleString(),
              });
            }
          });
          if (_myNfts.length > 0) {
            setMyNfts(_myNfts);
            setAllValue(Math.round(_allValue * 1e5) / 1e5);
            setRedeemeds(_redeemeds);
            setAllRedeemed(_allRedeemed);
            setSelectedTokenIndex(0);
            setIsFetching(false);
            console.log(_myNfts);
          }
        })
        .catch(async (e) => {
          setIsFetching(false);
          await sleep(5000);
          updateUI();
        });
    }
  }

  async function updateTokenURIs() {
    console.log("updated");
    console.log(contract.address)
    if (selectedTokenIndex < myNfts.length) {
      if (myNfts[selectedTokenIndex].value != 0) {
        console.log("saving value to values 1");
        setValues([...values, myNfts[selectedTokenIndex].value]);
      } else {
        console.log("saving value to values 2");
        const _value =
          Math.round(web3.utils.fromWei(String(await valueOfGCN())) * 1e5) /
          1e5;
        setValues([...values, _value]);
        setAllValue(Math.round((allValue + _value) * 1e5) / 1e5);
      }
      console.log(myNfts[selectedTokenIndex])
      const uri = await tokenURI();
      console.log(uri);
      const uriJson = String(Buffer.from(String(uri).slice(29), "base64"));
      setMyURIs([...myURIs, JSON.parse(uriJson)]);
      setSelectedTokenIndex(selectedTokenIndex + 1);
    }
  }

  useEffect(() => {
    updateTokenURIs();
  }, [selectedTokenIndex]);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const { runContractFunction: tokenURI } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "tokenURI",
    params: {
      tokenId: myNfts[selectedTokenIndex]
        ? myNfts[selectedTokenIndex].tokenId
        : null,
    },
  });

  const { runContractFunction: valueOfGCN } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "valueOfGCN",
    params: {
      tokenId: myNfts[selectedTokenIndex]
        ? myNfts[selectedTokenIndex].tokenId
        : null,
    },
  });


  return (
    <Paper sx={{ p: 2, borderRadius: "10px" }}>
      <Typography>GiftCards : {myNfts.length}</Typography>
      <Typography>
        Worth {allValue + " ETH "} ({Math.round(allValue * ethPrice)} USD)
      </Typography>

      <Typography>Redeemed Cards : {redeemeds}</Typography>
      <Typography>
        Redeemed {allRedeemed + " ETH "} ({Math.round(allRedeemed * ethPrice)}{" "}
        USD)
      </Typography>
    </Paper>
  );
};

export default RedeemStats;
