import {
  Grid,
  Container,
  Button,
  TextField,
  Box,
} from "@mui/material";
import Web3 from "web3";
import { ethers } from "ethers";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMoralis, useWeb3Contract } from "react-moralis";
import {
  contractInfo,
  mintColorIndex,
  mintedAtom,
  mintStatusAtom,
  mintText,
  mintValue,
  mintWalletAddress,
} from "../constants/atoms";
import { OPENSEA_ASSET_URL, RANDOM_WISHES } from "../constants/constants";
import { useState } from "react";
import {ColorSelector,ValueUSDButton} from "./";
const web3 = new Web3(Web3.givenProvider);

const MintForm = () => {
  const setMinted = useSetAtom(mintedAtom);
  const [value, setValue] = useAtom(mintValue);
  const [textValue, setTextValue] = useAtom(mintText);
  const pickedColorIndex = useAtomValue(mintColorIndex);
  const [walletAddress, setWalletAddress] = useAtom(mintWalletAddress);
  const { account } = useMoralis();
  const contract = useAtomValue(contractInfo);
  const [mintStatus,setMintStatus] = useAtom(mintStatusAtom);
  const [formError, setFormError] = useState({ id: "", msg: "" });

  const {
    runContractFunction: safeMint,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "safeMint",
    msgValue: value > 0 ? ethers.parseEther(String(value)) : "0",
    params: {
      to: web3.utils.isAddress(walletAddress) ? walletAddress : account,
      text: textValue,
      color: pickedColorIndex,
    },
  });

  const handleMintSuccess = async function (tx) {
    setMintStatus("WAITING");
    const txRes = await tx.wait(1);
    const tokenId = txRes.events[0].args.tokenId;
    setMintStatus("MINTED");
    setMinted(`${OPENSEA_ASSET_URL}/${contract.address}/${tokenId}`);
  };

  async function mintNft() {
    if (value <= 0) {
      setFormError({ id: "value", msg: "Value can not be empty" });
      return;
    }
    if (textValue.length == 0) {
      setFormError({ id: "text", msg: "Text can not be empty" });
      return;
    }
    if (textValue.length > 32) {
      setFormError({
        id: "textTooLong",
        msg: "Text is too long, only 32 characters",
      });
      return;
    }
    if (!web3.utils.isAddress(walletAddress)) {
      setFormError({
        id: "address",
        msg: "Please enter a valid wallet address, e.g. 0xD2D12058B23B55AA01b271be16C4855CeFa001CE",
      });
      return;
    }
    console.log("minting...");
    setMintStatus("MINTING");
    await safeMint({
      onSuccess: (tx) => handleMintSuccess(tx),
      onError: (error) => {
        setMintStatus("OPEN");
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
      mintStatus !== "OPEN"
    ) {
      return true;
    } else {
      return false;
    }
  }

  return (
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
          <Grid item sx={{ display: "flex", flexGrow: 1, gap: 1, pt: 2 }}>
            <TextField
              error={formError.id === "value"}
              label="Enter the value in ETH (e.g. 0.5)"
              variant="outlined"
              value={value}
              type="number"
              InputProps={{ style: { borderRadius: "10px" } }}
              onChange={(e) => {
                setValue(e.currentTarget.value);
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
            <ValueUSDButton value={100}/>
            <ValueUSDButton value={200}/>
            <ValueUSDButton value={300}/>
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
          error={formError.id === "address"}
          label="Wallet Address (e.g. 0xD2D12...001CE)"
          variant="outlined"
          helperText={formError.id === "address" && formError.msg}
          value={walletAddress}
          InputProps={{ style: { borderRadius: "10px" } }}
          onChange={(e) => {
            setWalletAddress((s)=> e.currentTarget.value);
            formError.id === "address" && ethers.isAddress(e.currentTarget.value) && setFormError((s)=> ({id:"",msg:""}))
          }}
          fullWidth
        />
        <Button
          onClick={(e) => {
            setWalletAddress(account);
            formError.id === "address" && setFormError((s)=> ({id:"",msg:""}))
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
          error={formError.id === "text" || formError.id === "textTooLong"}
          label="Text on the GiftCard (e.g. Happy Birthday)"
          variant="outlined"
          helperText={
            (formError.id === "text" ||
            formError.id === "textTooLong") && formError.msg
          }
          value={textValue}
          InputProps={{ style: { borderRadius: "10px" } }}
          onChange={(e) => {
            setTextValue(e.currentTarget.value);
            if(formError.id === "text" || formError.id === "textTooLong"){
              e.currentTarget.value.length > 0 && e.currentTarget.value.length < 32 && setFormError({id:"",msg:""})
            } 
          }}
          fullWidth
        />
        <Button
          onClick={(e) => {
            setTextValue(RANDOM_WISHES[Math.round(Math.random() * 10)]);
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
      ><ColorSelector />   
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
            border: mintDisabled() ? "1px solid transparent" : "1px solid",
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
  );
};

export default MintForm;
