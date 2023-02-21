import {
  Box,
  Button,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useWeb3Contract } from "react-moralis";
import { Loading } from "web3uikit";
import {
  contractInfo,
  mintWalletAddress,
  NFTsAtom,
  transferIndexAtom,
  transferStatusAtom,
  transferWalletAtom,
  URIsAtom,
  valuesAtom,
} from "../constants/atoms";
import Web3 from "web3";
import { MODAL_STYLE } from "../constants/constants";
const web3 = new Web3(Web3.givenProvider);

const TransferModal = () => {
  const [transferStatus, setTransferStatus] = useAtom(transferStatusAtom);
  const contract = useAtomValue(contractInfo);
  const myNfts = useAtomValue(NFTsAtom);
  const myURIs = useAtomValue(URIsAtom);
  const values = useAtomValue(valuesAtom);
  const transferIndex = useAtomValue(transferIndexAtom);
  const walletAddress = useAtomValue(mintWalletAddress);
  const [transferWallet, setTransferWallet] = useAtom(transferWalletAtom);

  const { runContractFunction: transferFrom } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "transferFrom",
    params: {
      tokenId: myNfts[transferIndex] ? myNfts[transferIndex].tokenId : null,
      from: walletAddress,
      to: transferWallet,
    },
  });

  async function doTransfer() {
    console.log("transferring " + myNfts[transferIndex].tokenId + " ...");
    setTransferStatus("WAITING");
    await transferFrom({
      onSuccess: (tx) => handleTransferSuccess(tx),
      onError: (error) => {
        setTransferStatus("TRANSFERRING");
      },
    });
    console.log("done.");
  }

  const handleTransferSuccess = async function (tx) {
    setTransferStatus("TRANSFERRED");
    const txRes = await tx.wait(1);
    setTransferStatus("TRANSFERCONFIRMED");
    //`https://goerli.etherscan.io/tx/${txRes.transactionHash}`
  };

  return (
    <Modal
      open={transferStatus !== "IDLE"}
      aria-labelledby="transfer-modal"
      onClose={() => transferStatus !== "WAITING" && setTransferStatus("IDLE")}
    >
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
          {transferStatus === "TRANSFERCONFIRMED"
            ? `${myURIs[transferIndex].description} Transfered Succesfully`
            : `Transferring ${myURIs[transferIndex].description}`}
        </Typography>
        <Box sx={{ p: 2 }}>
          <Typography mb={2}>
            {transferStatus !== "TRANSFERCONFIRMED" && `Transferring`} GiftCard
            Worth{" "}
            <strong>
              {myNfts[transferIndex].value == 0
                ? values[transferIndex]
                : myNfts[transferIndex].value}{" "}
              ETH
            </strong>{" "}
            {transferStatus === "TRANSFERCONFIRMED" && `Transferred`}
            To <strong>{transferWallet}</strong>
          </Typography>

          <TextField
            label="Destination Wallet Address e.g. 0x..."
            value={transferWallet}
            disabled={transferStatus !== "TRANSFERRING"}
            InputProps={{ style: { borderRadius: "10px" } }}
            onChange={(e) => {
              setTransferWallet(e.currentTarget.value);
            }}
            hidden={transferStatus === "TRANSFERCONFIRMED"}
            fullWidth
          />
          <Box mt={1}>
            {transferStatus === "TRANSFERRING" ? (
              <Typography>
                Please Confirm The Transfer By Pressing <b>TRANSFER</b>
              </Typography>
            ) : transferStatus === "WAITING" ? (
              <Typography>
                Please Confirm The Transfer Transaction On Your Wallet ...
              </Typography>
            ) : transferStatus === "TRANSFERRED" ? (
              <Typography>
                Transfer succesfull. Waiting for Blockchain Confirmation ...
              </Typography>
            ) : transferStatus === "TRANSFERCONFIRMED" ? (
              <Typography>
                Congratulations. GiftCard Transferred Succesfully
              </Typography>
            ) : (
              ""
            )}
          </Box>
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
            disabled={transferStatus !== "TRANSFERRING" || !web3.utils.isAddress(transferWallet)}
            onClick={() => doTransfer()}
            variant="outlined"
          >
            {transferStatus === "WAITING" ? (
              <Loading
                direction="right"
                spinnerColor="#ffffff"
                spinnerType="wave"
                size="large"
              />
            ) : (
              "Transfer"
            )}
          </Button>
          <Button
            size="large"
            onClick={()=> transferStatus !== "WAITING" && setTransferStatus("IDLE")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default TransferModal;