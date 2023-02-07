import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Helmet } from "react-helmet";
import { Container, Grid, Link } from "@mui/material";
import Copyright from "../components/nav/Copyright";
import NavBar from "../components/nav/NavBar";

const title = "About";

const About = (props) => {
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Cryptolyzed | {title} | Blockchain Analytics</title>
        </Helmet>
        <NavBar />
        <Box component="main" sx={{ width: "100%", p: 3 }}>
          <Toolbar />
          <Container maxWidth="md">
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                <Box sx={{ py: 4 }}>
                  <Typography
                    sx={{ textAlign: "center" }}
                    variant="h3"
                    component="h1"
                    align="center"
                  >
                    <b>Crypto GiftCard NFTs</b>
                  </Typography>
                  <Typography
                    sx={{ py: 1, textAlign: "center" }}
                    variant="body1"
                    align="center"
                  >
                    <b>Ethereum Redeemable NFT GiftCards</b>
                  </Typography>
                </Box>

                <Typography
                  sx={{ py: 1, textAlign: "center" }}
                  variant="h6"
                  align="center"
                >
                  CEGC is a Decentralized Application where you can mint a
                  Ethereum GiftCard NFT for you or any wallet address, then you
                  can redeem the NFT and withdraw it to your wallet.
                </Typography>
                <Typography
                  sx={{ py: 1, textAlign: "center" }}
                  variant="h6"
                  align="center"
                >
                  This is Sam, This Dapp has been developed in Solidity,
                  React.js and TheGraph.
                  <br />
                  This is an Alpha version. New Features May be Added!
                  <br />
                  <br />
                  Source Code is Available on <a href="#">Github</a>
                </Typography>
                <Typography
                  sx={{ py: 1, textAlign: "center" }}
                  variant="h5"
                  align="center"
                >
                  Stay Tuned
                </Typography>
                <Typography
                  sx={{ py: 2, textAlign: "center" }}
                  variant="body1"
                  align="center"
                >
                  Drop me a message if you have any questions!
                </Typography>
              </Grid>
              <Grid item md={4} xs={12}>
                <Button
                  LinkComponent={Link}
                  href="https://twitter.com/samywalters"
                  target={"_blank"}
                  variant="outlined"
                  sx={{ height: 120, width: "100%" }}
                  fullWidth
                >
                  <Typography
                    sx={{ p: 8, textAlign: "center" }}
                    variant="h4"
                    component="h1"
                    align="center"
                    fullWidth
                  >
                    <b>Twitter</b>
                  </Typography>
                </Button>
              </Grid>
              <Grid item md={4} xs={12}>
                <Button
                  LinkComponent={Link}
                  href="mailto:moslem.shariat@gmail.com"
                  target={"_blank"}
                  variant="outlined"
                  sx={{ height: 120 }}
                  fullWidth
                >
                  <Typography
                    sx={{ p: 8, textAlign: "center" }}
                    variant="h4"
                    component="h1"
                    align="center"
                    fullWidth
                  >
                    <b>Email</b>
                  </Typography>
                </Button>
              </Grid>
              <Grid item md={4} xs={12}>
                <Button
                  LinkComponent={Link}
                  href="#"
                  target={"_blank"}
                  variant="outlined"
                  sx={{ height: 120 }}
                  fullWidth
                >
                  <Typography
                    sx={{ p: 8, textAlign: "center" }}
                    variant="h4"
                    component="h1"
                    align="center"
                    fullWidth
                  >
                    <b>Github</b>
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      <Copyright />
    </>
  );
};

export default About;
