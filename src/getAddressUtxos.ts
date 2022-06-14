import { SlpToken, Transaction, UnspentOutput } from "grpc-bchrpc-node";
import { ISLP_UTXO, UTXO } from "./types";
import { client, UTXO_LIMIT } from "./config";
import { toCashAddress, toSlpAddress } from "bchaddrjs-slp";
import * as slpMdm from "slp-mdm";

const addressMap = new Map<string, string>();
export default async function getAddressUtxos(
  address: string,
  limit: number = UTXO_LIMIT
): Promise<UTXO[]> {
  const response = await client.getAddressUtxos({
    address,
    includeTokenMetadata: true,
    includeMempool: true,
  });

  const utxos = response
    .getOutputsList()
    .slice(0, limit)
    .map((utxo) => {
      const slp = getSLP(utxo);
      const outpoint = utxo.getOutpoint() as Transaction.Input.Outpoint;

      if (!addressMap.has(address))
        addressMap.set(address, toSlpAddress(address));

      return {
        txid: Buffer.from(outpoint.getHash_asU8().reverse()).toString("hex"),
        vout: outpoint.getIndex(),
        value: utxo.getValue(),
        pubkey_script: Buffer.from(utxo.getPubkeyScript_asU8()).toString("hex"),
        block_height: utxo.getBlockHeight(),
        coinbase: utxo.getIsCoinbase(),
        slp,
        address: {
          addressBCH: address,
          addressSLP: addressMap.get(address) as string, // this is guaranteed not undefined
        },
      };
    });

  return utxos;
}

function getSLP(utxo: UnspentOutput): ISLP_UTXO | null {
  if (!utxo.hasSlpToken()) return null;

  const slpInfo = utxo.getSlpToken() as SlpToken; // this is guaranteed not undefined

  return {
    tokenId: Buffer.from(slpInfo.getTokenId()).toString("hex"),
    amount: new slpMdm.BN(slpInfo.getAmount()),
    isMintBaton: slpInfo.getIsMintBaton(),

    decimals: slpInfo.getDecimals(),
    slpAction: slpInfo.getSlpAction(),
    tokenType: slpInfo.getTokenType(),
  };
}
