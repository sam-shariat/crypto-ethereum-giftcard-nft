import { gql } from "@apollo/client";

const GET_MY_NFTS = gql(`
query($destination: String) {
    giftCardMinteds (where : { destination : $destination }){
      id
      tokenId
      destination
      value
      transactionHash
      blockTimestamp
    },
    giftCardRedeemeds (where : { destination : $destination }){
      id
      tokenId
      destination
      value
      transactionHash
      blockTimestamp
    },
    sent:transfers( where : { 
      from_not_contains:"0x0000000000000000000000000000000000000000",
      to_not_contains:"0x0000000000000000000000000000000000000000",
      from_contains:$destination,
     }){
      id
      tokenId
      from
      to
      transactionHash
      blockTimestamp
    },
    received:transfers( where : { 
      from_not_contains:"0x0000000000000000000000000000000000000000",
      to_not_contains:"0x0000000000000000000000000000000000000000",
      to_contains:$destination,
     }){
      id
      tokenId
      from
      to
      transactionHash
      blockTimestamp
    },
    
  }
`);
export default GET_MY_NFTS;
