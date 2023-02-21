import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Copyright from "../components/header/Copyright";
import { Grid } from "@mui/material";
import InteractiveBanner from "../components/InteractiveBanner";
import bgimage from "../img/background-cryptolyzed.jpg";
import HomeNavButtons from "../components/HomeNavButtons";

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
            pt: {
              xs: "300px",
              sm: "300px",
              md: "470px",
              lg: "470px",
              xl: "470px",
            },
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
