import bitcore from "bitcore-lib-cash";
import { client } from "./config";

export default async function broadcastTx(
  tx: bitcore.Transaction,
  allowBurn: boolean = false
): Promise<string | null> {
  try {
    const res = await client.submitTransaction({
      txnHex: tx.serialize(),
      skipSlpValidityChecks: allowBurn,
    });

    return Buffer.from(res.getHash_asU8()).reverse().toString("hex");
  } catch (e) {
    throw e;
  }
}
