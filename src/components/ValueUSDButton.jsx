import { Button } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { ethPriceAtom, mintValue } from "../constants/atoms";

const ValueUSDButton = ({value}) => {
    const ethPrice = useAtomValue(ethPriceAtom);
    const setValue = useSetAtom(mintValue);
    function updateValue(val) {
        if (ethPrice > 0) {
          setValue(val / ethPrice);
        } else {
          console.log("eth value is zero");
        }
      }
  return (
    <Button
      onClick={() => updateValue(value)}
      variant="outlined"
      sx={{ borderRadius: "10px" }}
    >
      ${value}
    </Button>
  );
};

export default ValueUSDButton;
