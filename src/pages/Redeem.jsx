import * as React from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Container,
  Grid,
  Paper,
  Box,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import Copyright from "../components/nav/Copyright";
import NavBar from "../components/nav/NavBar";
import contracts from "../constants/contracts.json";
import GiftCard from "../components/GiftCard";
import Web3 from "web3";
import { useApolloClient } from "@apollo/client";
import GET_MY_NFTS from "../constants/subgraphQueries";
import { Loading, useNotification, Bell, Modal, Input } from "web3uikit";
import { sleep } from "../utils/functions";
import { BG_COLOR } from "../constants/constants";
import { Launch } from "@mui/icons-material";
const web3 = new Web3(Web3.givenProvider);

const title = "Redeem";

const Redeem = (props) => {
  const { isWeb3Enabled, web3: webb, Moralis } = useMoralis();
  const { query } = useApolloClient();
  const [contractAddress, setContractAddress] = useState();
  const [contractAbi, setContractAbi] = useState();
  const [myNfts, setMyNfts] = useState([]);
  const [myURIs, setMyURIs] = useState([]);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [values, setValues] = useState([]);
  const [redeemIndex, setRedeemIndex] = useState(null);
  const [transferIndex, setTransferIndex] = useState(null);
  const [transferWallet, setTransferWallet] = useState("");
  const [isTransfering, setIsTransfering] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemingOpen, setIsRedeemingOpen] = useState(false);
  const [isTransferingOpen, setIsTransferingOpen] = useState(false);
  const [ethPrice, setEthPrice] = useState(null);
  const [allValue, setAllValue] = useState(null);
  const [allRedeemed, setAllRedeemed] = useState(null);
  const [redeemeds, setRedeemeds] = useState(null);
  const [priceIsLoading, setPriceIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(
    web3.currentProvider.selectedAddress
  );
  const dispatch = useNotification();

  const { runContractFunction: tokenURI } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "tokenURI",
    params: {
      tokenId: myNfts[selectedTokenIndex]
        ? myNfts[selectedTokenIndex].tokenId
        : null,
    },
  });

  const { runContractFunction: valueOfGCN } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "valueOfGCN",
    params: {
      tokenId: myNfts[selectedTokenIndex]
        ? myNfts[selectedTokenIndex].tokenId
        : null,
    },
  });

  const { runContractFunction: getLatestPrice } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "getLatestPrice",
    params: {},
  });

  const { runContractFunction: redeem } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "redeem",
    params: {
      tokenId: tokenId,
    },
  });

  const { runContractFunction: transferFrom } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "transferFrom",
    params: {
      tokenId: tokenId,
      from: walletAddress,
      to: transferWallet,
    },
  });

  async function setTokenIdAndTransfer(i) {
    setTokenId(myNfts[i].tokenId);
    setTransferIndex(i);
    setIsTransferingOpen(true);
  }

  async function doTransfer() {
    console.log("transferring " + myNfts[transferIndex].tokenId + " ...");
    setIsTransfering(true);
    await transferFrom({
      onSuccess: (tx) => handleTransferSuccess(tx),
      onError: (error) => {
        setIsTransfering(false);
      },
    });
    console.log("done.");
  }

  async function setTokenIdAndRedeem(i) {
    setTokenId(myNfts[i].tokenId);
    setRedeemIndex(i);
    setIsRedeemingOpen(true);
  }

  async function doRedeem() {
    console.log("redeeming " + myNfts[redeemIndex].tokenId + " ...");
    setIsRedeeming(true);
    await redeem({
      onSuccess: (tx) => handleRedeemSuccess(tx),
      onError: (error) => {
        setIsRedeeming(false);
      },
    });
    console.log("done.");
  }

  const notify = (type, message, title, link) => {
    dispatch({
      type: type,
      message: String(message),
      title: String(title).toLocaleUpperCase(),
      position: "bottomR",
      icon: link ? (
        <a href={link}>
          <IconButton>
            <Launch />
          </IconButton>
        </a>
      ) : (
        <Bell />
      ),
    });
  };

  const handleTransferSuccess = async function (tx) {
    const txRes = await tx.wait(1);
    setIsTransferingOpen(false);
    setIsTransfering(false);
    notify(
      "success",
      `Tx Hash: ${txRes.transactionHash}`,
      `GiftCard NFT Transferred to ${transferWallet}`,
      `https://goerli.etherscan.io/tx/${txRes.transactionHash}`
    );
  };

  const handleRedeemSuccess = async function (tx) {
    const txRes = await tx.wait(1);
    setIsRedeemingOpen(false);
    setIsRedeeming(false);
    notify(
      "success",
      `Tx Hash: ${txRes.transactionHash}`,
      "GiftCard NFT Redeemed",
      `https://goerli.etherscan.io/tx/${txRes.transactionHash}`
    );
  };

  async function updateTokenURIs() {
    console.log("updated");
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
      const uri = await tokenURI();
      const uriJson = String(Buffer.from(String(uri).slice(29), "base64"));
      setMyURIs([...myURIs, JSON.parse(uriJson)]);
      setSelectedTokenIndex(selectedTokenIndex + 1);
    }
  }

  async function updatePrice() {
    if (!priceIsLoading) {
      setWalletAddress(web3.currentProvider.selectedAddress);
      console.log("getting eth price...");
      setPriceIsLoading(true);
      let price = await getLatestPrice();
      let ETHPrice;
      if (price) {
        ETHPrice = parseInt(price.toString()) / 1e8;
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

  async function updateUI() {
    console.log("Fetching GiftCards For", web3.currentProvider.selectedAddress);
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
          console.log(_myNfts);
        }
      })
      .catch((e) => console.log(e));
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
      updatePrice();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    updateTokenURIs();
  }, [selectedTokenIndex]);

  useEffect(() => {
    if (!contractAddress) {
      setContractAddress(contracts[5][0].contracts.GiftCard.address);
    }
    if (!contractAbi) {
      setContractAbi(contracts[5][0].contracts.GiftCard.abi);
    }
  }, [contracts]);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Crypto Ethereum Gift Cards NFT | {title} </title>
        </Helmet>
        <NavBar />
        <Box component="main" sx={{ width: "100%", py: 3, px: 1 }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItems={"center"}>
              <Grid item lg={6} md={12} xs={12}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h3" component="h1">
                    <b>Crypto GiftCard NFTs</b>
                  </Typography>
                  <Typography sx={{ py: 1 }} variant="body1">
                    <b>My NFTS</b>
                  </Typography>
                </Box>
              </Grid>
              <Grid item lg={6} md={12} xs={12}>
                <Paper sx={{ p: 2, borderRadius: "10px" }}>
                  <Typography>GiftCards : {myNfts.length}</Typography>
                  <Typography>
                    Worth {allValue + " ETH "} (
                    {Math.round(allValue * ethPrice)} USD)
                  </Typography>

                  <Typography>Redeemed Cards : {redeemeds}</Typography>
                  <Typography>
                    Redeemed {allRedeemed + " ETH "} (
                    {Math.round(allRedeemed * ethPrice)} USD)
                  </Typography>
                </Paper>
              </Grid>

              {myNfts.map((nft, i) => {
                return (
                  <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                    <GiftCard
                      nft={nft}
                      uri={myURIs[i] && myURIs[i]}
                      values={values}
                      onRedeemClick={setTokenIdAndRedeem}
                      index={i}
                      onTransferClick={setTokenIdAndTransfer}
                      key={nft.id}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
        {isRedeemingOpen && (
          <Modal
            title={`Redeeming ${myURIs[redeemIndex].description}`}
            isVisible={isRedeemingOpen}
            id="RedeemingModal"
            zIndex={999}
            onCancel={() => !isRedeeming && setIsRedeemingOpen(false)}
            onCloseButtonPressed={() =>
              !isRedeeming && setIsRedeemingOpen(false)
            }
            onOk={() => !isRedeeming && doRedeem()}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography>
                  Redeeming GiftCard Worth{" "}
                  <b>
                    {myNfts[redeemIndex].value == 0
                      ? values[redeemIndex]
                      : myNfts[redeemIndex].value}{" "}
                    ETH
                  </b>{" "}
                  Into <b>{myNfts[redeemIndex].destination}</b>
                </Typography>
              </Box>
              <div>
                {isRedeeming ? (
                  <Loading
                    direction="right"
                    spinnerColor="#222222"
                    spinnerType="wave"
                    size="large"
                  />
                ) : (
                  <Typography>
                    Please Confirm Redeem By Pressing <b>Ok</b>
                  </Typography>
                )}
              </div>
            </Box>
          </Modal>
        )}

        {isTransferingOpen && (
          <Modal
            title={`Transferring ${myURIs[transferIndex].description}`}
            isVisible={isTransferingOpen}
            id="TransferringModal"
            zIndex={9999}
            onCancel={() => !isTransfering && setIsTransferingOpen(false)}
            onCloseButtonPressed={() =>
              !isTransfering && setIsTransferingOpen(false)
            }
            onOk={() => doTransfer()}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ pb: 3 }}>
                <Typography>
                  Transferring GiftCard Worth{" "}
                  <b>
                    {myNfts[transferIndex].value == 0
                      ? values[transferIndex]
                      : myNfts[transferIndex].value}{" "}
                    ETH
                  </b>{" "}
                  To{" "}
                </Typography>
              </Box>
              <Input
                label="Destination Wallet Address e.g. 0x..."
                labelBgColor={"white"}
                value={transferWallet}
                onChange={(e) => {
                  setTransferWallet(e.currentTarget.value);
                }}
                style={{ flexGrow: 1 }}
              />
              <Box sx={{ pt: 2 }}>
                {isTransfering ? (
                  <Loading
                    direction="right"
                    spinnerColor="#222222"
                    spinnerType="wave"
                    size="large"
                  />
                ) : (
                  <Typography>
                    Please Confirm Transfer By Pressing <b>Ok</b>
                  </Typography>
                )}
              </Box>
            </Box>
          </Modal>
        )}
      </Box>
      <Copyright />
    </>
  );
};

export default Redeem;
