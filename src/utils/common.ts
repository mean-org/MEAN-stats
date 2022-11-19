import { Commitment, Connection, ConnectionConfig, Keypair, PublicKey, ConfirmOptions } from "@solana/web3.js";
import { Program, Idl, Wallet, AnchorProvider } from "@project-serum/anchor";
import { fetch } from 'cross-fetch';

export const INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY = new PublicKey("4CUSb4s7T9VTfv6Ti9EFEqiiZJbV3ZpXhNTYiYMveVZW");
export const UNRELEASED_TOKENS_ACCOUNT_PUBKEY = new PublicKey("GNHnU2infXYKu1HvDfNWrpNFNwz8CubrudVNgTZz8LSf");

//tokens prod
export const MEAN_PUBKEY = new PublicKey("MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD");
export const MEAN_INFO = {
  symbol: "MEAN",
  name: "Mean Finance",
  maxSupply: 210_000_000,
  totalSupply: 210_000_000,
  address: MEAN_PUBKEY.toString()
};

export const SMEAN_PUBKEY = new PublicKey("sMEANebFMnd9uTYpyntGzBmTmzEukRFwCjEcnXT2E8z");
export const SMEAN_INFO = {
  symbol: "sMEAN",
  name: "Staked MEAN",
  address: SMEAN_PUBKEY.toString()
};

export const USDC_PUBKEY = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

//programs
export const MSP_ID = new PublicKey('MSPCUMbLfy2MeT6geLMMzrUkv1Tx88XRApaVRdyxTuu');

export const options = AnchorProvider.defaultOptions();

export const createConnection = (
  url: string,
  commitmentOrConfig?: Commitment | ConnectionConfig | undefined
): Connection => {
  return new Connection(url, commitmentOrConfig || 'confirmed');
};

export function createReadonlyWallet(pubKey: PublicKey): Wallet {
  return {
    publicKey: pubKey,
    signAllTransactions: async (txs: any) => txs,
    signTransaction: async (tx: any) => tx,
    payer: Keypair.generate(), // dummy unused payer
  };
}

export function createAnchorProvider(
  rpcUrl: string,
  wallet: Wallet,
  opts?: ConfirmOptions) {

  opts = opts || options;
  const connection = new Connection(rpcUrl, opts?.preflightCommitment);
  return new AnchorProvider(connection, wallet, opts);
}

export function createProgram<T extends Idl>(
  rpcUrl: string,
  wallet: Wallet,
  programId: PublicKey,
  idl: T,
  confirmOptions?: ConfirmOptions
): Program<T> {
  const provider = createAnchorProvider(rpcUrl, wallet, confirmOptions);
  return new Program<T>(idl, programId, provider);
}

export const getTotalTvl = async (): Promise<{ total: number, symbol: string, lastUpdateUtc: string }> => {
  const res = await fetch((process.env.TOTAL_TVL_URL || 'http://localhost'), { method: "GET" });
  return res.json();
}

export const getRaydiumPrices = async (): Promise<{ [k: string]: number }> => {
  const res = await fetch('https://api.raydium.io/v2/main/price', {
    method: "GET",
  });
  const data = await res.json();
  return data as { [k: string]: number };
};

export const getCoinGeckoPrices = async (ids: { [k: string]: string }): Promise<{ [k: string]: number }> => {
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${Object.keys(ids).join(',')}&vs_currencies=usd`, {
    method: "GET",
  });
  const data = await res.json() as { [k: string]: { usd: number } };
  const list = Object.keys(data).map((x: string) => {
    return {
      id: ids[x],
      price: data[x].usd
    }
  });
  return Object.assign({}, ...list.map((x: any) => ({ [x.id]: x.price })));
};

export const sleep = (ms: number, log: boolean = true) => {
  if (log) { console.log("Sleeping for", ms / 1000, "seconds"); }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeTokenAmount(
  raw: string | number,
  decimals: number
): number {
  let rawTokens: number;
  if (typeof raw === "string") rawTokens = parseInt(raw);
  else rawTokens = raw;
  return rawTokens / Math.pow(10, decimals);
}