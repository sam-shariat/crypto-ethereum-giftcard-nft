import * as React from "react";
import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import { useTour } from "@reactour/tour";
import {
  Container,
  Alert,
  AlertTitle,
  Collapse,
  Grid,
  ButtonBase,
  Paper,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import Copyright from "../components/nav/Copyright";
import NavBar from "../components/nav/NavBar";
import contracts from "../constants/contracts.json";
import { Loading, useNotification, Bell, Modal } from "web3uikit";
import { MODAL_STYLE, RANDOM_WISHES } from "../constants/constants";
import { ethers } from "ethers";
import { Close, Launch } from "@mui/icons-material";
import GiftCardSVG from "../components/GiftCardSVG";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { sleep } from "../utils/functions";
const web3 = new Web3(Web3.givenProvider);

const title = "Mint";

const Mint = (props) => {
  const { isWeb3Enabled, account, web3: webb } = useMoralis();
  const [colorIndex, setColorIndex] = useState(0);
  const [pickedColorIndex, setPickedColorIndex] = useState(0);
  const [colorCodes, setColorCodes] = useState([]);
  const [value, setValue] = useState(0);
  const [walletAddress, setWalletAddress] = useState(account ? account : "");
  const [contractAddress, setContractAddress] = useState();
  const [contractAbi, setContractAbi] = useState();
  const [textValue, setTextValue] = useState("");
  const [mintFee, setMintFee] = useState("");
  const [mintFeeUSD, setMintFeeUSD] = useState("");
  const [ethValue, setEthValue] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [priceIsLoading, setPriceIsLoading] = useState(false);
  const [feeIsLoading, setFeeIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [minted, setMinted] = useState();
  const { setIsOpen } = useTour();
  const dispatch = useNotification();

  const {
    runContractFunction: safeMint,
    data: mintTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "safeMint",
    msgValue: value > 0 ? ethers.utils.parseEther(String(value)) : "0",
    params: {
      to: walletAddress ? ethers.utils.getAddress(walletAddress) : account,
      text: textValue,
      color: pickedColorIndex,
    },
  });

  const { runContractFunction: getColorCode } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "getColor",
    params: {
      i: colorIndex,
    },
  });

  const { runContractFunction: getLatestPrice } = useWeb3Contract({
    abi: contractAbi,
    contractAddress: contractAddress,
    functionName: "getLatestPrice",
    params: {},
  });

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

  const handleSuccess = async function (tx) {
    setIsWaiting(true);
    const txRes = await tx.wait(1);
    const tokenId = txRes.events[0].args.tokenId;
    setIsMinting(false);
    setIsWaiting(false);
    setMinted(
      `https://testnets.opensea.io/assets/goerli/${contractAddress}/${tokenId}`
    );
    notify(
      "success",
      `Tx Hash: ${txRes.transactionHash}`,
      "GiftCard NFT Minted",
      `https://testnets.opensea.io/assets/goerli/${contractAddress}/${tokenId}`
    );
  };

  async function mintNft() {
    if (value <= 0) {
      notify("error", "Value can not be empty", "Entry Error");
      return;
    }
    if (textValue.length == 0) {
      notify("error", "Text can not be empty", "Entry Error");
      return;
    }
    if (textValue.length > 32) {
      notify("error", "Text is too long, only 32 characters", "Entry Error");
      return;
    }
    if (!ethers.utils.isAddress(walletAddress)) {
      notify(
        "error",
        "Please enter a valid wallet address, e.g. 0xD2D12058B23B55AA01b271be16C4855CeFa001CE",
        "Entry Error"
      );
      return;
    }
    console.log("minting...");
    setIsMinting(true);
    await safeMint({
      onSuccess: (tx) => handleSuccess(tx),
      onError: (error) => {
        setIsMinting(false);
      },
    });
    console.log("done.");
  }

  function mintDisabled() {
    if (
      value == 0 ||
      textValue.length == 0 ||
      walletAddress.length == 0 ||
      isLoading ||
      isFetching ||
      isMinting
    ) {
      return true;
    } else {
      return false;
    }
  }
  function updateValue(val) {
    if (ethPrice > 0) {
      setValue(val / ethPrice);
      setEthValue(Math.round((val / ethPrice) * ethPrice));
    }
  }

  async function updatePrice() {
    if (!priceIsLoading) {
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
      }

      if (ETHPrice > 0 && walletAddress && textValue.length > 0 && value > 0) {
        console.log("getting mint fee...");
        setFeeIsLoading(true);
        let GiftCard = await new web3.eth.Contract(
          contractAbi,
          contractAddress
        );
        const feeData = await webb.getFeeData();
        const maxGasPrice = feeData.maxPriorityFeePerGas.toString();
        GiftCard.methods
          .safeMint(account, textValue, pickedColorIndex)
          .estimateGas(
            {
              from: web3.currentProvider.selectedAddress,
              value: web3.utils.toWei(`${value}`, "ether"),
              //gasPrice: _gasPrice
            },
            function (error, estimatedGas) {
              let fee =
                Math.round(
                  web3.utils.fromWei(String(estimatedGas * maxGasPrice)) * 1e5
                ) / 1e5;
              setMintFee(fee);
              setMintFeeUSD(Math.round(fee * ethPrice * 10) / 10);
              setFeeIsLoading(false);
              console.log(error);
            }
          );
      }
    }
  }

  async function updateUI() {
    if (colorIndex == 0) {
      updatePrice();
    }
    if (colorIndex < 10) {
      let colorCode = await getColorCode();
      console.log(`The ColorCode is ${colorCode}`);
      // We are going to cheat a little here...
      if (colorCode) {
        setColorCodes([...colorCodes, colorCode]);
        setColorIndex(colorIndex + 1);
        console.log(colorCodes);
      }
    } else {
      updatePrice();
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("eth price will be updated every 30 seconds");
      updatePrice();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [
    isWeb3Enabled,
    colorIndex,
    value,
    pickedColorIndex,
    textValue,
    walletAddress,
  ]);

  useEffect(() => {
    if (!contractAddress) {
      setContractAddress(contracts[5][0].contracts.GiftCard.address);
    }
    if (!contractAbi) {
      setContractAbi(contracts[5][0].contracts.GiftCard.abi);
    }
  }, [contracts]);

  useEffect(()=> {
    async function checkTour(){
      await sleep(2000);
      if (!account) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    checkTour();
  },[account])

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Crypto Ethereum Gift Cards NFT | {title} </title>
        </Helmet>
        <NavBar />
        <Box
          component="main"
          sx={{
            width: "100%",
            p: {
              xl: 3,
              lg: 3,
              md: 2,
              sm: 2,
              xs: 1,
            },
          }}
        >
          <Toolbar />
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItems="center">
              <Grid item md={12} xs={12}>
                <Box sx={{ py: 4 }}>
                  <Typography variant="h3" component="h1">
                    <b>Crypto GiftCard NFTs</b>
                  </Typography>
                  <Typography sx={{ py: 1 }} variant="body1">
                    <b>Mint One For You Or Any Other Wallet</b>
                  </Typography>
                </Box>
              </Grid>
              {minted && (
                <Grid item md={12} xs={12}>
                  <Collapse in={minted}>
                    <Alert
                      variant="standard"
                      se
                      action={
                        <Box display={"flex"} gap={1}>
                          <Button LinkComponent={Link} href={minted}>
                            View On Opensea
                          </Button>
                          <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                              setMinted(null);
                            }}
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      }
                      sx={{ mb: 2 }}
                      severity="success"
                    >
                      <AlertTitle>
                        <b>Congratulations</b>
                      </AlertTitle>
                      GiftCard NFT Minted Successfully.
                    </Alert>
                  </Collapse>
                </Grid>
              )}
              <Grid item md={6} xs={12}>
                <Container style={{ padding: 0 }}>
                  <Grid
                    Container
                    sx={{
                      display: {
                        xl: "flex",
                        lg: "flex",
                        md: "block",
                        sm: "block",
                        xs: "block",
                      },
                      gap: 1,
                    }}
                  >
                    <Grid
                      item
                      sx={{ display: "flex", flexGrow: 1, gap: 1, pt: 2 }}
                    >
                      <TextField
                        label="Enter the value in ETH (e.g. 0.5)"
                        variant="outlined"
                        value={value}
                        type="number"
                        InputProps={{ style: { borderRadius: "10px" } }}
                        onChange={(e) => {
                          setValue(e.currentTarget.value);
                          setEthValue(
                            Math.round(e.currentTarget.value * ethPrice)
                          );
                        }}
                        size="big"
                        style={{
                          backgroundColor: "#151515",
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: {
                          xl: "16px",
                          lg: "16px",
                          md: "24px",
                          sm: "24px",
                          xs: "24px",
                        },
                      }}
                    >
                      <Button
                        onClick={() => updateValue(100)}
                        variant="outlined"
                        sx={{ borderRadius: "10px" }}
                      >
                        $100
                      </Button>
                      <Button
                        onClick={() => updateValue(500)}
                        variant="outlined"
                        sx={{ borderRadius: "10px" }}
                      >
                        $500
                      </Button>
                      <Button
                        onClick={() => updateValue(1000)}
                        variant="outlined"
                        sx={{ borderRadius: "10px" }}
                      >
                        $1000
                      </Button>
                    </Grid>
                  </Grid>
                </Container>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    pt: 4,
                  }}
                >
                  <TextField
                    label="Wallet Address (e.g. 0xD2D12...001CE)"
                    variant="outlined"
                    value={walletAddress}
                    InputProps={{ style: { borderRadius: "10px" } }}
                    onChange={(e) => {
                      setWalletAddress(e.currentTarget.value);
                    }}
                    fullWidth
                  />
                  <Button
                    onClick={(e) => {
                      setWalletAddress(account);
                    }}
                    variant="outlined"
                    sx={{ borderRadius: "10px" }}
                  >
                    MyWallet
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    pt: 4,
                  }}
                >
                  <TextField
                    label="Text on the GiftCard (e.g. Happy Birthday)"
                    variant="outlined"
                    value={textValue}
                    InputProps={{ style: { borderRadius: "10px" } }}
                    onChange={(e) => {
                      setTextValue(e.currentTarget.value);
                    }}
                    fullWidth
                  />
                  <Button
                    onClick={(e) => {
                      setTextValue(
                        RANDOM_WISHES[Math.round(Math.random() * 10)]
                      );
                    }}
                    variant="outlined"
                    sx={{ borderRadius: "10px" }}
                  >
                    Random
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "block",
                    gap: 1,
                    pt: 5,
                  }}
                >
                  <Paper
                    sx={{
                      borderRadius: "10px",
                      p: 1,
                    }}
                  >
                    <Box sx={{ p: 1 }}>Pick Color :</Box>
                    {colorCodes.map((item, i) => {
                      return (
                        <ButtonBase
                          value={i}
                          onClick={(e) =>
                            setPickedColorIndex(e.currentTarget.value)
                          }
                          sx={{ p: 1 }}
                        >
                          <Paper
                            sx={{
                              backgroundColor: `#${item}`,
                              p: "12px",
                              borderRadius: "10px",
                              border:
                                i == pickedColorIndex
                                  ? "1px solid #fff"
                                  : "none",
                            }}
                          >
                            {item}
                          </Paper>
                        </ButtonBase>
                      );
                    })}
                  </Paper>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    py: 2,
                  }}
                >
                  <Button
                    sx={{
                      borderRadius: "10px",
                      border: mintDisabled()
                        ? "1px solid transparent"
                        : "1px solid",
                    }}
                    size="large"
                    variant="outlined"
                    onClick={() => mintNft()}
                    disabled={mintDisabled()}
                  >
                    Mint GiftCard NFT
                  </Button>
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <Box sx={{ py: 1 }}>
                  <GiftCardSVG
                    text={textValue}
                    value={ethValue}
                    color={"#" + colorCodes[pickedColorIndex]}
                  />
                </Box>
                <Box sx={{ py: 1 }}>
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
                        {ethValue && !priceIsLoading
                          ? ` ($${ethValue} USD)`
                          : ""}
                      </div>
                      <div style={{ display: "flex" }}>
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
                      }}
                    >
                      Total :
                      {mintFee && !feeIsLoading ? (
                        ` ${Math.round(mintFee + value * 1e5) / 1e5} ETH (~$${
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
              </Grid>
            </Grid>
          </Container>
        </Box>
        {isMinting && (
          <Modal
            open={isMinting}
            onClose={() => !isMinting && setIsMinting(false)}
            aria-labelledby="redeem-modal"
          >
            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                ...MODAL_STYLE,
              }}
            ><Typography
            variant="h6"
            p={2}
            borderBottom={"solid 1px #333333"}
            width={"100%"}
          >
            Minting {ethValue} USD GiftCard NFT
          </Typography>
              <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <Loading
                  direction="right"
                  spinnerColor="#ffffff"
                  spinnerType="wave"
                  size="large"
                />
              <Typography>
                {isWaiting
                  ? "Transaction Received. Please be Pationt while Your NFT is minting ..."
                  : "Please Confirm The Transaction On Your Wallet ..."}
              </Typography>
              </Box>
            </Paper>
          </Modal>
        )}
      </Box>
      <Copyright />
    </>
  );
};

export default Mint;
