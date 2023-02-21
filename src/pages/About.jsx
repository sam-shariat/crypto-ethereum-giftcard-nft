import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Container, Grid } from "@mui/material";
import Copyright from "../components/header/Copyright";
import NavBar from "../components/header/NavBar";
import SocialButtons from "../components/SocialButtons";
import HelmetHeader from "../components/header/HelmetHeader";

const title = "About";

const About = (props) => {
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <HelmetHeader title={title} />
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
                    fontWeight="bold"
                  >
                    Crypto GiftCard NFTs
                  </Typography>
                  <Typography
                    sx={{ py: 1, textAlign: "center" }}
                    variant="body1"
                    fontWeight="bold"
                  >
                    Ethereum Redeemable NFT GiftCards
                  </Typography>
                </Box>

                <Typography
                  sx={{ py: 1, textAlign: "justify" }}
                  variant="h6"
                  align="justify"
                >
                  CEGC is a Decentralized Application where you can mint a
                  Ethereum GiftCard NFT for you or any wallet address, then you
                  can redeem the NFT and withdraw it to your wallet.
                </Typography>
                <Typography
                  sx={{ py: 1, textAlign: "justify" }}
                  variant="h6"
                >
                  This is Sam, This Dapp has been developed in Solidity,
                  React.js and TheGraph.
                  <p>
                  This is an Alpha version. New Features May be Added!
                  </p>
                  Source Code is Available on <a href="#">Github</a>
                </Typography>
                <Typography
                  sx={{ py: 2 }}
                  variant="h5"
                >
                  Stay Tuned 🤘
                </Typography>
              </Grid>
              <SocialButtons />
            </Grid>
          </Container>
        </Box>
      </Box>
      <Copyright />
    </>
  );
};

export default About;
