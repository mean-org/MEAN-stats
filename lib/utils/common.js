"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenAccountBalanceByAddress = exports.findATokenAddress = exports.normalizeTokenAmount = exports.sleep = exports.getCoinGeckoPrices = exports.getRaydiumPrices = exports.getTotalTvl = exports.createProgram = exports.createAnchorProvider = exports.createReadonlyWallet = exports.createConnection = exports.options = exports.MSP_ID = exports.USDC_PUBKEY = exports.SMEAN_INFO = exports.SMEAN_PUBKEY = exports.MEAN_INFO = exports.MEAN_PUBKEY = exports.UNRELEASED_TOKENS_ACCOUNT_PUBKEY = exports.INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const anchor_1 = require("@project-serum/anchor");
const cross_fetch_1 = require("cross-fetch");
exports.INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY = new web3_js_1.PublicKey("4CUSb4s7T9VTfv6Ti9EFEqiiZJbV3ZpXhNTYiYMveVZW");
exports.UNRELEASED_TOKENS_ACCOUNT_PUBKEY = new web3_js_1.PublicKey("GNHnU2infXYKu1HvDfNWrpNFNwz8CubrudVNgTZz8LSf");
//tokens prod
exports.MEAN_PUBKEY = new web3_js_1.PublicKey("MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD");
exports.MEAN_INFO = {
    symbol: "MEAN",
    name: "Mean Finance",
    maxSupply: 210000000,
    totalSupply: 210000000,
    address: exports.MEAN_PUBKEY.toString()
};
exports.SMEAN_PUBKEY = new web3_js_1.PublicKey("sMEANebFMnd9uTYpyntGzBmTmzEukRFwCjEcnXT2E8z");
exports.SMEAN_INFO = {
    symbol: "sMEAN",
    name: "Staked MEAN",
    address: exports.SMEAN_PUBKEY.toString()
};
exports.USDC_PUBKEY = new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
//programs
exports.MSP_ID = new web3_js_1.PublicKey('MSPCUMbLfy2MeT6geLMMzrUkv1Tx88XRApaVRdyxTuu');
exports.options = anchor_1.AnchorProvider.defaultOptions();
const createConnection = (url, commitmentOrConfig) => {
    return new web3_js_1.Connection(url, commitmentOrConfig || 'confirmed');
};
exports.createConnection = createConnection;
function createReadonlyWallet(pubKey) {
    return {
        publicKey: pubKey,
        signAllTransactions: (txs) => __awaiter(this, void 0, void 0, function* () { return txs; }),
        signTransaction: (tx) => __awaiter(this, void 0, void 0, function* () { return tx; }),
        payer: web3_js_1.Keypair.generate(), // dummy unused payer
    };
}
exports.createReadonlyWallet = createReadonlyWallet;
function createAnchorProvider(rpcUrl, wallet, opts) {
    opts = opts || exports.options;
    const connection = new web3_js_1.Connection(rpcUrl, opts === null || opts === void 0 ? void 0 : opts.preflightCommitment);
    return new anchor_1.AnchorProvider(connection, wallet, opts);
}
exports.createAnchorProvider = createAnchorProvider;
function createProgram(rpcUrl, wallet, programId, idl, confirmOptions) {
    const provider = createAnchorProvider(rpcUrl, wallet, confirmOptions);
    return new anchor_1.Program(idl, programId, provider);
}
exports.createProgram = createProgram;
const getTotalTvl = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, cross_fetch_1.fetch)((process.env.TOTAL_TVL_URL || 'http://localhost:3000'), { method: "GET" });
    return res.json();
});
exports.getTotalTvl = getTotalTvl;
const getRaydiumPrices = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, cross_fetch_1.fetch)('https://api.raydium.io/v2/main/price', {
        method: "GET",
    });
    const data = yield res.json();
    return data;
});
exports.getRaydiumPrices = getRaydiumPrices;
const getCoinGeckoPrices = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, cross_fetch_1.fetch)(`https://api.coingecko.com/api/v3/simple/price?ids=${Object.keys(ids).join(',')}&vs_currencies=usd`, {
        method: "GET",
    });
    const data = yield res.json();
    const list = Object.keys(data).map((x) => {
        return {
            id: ids[x],
            price: data[x].usd
        };
    });
    return Object.assign({}, ...list.map((x) => ({ [x.id]: x.price })));
});
exports.getCoinGeckoPrices = getCoinGeckoPrices;
const sleep = (ms, log = true) => {
    if (log) {
        console.log("Sleeping for", ms / 1000, "seconds");
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.sleep = sleep;
function normalizeTokenAmount(raw, decimals) {
    let rawTokens;
    if (typeof raw === "string")
        rawTokens = parseInt(raw);
    else
        rawTokens = raw;
    return rawTokens / Math.pow(10, decimals);
}
exports.normalizeTokenAmount = normalizeTokenAmount;
function findATokenAddress(walletAddress, tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield web3_js_1.PublicKey.findProgramAddress([
            walletAddress.toBuffer(),
            spl_token_1.TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ], spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID))[0];
    });
}
exports.findATokenAddress = findATokenAddress;
const getTokenAccountBalanceByAddress = (connection, tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    if (!connection || !tokenAddress)
        return null;
    try {
        const tokenAmount = (yield connection.getTokenAccountBalance(tokenAddress)).value;
        return tokenAmount;
    }
    catch (error) {
        console.error(`getTokenAccountBalance failed for: ${tokenAddress.toBase58()}`, error);
        return null;
    }
});
exports.getTokenAccountBalanceByAddress = getTokenAccountBalanceByAddress;
