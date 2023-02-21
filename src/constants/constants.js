const BG_COLOR = "#16171b";
const BORDER_COLOR = "#a0a0a0";
const MODAL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "90%", lg: "600px" },
  boxShadow: 24,
};
const TOUR_STEPS = [
  {
    selector: ".walletconnectbutton",
    content: "Connect Your Wallet To Get Started!",
  },
];
const RANDOM_WISHES = [
  "Happy Birthday",
  "Wish you the best",
  "Surprize",
  "Keep Up The Good Work",
  "Good Job",
  "Good Day",
  "Whatssup MotherFucke",
  "Cheers!",
  "Thanks",
  "Thank You",
  "Good Work",
];

const NAV_ITEMS = [
  { name: "Mint", url: "/crypto-ethereum-giftcard-nft/mint" },
  { name: "Redeem", url: "/crypto-ethereum-giftcard-nft/redeem" },
  { name: "About", url: "/crypto-ethereum-giftcard-nft/about" },
  {
    name: "etherscan",
    url: "https://goerli.etherscan.io/address/0xC7283CC85E13f7B4e496C57cc9D3754ffE22c0CD#code",
  },
  {
    name: "github",
    url: "https://github.com/sam-shariat/crypto-ethereum-giftcard-nft",
  },
];

const SOCIAL_LINKS = {
  email: "mailto:moslem.shariat@gmail.com",
  twitter: "https://twitter.com/samywalters",
  github: "https://github.com/sam-shariat/crypto-ethereum-giftcard-nft",
};

const GRAPH_URI =
  "https://api.studio.thegraph.com/query/40816/giftcardnft/v0.0.2";

const OPENSEA_ASSET_URL = "https://testnets.opensea.io/assets/goerli";
export {
  BG_COLOR,
  RANDOM_WISHES,
  BORDER_COLOR,
  NAV_ITEMS,
  MODAL_STYLE,
  TOUR_STEPS,
  GRAPH_URI,
  SOCIAL_LINKS,
  OPENSEA_ASSET_URL,
};
