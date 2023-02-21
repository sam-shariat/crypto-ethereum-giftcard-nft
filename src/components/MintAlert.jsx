import { Close } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  AlertTitle,
  Link,
} from "@mui/material";

const MintAlert = ({ minted, setMinted }) => {
  return (
    <Grid item md={12} xs={12}>
      <Collapse in={minted}>
        <Alert
          variant="standard"
          se
          action={
            <Box display={"flex"} gap={1}>
              <Button LinkComponent={Link} href={minted}>
                View On Opensea
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setMinted(null);
                }}
              >
                <Close />
              </IconButton>
            </Box>
          }
          sx={{ mb: 2 }}
          severity="success"
        >
          <AlertTitle>
            <strong>Congratulations</strong>
          </AlertTitle>
          GiftCard NFT Minted Successfully.
        </Alert>
      </Collapse>
    </Grid>
  );
};

export default MintAlert;
