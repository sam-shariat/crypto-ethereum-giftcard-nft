import * as React from "react";
import {
  AppBar,
  Drawer,
  Toolbar,
  IconButton,
  ButtonBase,
  Container,
  Button,
  Tooltip,
  Box,
  Divider,
  List,
  Link,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { ConnectButton } from "web3uikit";
import { NAV_ITEMS } from "../../constants/constants";

const NavBar = ({}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {"Cryptolyzed"}
      </Typography>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.name.replace(/ /g, "-")} disablePadding>
            <NavLink
              key={item.name.replace(/ /g, "-")}
              to={item.url}
              className="navlink"
            >
              <ListItemButton key={item.name.replace(/ /g, "-")} sx={{ px: 3 }}>
                <ListItemText
                  key={item.name.replace(/ /g, "-")}
                  primary={item.name}
                />
              </ListItemButton>
            </NavLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: "none" }, mx: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <ButtonBase
            LinkComponent={NavLink}
            to={"/crypto-ethereum-giftcard-nft/"}
            sx={{
              flexGrow: 1,
              py: 2,
              px: 1,
              width: { xs: "auto", sm: "auto" },
            }}
          >
            <Typography
              variant="h5"
              component="h5"
              align="left"
              sx={{
                p: 0,
                display: { md: "flex" },
                flexGrow: 1,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {"CEGC"}
            </Typography>
          </ButtonBase>
          <Container sx={{ display: { sm: "flex", xs: "none" } }}>
            {NAV_ITEMS.map((nav) => (
              <Button
                onClick={handleDrawerToggle}
                sx={{ my: 2, color: "white", display: "block" }}
                LinkComponent={nav.url.includes("http") ? Link : NavLink}
                to={nav.url}
                href={nav.url.includes("http") ? nav.url : nav.url}
                target={nav.url.includes("http") ? "_blank" : "_self"}
              >
                {nav.name}
              </Button>
            ))}
          </Container>
          <div className="walletconnectbutton">
            <ConnectButton
              signingMessage="Signing to CEGC"
              moralisAuth={false}
            />
          </div>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          variant="temporary"
          open={mobileOpen}
          anchor="left"
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default NavBar;
