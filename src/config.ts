import { GrpcClient } from "grpc-bchrpc-node";

export const FLEXUSD_ADDRESS =
  "dd21be4532d93661e8ffe16db6535af0fb8ee1344d1fef81a193e2b4cfa9fbc9";

export const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
export const NETWORK = process.env.NETWORK ?? "testnet";

export const RPC =
  NETWORK === "testnet"
    ? "bchd-testnet.greyh.at:18335"
    : "bchd.fountainhead.cash:443";

export const client = new GrpcClient({
  url: RPC,
  rootCertPath: "./cacert.pem",
  testnet: NETWORK === "testnet",
});

export const FEE = Number(process.env.FEE);

// limit useable utxo.
// prevent spending all utxos in case of emergency;)
export const UTXO_LIMIT = 10;
