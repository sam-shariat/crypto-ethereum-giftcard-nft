import { Box, ButtonBase, Paper } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import {
  colorCodesAtom,
  colorIndexAtom,
  contractInfo,
  mintColorIndex,
} from "../constants/atoms";

const ColorSelector = () => {
  const [colorIndex, setColorIndex] = useAtom(colorIndexAtom);
  const [pickedColorIndex, setPickedColorIndex] = useAtom(mintColorIndex);
  const [colorCodes, setColorCodes] = useAtom(colorCodesAtom);
  const contract = useAtomValue(contractInfo);
  const { isWeb3Enabled } = useMoralis();
  const { runContractFunction: getColorCode } = useWeb3Contract({
    abi: contract.abi,
    contractAddress: contract.address,
    functionName: "getColor",
    params: {
      i: colorIndex,
    },
  });

  async function updateUI() {
    if (colorIndex < 10) {
      let colorCode = await getColorCode();
      if (colorCode) {
        setColorCodes((s) => [...s, colorCode]);
        setColorIndex((s) => s + 1);
      } else {
        console.log("color codes error")
      }
    };
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [
    isWeb3Enabled,
    colorIndex
  ]);
  return (
    <Paper
      sx={{
        borderRadius: "10px",
        p: 1,
      }}
    >
      <Box sx={{ p: 1 }}>Pick Color :</Box>
      {colorCodes.map((item, i) => {
        return (
          <ButtonBase
            value={i}
            onClick={(e) => setPickedColorIndex(e.currentTarget.value)}
            sx={{ p: 1 }}
            key={i+"-"+item}
          >
            <Paper
              sx={{
                backgroundColor: `#${item}`,
                p: "12px",
                borderRadius: "10px",
                border: i == pickedColorIndex ? "1px solid #fff" : "none",
              }}
            >
              {item}
            </Paper>
          </ButtonBase>
        );
      })}
    </Paper>
  );
};

export default ColorSelector;
