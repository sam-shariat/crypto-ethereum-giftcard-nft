import * as React from "react";
import { Paper, Box, ButtonBase, IconButton } from "@mui/material";
import { Loading, Tooltip, Typography } from "web3uikit";
import { BG_COLOR, BORDER_COLOR } from "../constants/constants";
import Web3 from "web3";
import { Info } from "@mui/icons-material";
const web3 = new Web3(Web3.givenProvider);

export default function GiftCard({
  uri,
  nft,
  values,
  index,
  onRedeemClick,
  onTransferClick,
}) {
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: "10px",
        border: "solid 2px transparent",
        ":hover": {
          border: "solid 2px #777",
        },
      }}
    >
      <Box container>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box>
            {uri ? (
              <img
                src={uri.image}
                width={"100%"}
                style={{ borderRadius: "10px" }}
              />
            ) : (
              <center>
                <Loading
                  direction="right"
                  spinnerColor="#ffffff"
                  spinnerType="wave"
                  size="large"
                />
              </center>
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
                onClick={(e) => onRedeemClick(e.currentTarget.value)}
                disabled={nft.isRedeemed}
              >
                <Paper
                  sx={{
                    backgroundColor: BG_COLOR,
                    p: "12px",
                    borderRadius: "10px",
                    border: nft.isRedeemed
                      ? "2px solid transparent"
                      : "2px solid",
                    borderColor: BORDER_COLOR,
                  }}
                >
                  Redeem GiftCard
                </Paper>
              </ButtonBase>
            )}
            <ButtonBase
              sx={{ borderRadius: "10px", mt: 3 }}
              value={index}
              onClick={(e) => onTransferClick(e.currentTarget.value)}
            >
              <Paper
                sx={{
                  backgroundColor: BG_COLOR,
                  p: "12px",
                  borderRadius: "10px",
                  border: "2px solid",
                  borderColor: BORDER_COLOR,
                }}
              >
                Transfer GiftCard
              </Paper>
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
