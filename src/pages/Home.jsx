import {Grid, Container,Typography,Box} from "@mui/material";
import Copyright from "../components/header/Copyright";
import {InteractiveBanner,HomeNavButtons} from "../components";
import bgimage from "../img/background-cryptolyzed.jpg";

const Home = () => {
  return (
    <>
      <InteractiveBanner />
      <Container
        sx={{
          maxWidth: "100% !important",
          backgroundImage: `url(${bgimage})`,
          backgroundSize: "cover",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            pt: '250px'
          }}
        >
          <Grid item md={12} xl={12} xs={12}>
            <Box sx={{ pb: 4 }}>
              <Typography
                sx={{ py: 1, textAlign: "center" }}
                variant="body1"
                align="center"
              >
                <b>Mint Ethereum Gift Card NFTs and Redeem Whenever you want</b>
              </Typography>
            </Box>
          </Grid>
          <Grid item md={12} xl={12} xs={12}>
            <HomeNavButtons />
          </Grid>
        </Grid>
        <Copyright />
      </Container>
    </>
  );
};

export default Home;
