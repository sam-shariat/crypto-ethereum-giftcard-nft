<div align="center">

<h2 align="center">CEGC - Crypto Ethereum Gift Cards</h2>

<p align="justify">CEGC is a Decentralized Application where you can mint a Ethereum Gift Card NFT for you or any wallet address, then you can redeem the NFT and withdraw it to your wallet.</p>
</div>
<br/>
<h3 align="left"><a href="https://sam-shariat.github.io/crypto-ethereum-giftcard-nft/" target="_blank">Live Demo</a></h3>

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- Moralis : [react-moralis](https://github.com/MoralisWeb3/react-moralis)
- Web3uikit : [web3uikit](https://github.com/web3ui/web3uikit)
- Web3.js : [web3.js](https://github.com/web3/web3.js)

## :point_down: Features

### working

- working on GOERLI testnet ( [Get Goerli Testnet Faucet](https://faucetlink.to/goerli) )
- Mint customizable ERC721 Token (NFT) with your desired value 
- Redeem NFT and withdraw the value to the destination wallet
- Transfer NFT to a destination wallet
- Get the latest Eth price from chainlink

<!-- GETTING STARTED -->

## :point_down: Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) v16.xx.x

### Run locally

1. Clone repo

   ```sh
   git clone https://github.com/sam-shariat/crypto-ethereum-giftcard-nft.git
   ```

2. Install packages
   ```sh
   npm install or yarn install
   ```
3. Run application
   ```sh
   npm start or yarn start
   ```
4. Open development server on http://localhost:3000

<p align="right">(<a href="#top">back to top</a>)</p>

## :computer: Development: Connect to testnet wallet

- Install a wallet extention like Metamask and create an account [Metamask Chrome Extention](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
- Add funds using [goerli testnet faucet](https://faucetlink.to/goerli)
- Enjoy

<p align="right">(<a href="#top">back to top</a>)</p>

## :computer: Building The Package

- You need to add these configs to webpack for building this package
- webpack.config.js can be found at node_modules/react-scripts/configs

```
{ ...currentConfig,
    resolve: {
      fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false,
        "crypto": false,
        "os": require.resolve("os-browserify/browser"),
        "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
      }
}
```

- Then Run 
```sh
npm build or yarn build 
```

- build files will be distributed to 'build' folder

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## :writing_hand: Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>
