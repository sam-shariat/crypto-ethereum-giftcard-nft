import * as React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Grid } from "@mui/material";

export default function Copyright() {
  return (
    <Grid container spacing={2} sx={{ py: 6 }}>
      <Grid item md={12} xs={12}>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ p: 1 }}
        >
          {"Developed by "}
          <Link color="inherit" href="https://twitter.com/samywalters">
            @samywalters
          </Link>
        </Typography>
      </Grid>
    </Grid>
  );
}
