import { Box, Typography } from "@mui/material";

const PageTitle = ({ title, subtitle }) => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      <Typography sx={{ py: 1 }} variant="body1">
        {subtitle}
      </Typography>
    </Box>
  );
};

export default PageTitle;
