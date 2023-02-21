import * as React from "react";
import { useEffect } from "react";
import { useMoralis, useChain } from "react-moralis";
import { useTour } from "@reactour/tour";
import { Container, Grid, Toolbar, Box } from "@mui/material";
import { Copyright, NavBar, HelmetHeader} from "../components/header";
import { sleep } from "../utils/functions";
import { MintingModal, MintForm, MintFee, PageTitle, GiftCardSVG} from "../components";
import { useAtomValue } from "jotai";
import { contractInfo } from "../constants/atoms";

const Mint = () => {
  const { account, Moralis } = useMoralis();
  const { switchNetwork, chainId } = useChain();
  const contract = useAtomValue(contractInfo);
  const { setIsOpen } = useTour();
  
  Moralis.onChainChanged(function (network) {
    console.log(network);
    //updateUI();
  });

  Moralis.onAccountChanged(function (acc) {
    console.log(acc);
    //updateUI();
  });

  useEffect(() => {
    async function checkTour() {
      await sleep(2000);
      if (!account) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        if (chainId != "5") {
          switchNetwork("0x5");
        }
      }
    }
    checkTour();
  }, [account]);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <HelmetHeader title="Mint" />
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
                <PageTitle title="Crypto GiftCard NFTs" subtitle="Mint One For You Or Any Other Wallet" />
              </Grid>
              {contract && <MintForm />}
              <Grid item md={6} xs={12}>
                <Box sx={{ py: 1 }}>
                  <GiftCardSVG
                  />
                </Box>
                <MintFee />
              </Grid>
            </Grid>
          </Container>
        </Box>
        <MintingModal />
      </Box>
      <Copyright />
    </>
  );
};

export default Mint;
