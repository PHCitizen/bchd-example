import slpMdm from "slp-mdm";

export interface ISLP_UTXO {
  tokenId: string;
  amount: slpMdm.BN;
  isMintBaton: boolean;
  decimals: number;
  slpAction: number;
  tokenType: number;
}

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  pubkey_script: string;
  block_height: number;
  coinbase: boolean;
  slp: ISLP_UTXO | null;
  address: {
    addressBCH: string;
    addressSLP: string;
  };
}
