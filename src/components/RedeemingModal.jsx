import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useWeb3Contract } from "react-moralis";
import { Loading } from "web3uikit";
import { contractInfo, NFTsAtom, redeemIndexAtom, redeemStatusAtom, URIsAtom, valuesAtom } from "../constants/atoms";
import { MODAL_STYLE } from "../constants/constants";

const RedeemingModal = () => {
  const [redeemStatus, setRedeemStatus] = useAtom(redeemStatusAtom);
  const contract = useAtomValue(contractInfo)
  const myNfts = useAtomValue(NFTsAtom);
  const myURIs = useAtomValue(URIsAtom);
  const values = useAtomValue(valuesAtom);
  const redeemIndex = useAtomValue(redeemIndexAtom);

  const { runContractFunction: redeem } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "redeem",
    params: {
      tokenId: myNfts[redeemIndex] ? myNfts[redeemIndex].tokenId : null,
    },
  });

  async function doRedeem() {
    console.log("redeeming " + myNfts[redeemIndex].tokenId + " ...");
    setRedeemStatus("WAITING");
    await redeem({
      onSuccess: (tx) => handleRedeemSuccess(tx),
      onError: (error) => {
        setRedeemStatus("REDEEMING");
      },
    });
    console.log("done.");
  }

  const handleRedeemSuccess = async function (tx) {
    setRedeemStatus("REDEEMED")
    const txRes = await tx.wait(1);
    setRedeemStatus("REDEEMCONFIRMED");
    //`https://goerli.etherscan.io/tx/${txRes.transactionHash}`
  };

  return (
    <Modal
      open={redeemStatus !== "IDLE"}
      onClose={() => redeemStatus !== "WAITING" && setRedeemStatus("IDLE")}
      aria-labelledby="redeem-modal"
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
          {redeemStatus === "REDEEMCONFIRMED"
            ? `${myURIs[redeemIndex].description} Redeemed Succesfully`
            : `Redeeming ${myURIs[redeemIndex].description}`}
        </Typography>
        <Box sx={{ p: 2 }}>
          <Typography>
            {redeemStatus !== "REDEEMCONFIRMED" && `Redeeming`} GiftCard Worth{" "}
            <strong>
              {myNfts[redeemIndex].value == 0
                ? values[redeemIndex]
                : myNfts[redeemIndex].value}{" "}
              ETH
            </strong>
            {redeemStatus === "REDEEMCONFIRMED" && `Redeemed`}
            {" "}Into <strong>{myNfts[redeemIndex].destination}</strong>
          </Typography>

          <Box pt={2}>
            {redeemStatus === "REDEEMING" ? (
              <Typography>
                Please Confirm Redeem By Pressing <b>REDEEM</b>
              </Typography>
            ) : redeemStatus === "WAITING" ? (
              <Typography>
                Please Confirm The Redeem Transaction On Your Wallet ...
              </Typography>
            ) : redeemStatus === "REDEEMED" ? (
              <Typography>
                Redeem succesfull. Waiting for Blockchain Confirmation ...
              </Typography>
            ) : redeemStatus === "REDEEMCONFIRMED" ? (
              <Typography>
                Congratulations. GiftCard Redeemed Succesfully
              </Typography>
            ) : (
              ""
            )}
          </Box>
        </Box>
        <Box
          display={"flex"}
          borderTop={"solid 1px #333333"}
          p={2}
          gap={1}
          justifyContent={"space-between"}
        >
          <Button
            size="large"
            disabled={redeemStatus !== "REDEEMING"}
            onClick={() => doRedeem()}
            variant="outlined"
          >
            {redeemStatus === "WAITING" ? (
              <Loading
                direction="right"
                spinnerColor="#ffffff"
                spinnerType="wave"
                size="large"
              />
            ) : (
              "Redeem"
            )}
          </Button>
          <Button
            size="large"
            onClick={()=> redeemStatus !== "WAITING" && setRedeemStatus("IDLE")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default RedeemingModal;
