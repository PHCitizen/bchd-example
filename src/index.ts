require("dotenv").config();

import { toSlpAddress } from "bchaddrjs-slp";
import bitcore from "bitcore-lib-cash";
import { FLEXUSD_ADDRESS, NETWORK, PRIVATE_KEY } from "./config";
import * as slpMdm from "slp-mdm";
import broadcastTx from "./brodcast";
import mintTokenType1 from "./mintTokenType1";
import sendTokenType1 from "./sendTokenType1";
import getAddressUtxos from "./getAddressUtxos";

console.log(`RUNNING ON ${NETWORK} MODE`);

const PK = new bitcore.PrivateKey(PRIVATE_KEY, NETWORK);
const address = PK.toAddress().toString();
console.log(`\nUSING ADDRESS:`);
console.log(`   -> ${address}`);
console.log(`   -> ${toSlpAddress(address)}\n\n`);

async function main() {
  // const tx = await mintTokenType1({
  //   PK,
  //   token: {
  //     name: "TEST TOKEN",
  //     symbol: "TT",
  //     documentHash: "",
  //     documentURI: "",
  //     decimals: 2,
  //     initialQty: 100,
  //   },
  // });

  /**
   * ======================================================================
   * ======================================================================
   * ======================================================================
   */

  const tx = await sendTokenType1({
    amount: new slpMdm.BN("100000000000000000000000000000000000000"),
    /**
     * @warning amount must start on decimal value.
     * @example
     *
     * USD has 2 decimal
     *
     * -> you need to send 10 USD
     *      -> amount must be 1000
     * -> you need to send 0.1 USD
     *      -> amount must be 10
     */
    PK,
    toAddress: "", // bch or slp format
    tokenId: FLEXUSD_ADDRESS,
  });

  // console.log(await broadcastTx(tx));
}
main();
