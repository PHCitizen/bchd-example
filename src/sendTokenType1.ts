/**
 * @dev {@see IParam.amount} must start on decimal value.
 * @example
 *
 * USD has 2 decimal
 *
 * -> you need to send 10 USD
 *      -> amount must be 1000
 * -> you need to send 0.1 USD
 *      -> amount must be 10
 */
import * as slpMdm from "slp-mdm";
import bitcore from "bitcore-lib-cash";
import getAddressUtxos from "./getAddressUtxos";
import { UTXO } from "./types";
import utxoToUnspent from "./utxoToUnspent";
import { FEE } from "./config";
import { isSlpAddress, toCashAddress } from "bchaddrjs-slp";

interface IParam {
  tokenId: string;
  toAddress: string;
  amount: slpMdm.BN;
  PK: bitcore.PrivateKey;
}
export default async function sendTokenType1(param: IParam) {
  const toAddress = isSlpAddress(param.toAddress)
    ? toCashAddress(param.toAddress)
    : param.toAddress;

  const address = param.PK.toAddress().toString();
  const utxos = await getAddressUtxos(address);
  const bchUtxos = utxos.filter((utxo) => utxo.slp === null);
  const slpUtxos = utxos.filter(
    (utxo) =>
      utxo.slp !== null &&
      !utxo.slp.isMintBaton &&
      utxo.slp?.tokenId === param.tokenId
  );

  const balance = bchUtxos.reduce((a: number, v: UTXO) => a + v.value, 0);
  if (balance < 5000) throw new Error("balance too low");

  const inputUtxos = [];
  let totalSatoshi = 0;
  for (const utxo of bchUtxos) {
    // use small amount of utxos only
    inputUtxos.push(utxoToUnspent(utxo));
    totalSatoshi += utxo.value;
    if (totalSatoshi > 5000) break;
  }

  let totalToken = new slpMdm.BN(0);
  for (const utxo of slpUtxos) {
    // use appropriate amount only
    inputUtxos.push(utxoToUnspent(utxo));
    totalToken = totalToken.plus(utxo.slp!.amount);
    if (totalToken.gt(param.amount)) break;
  }
  if (totalToken < param.amount) throw new Error("TOKEN balance too low");

  const changeAmount = new slpMdm.BN(totalToken.minus(param.amount));
  const amounts = changeAmount.gt(0)
    ? [param.amount, changeAmount]
    : [param.amount];
  const buffer = slpMdm.TokenType1.send(param.tokenId, amounts);

  const tx = new bitcore.Transaction()
    .from(inputUtxos)
    .addOutput(
      new bitcore.Transaction.Output({
        script: bitcore.Script.fromBuffer(buffer),
        satoshis: 0,
      })
    )
    .to(toAddress, 546); // send tokens

  if (changeAmount.gt(0)) tx.to(address, 546); // change tokens

  tx.change(address) // extra bch
    .feePerByte(FEE)
    .sign(param.PK);

  return tx;
}
