import { Button, Grid, Link, Typography } from "@mui/material";
import { SOCIAL_LINKS } from "../constants/constants";

const SocialButtons = () => {
  return (
    <>
      <Grid item md={4} xs={12}>
        <Button
          LinkComponent={Link}
          href={SOCIAL_LINKS.twitter}
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
            fontWeight="bold"
            fullWidth
          >
            Twitter
          </Typography>
        </Button>
      </Grid>
      <Grid item md={4} xs={12}>
        <Button
          LinkComponent={Link}
          href={SOCIAL_LINKS.email}
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
            fontWeight="bold"
            fullWidth
          >
            Email
          </Typography>
        </Button>
      </Grid>
      <Grid item md={4} xs={12}>
        <Button
          LinkComponent={Link}
          href={SOCIAL_LINKS.github}
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
            Github
          </Typography>
        </Button>
      </Grid>
    </>
  );
};

export default SocialButtons;