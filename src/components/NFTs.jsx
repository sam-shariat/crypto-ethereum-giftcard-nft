import { Grid } from "@mui/material";
import { useAtomValue } from "jotai";
import { NFTsAtom, URIsAtom, valuesAtom } from "../constants/atoms";
import GiftCard from "./GiftCard";

const NFTs = () => {
  const myNfts = useAtomValue(NFTsAtom);
  const myURIs = useAtomValue(URIsAtom);
  const values = useAtomValue(valuesAtom);
  
  return myNfts.map((nft, i) => (
    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
      <GiftCard
        nft={nft}
        uri={myURIs[i] && myURIs[i]}
        values={values}
        index={i}
        key={nft.id}
      />
    </Grid>
  ));
};

export default NFTs;
