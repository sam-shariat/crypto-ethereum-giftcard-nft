import * as React from "react";
import { redeemStatusAtom, transferStatusAtom} from "../constants/atoms";
import {
  Container,
  Grid,
  Box,
  Toolbar
} from "@mui/material";
import Copyright from "../components/header/Copyright";
import NavBar from "../components/header/NavBar";
import Web3 from "web3";
import { HelmetHeader } from "../components/header";
import { useAtomValue } from "jotai";
import { PageTitle, RedeemStats, TransferModal, RedeemingModal, NFTsContainer } from "../components";

const web3 = new Web3(Web3.givenProvider);

const Redeem = () => {
  const transferStatus = useAtomValue(transferStatusAtom);
  const redeemStatus = useAtomValue(redeemStatusAtom);
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <HelmetHeader title={"Redeem"} />
        <NavBar />
        <Box component="main" sx={{ width: "100%", py: 3, px: 1 }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItems={"center"}>
              <Grid item lg={6} md={12} xs={12}>
                <PageTitle title="Crypto GiftCard NFTs" subtitle="My NFTs" />
              </Grid>
              <Grid item lg={6} md={12} xs={12}>
                <RedeemStats />
              </Grid>
              <NFTsContainer />
            </Grid>
          </Container>
        </Box>
        {redeemStatus !== "IDLE" && <RedeemingModal />}
        {transferStatus !== "IDLE" && <TransferModal />}
      </Box>
      <Copyright />
    </>
  );
};

export default Redeem;
