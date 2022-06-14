import { UTXO } from "./types";
import bitcore from "bitcore-lib-cash";

export default function utxoToUnspent(
  utxo: UTXO
): bitcore.Transaction.UnspentOutput {
  return new bitcore.Transaction.UnspentOutput({
    txId: utxo.txid,
    outputIndex: utxo.vout,
    script: new bitcore.Script(utxo.pubkey_script),
    satoshis: utxo.value,
  });
}
