import * as slpMdm from "slp-mdm";
import bitcore from "bitcore-lib-cash";
import getAddressUtxos from "./getAddressUtxos";
import { UTXO } from "./types";
import utxoToUnspent from "./utxoToUnspent";
import { FEE } from "./config";

interface IParam {
  token: {
    symbol: string;
    name: string;
    documentURI: string;
    documentHash: string;
    decimals: number;
    initialQty: number;
  };
  PK: bitcore.PrivateKey;
}

export default async function mintTokenType1(param: IParam) {
  const address = param.PK.toAddress().toString();
  const utxos = await getAddressUtxos(address);
  const bchUtxos = utxos.filter((utxo) => utxo.slp === null);

  const balance = bchUtxos.reduce((a: number, v: UTXO) => a + v.value, 0);
  if (balance < 5000) throw new Error("BCH balance too low");

  const inputUtxos = [];
  let totalSatoshi = 0;
  // use small amount of utxos only
  for (const utxo of bchUtxos) {
    inputUtxos.push(utxoToUnspent(utxo));
    totalSatoshi += utxo.value;
    if (totalSatoshi > 5000) break;
  }

  const buffer = slpMdm.TokenType1.genesis(
    param.token.symbol,
    param.token.name,
    param.token.documentURI,
    param.token.documentHash,
    param.token.decimals,
    2,
    new slpMdm.BN(param.token.initialQty)
  );

  return new bitcore.Transaction()
    .from(inputUtxos)
    .addOutput(
      new bitcore.Transaction.Output({
        script: bitcore.Script.fromBuffer(buffer),
        satoshis: 0,
      })
    )
    .to(address, 546) // group output
    .to(address, 546) // mint baton
    .change(address)
    .feePerByte(FEE)
    .sign(param.PK);
}
