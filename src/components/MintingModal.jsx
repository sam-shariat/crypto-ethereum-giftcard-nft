import { Modal, Paper, Typography, Box, Button, Link } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { Loading } from "web3uikit";
import { ethValueAtom, mintedAtom, mintStatusAtom } from "../constants/atoms";
import { MODAL_STYLE } from "../constants/constants";
import GiftCardSVG from "./GiftCardSVG";

const MintingModal = () => {
    const [mintStatus,setMintStatus] = useAtom(mintStatusAtom)
    const ethValue = useAtomValue(ethValueAtom);
    const minted = useAtomValue(mintedAtom);

  return (
    <Modal open={mintStatus !== "OPEN"} aria-labelledby="mint-modal">
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          ...MODAL_STYLE,
        }}
      >
        <Typography
          variant="h6"
          p={2}
          borderBottom={"solid 1px #333333"}
          width={"100%"}
        >
          {mintStatus !== "MINTED"
            ? `Minting ${ethValue} USD GiftCard NFT`
            : "GiftCard NFT Minted Succesfully"}
        </Typography>
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <GiftCardSVG sx={{width:300}} />
          {mintStatus !== "MINTED" && 
            <Loading
              direction="right"
              spinnerColor="#ffffff"
              spinnerType="wave"
              size="large"
            />
          }
          <Typography pt={2}>
            {mintStatus === "MINTING"
              ? "Please Confirm The Transaction On Your Wallet ..."
              : mintStatus === "WAITING"
              ? "Transaction Received. Please be Pationt while Your NFT is minting ..."
              : mintStatus === "MINTED"
              ? "Congratulations, GiftCard NFT Minted."
              : ""}
          </Typography>
        </Box>
        <Box
          display="flex"
          p={2}
          gap={1}
          borderTop={"solid 1px #333333"}
          justifyContent={"space-between"}
        >
          <Button
            size="large"
            disabled={mintStatus !== "MINTED"}
            LinkComponent={Link}
            href={minted}
            variant="outlined"
          >
            View On Opensea
          </Button>
          <Button
            size="large"
            disabled={mintStatus !== "MINTED"}
            onClick={() => mintStatus === "MINTED" && setMintStatus("OPEN")}
          >
            Close
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default MintingModal;
