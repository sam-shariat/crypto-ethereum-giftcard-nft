import * as React from "react";
import { Paper, Box, ButtonBase, IconButton, Button } from "@mui/material";
import { Loading, Tooltip, Typography } from "web3uikit";
import { Info } from "@mui/icons-material";
import { useSetAtom } from "jotai";
import { redeemIndexAtom, redeemStatusAtom, transferIndexAtom, transferStatusAtom } from "../constants/atoms";

export default function GiftCard({
  uri,
  nft,
  values,
  index,
}) {

  const setRedeemIndex = useSetAtom(redeemIndexAtom);
  const setTransferIndex = useSetAtom(transferIndexAtom);
  const setRedeemStatus = useSetAtom(redeemStatusAtom);
  const setTransferStatus = useSetAtom(transferStatusAtom);
  
  function setTokenIdAndRedeem(i) {
    setRedeemIndex(i);
    setRedeemStatus("REDEEMING");
  }

  async function setTokenIdAndTransfer(i) {
    setTransferIndex(i);
    setTransferStatus("TRANSFERRING");
  }

  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: "10px",
        ":hover": {
          backgroundColor: "#070707",
        },
      }}
    >
      <Box container>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent:"center" }}>
          <Box>
            {uri ? (
              <img
                src={uri.image}
                width={"100%"}
                style={{ borderRadius: "10px" }}
              />
            ) : (
              <Box display="flex" justifyContent="center" height="200px">
                <Loading
                  direction="right"
                  spinnerColor="#ffffff"
                  spinnerType="wave"
                  size="large"
                />
              </Box>
              
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
            }}
          >
            <Typography
              color={"white"}
              style={{ flexGrow: 1, padding: "8px 0px" }}
            >
              {nft.value ? nft.value : values[index]} ETH
            </Typography>
            <Typography variant="caption12" color="primary">
              {nft.timestamp}
            </Typography>
            {nft.isReceived && (
              <Tooltip content={`Received From ${nft.from}`}>
                <IconButton>
                  <Info />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            {!nft.isRedeemed && (
              <ButtonBase
                sx={{ borderRadius: "10px", mt: 3 }}
                value={index}
                onClick={(e) => setTokenIdAndRedeem(e.currentTarget.value)}
                disabled={nft.isRedeemed}
              >
                <Button
                  sx={{
                    borderRadius: "10px"
                  }}
                  variant="outlined"
                >
                  Redeem GiftCard
                </Button>
              </ButtonBase>
            )}
            <ButtonBase
              sx={{ borderRadius: "10px", mt: 3 }}
              value={index}
              onClick={(e) => setTokenIdAndTransfer(e.currentTarget.value)}
              >
                <Button
                  sx={{
                    borderRadius: "10px"
                  }}
                  variant="outlined"
                >
                Transfer GiftCard
                </Button>
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
