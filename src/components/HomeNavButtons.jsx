import { Button, Grid, Link, Typography, Container } from "@mui/material";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../constants/constants";
import { isURL } from "../utils/strings";

const HomeNavButtons = () => {
  return (
    <Container maxWidth="md">
      <Grid container spacing={2}>
        {NAV_ITEMS.map((item, index) => {
          return (
            <Grid
              item
              md={
                index === NAV_ITEMS.length - 1 && (index + 1) % 2 === 1 ? 12 : 6
              }
              xs={12}
            >
              <Button
                variant="outlined"
                sx={{ height: 120, width: "100%" }}
                fullWidth
                LinkComponent={isURL(item.url) ? Link : NavLink}
                to={item.url}
                href={isURL(item.url) ? item.url : item.url}
                target={isURL(item.url) ? "_blank" : "_self"}
              >
                <Typography
                  sx={{ p: 8, textAlign: "center" }}
                  variant="h4"
                  component="h1"
                  align="center"
                  fontWeight="bold"
                  fullWidth
                >
                  {item.name}
                </Typography>
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default HomeNavButtons;
