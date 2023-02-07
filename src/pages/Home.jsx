import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Copyright from "../components/nav/Copyright";
import { Button, Grid, Link } from "@mui/material";
import { NavLink } from "react-router-dom";
import IntLogo from "../components/LogoInteractive";
import bgimage from "../img/background-cryptolyzed.jpg";
import { NAV_ITEMS } from "../constants/constants";

const Home = () => {
  return (
    <>
      <IntLogo />
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
              md: "500px",
              lg: "500px",
              xl: "500px",
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
            <Container maxWidth="md">
              <Grid container spacing={2}>
                {NAV_ITEMS.map((item) => {
                  return (
                    <Grid item md={6} xs={12}>
                      <Button
                        variant="outlined"
                        sx={{ height: 120, width: "100%" }}
                        fullWidth
                        LinkComponent={
                          item.url.includes("http") ? Link : NavLink
                        }
                        to={item.url}
                        href={item.url.includes("http") ? item.url : item.url}
                        target={item.url.includes("http") ? "_blank" : "_self"}
                      >
                        <Typography
                          sx={{ p: 8, textAlign: "center" }}
                          variant="h4"
                          component="h1"
                          align="center"
                          fullWidth
                        >
                          <b>{item.name}</b>
                        </Typography>
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Container>
          </Grid>
        </Grid>
        <Copyright />
      </Container>
    </>
  );
};

export default Home;
