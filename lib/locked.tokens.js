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
exports.LockedTokens = void 0;
const token_1 = require("@project-serum/anchor/dist/cjs/utils/token");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
class LockedTokens {
    // private internalApi: InternalApi;
    // private solscanApi: SolscanApi;
    // private tokenAccounts: PublicKey[];
    constructor(tokenAddress, rpcUrl, verbose = false) {
        this.tokenAddress = typeof tokenAddress === 'string' ? new web3_js_1.PublicKey(tokenAddress) : tokenAddress;
        this.rpcUrl = rpcUrl || (0, web3_js_1.clusterApiUrl)('mainnet-beta');
        this.connection = new web3_js_1.Connection(this.rpcUrl);
        this.verbose = verbose;
        // this.internalApi = new InternalApi();
        // this.solscanApi = new SolscanApi();
        // const tokenAccountList: string[] = (JSON.parse(process.env.TOKEN_ACCOUNTS_LIST || '[]')) as string[];
        // this.tokenAccounts = tokenAccountList.map(x => new PublicKey(x));
    }
    // /**
    //  * 
    //  * @returns Amount of tokens locked
    //  */
    // async getLockedTokenNumber(): Promise<number> {
    //     let total = 0;
    //     // 1. staked means
    //     const stakedMeans = await this.getStakedMeanTokens();
    //     total += stakedMeans;
    //     // 2. TokenAccounts mean
    //     const tokenAccountsBalance = await this.getTokensAccountsBalance();
    //     total += tokenAccountsBalance;
    //     // 3. locked streams
    //     const lockedStreams = await this.getLockedStreams();
    //     total += lockedStreams;
    //     return total;
    // }
    // async getStakedMeanTokens(): Promise<number> {
    //     let balance = 0;
    //     try {
    //         const sMeanPrice = await this.internalApi.getTokenPrice(SMEAN_PUBKEY.toString());
    //         if (this.verbose) console.log('sMeanPrice:', sMeanPrice);
    //         if (sMeanPrice) {
    //             const meanPrice = await this.solscanApi.getTokenPrice(MEAN_PUBKEY.toString());
    //             if (this.verbose) console.log('meanPrice:', meanPrice);
    //             if (meanPrice) {
    //                 balance = Number(sMeanPrice.marketCapFD) / meanPrice.priceUsdt;
    //             }
    //         }
    //     } catch (error) {
    //         if (this.verbose) console.error('getStakedMeanTokens:ERROR:', error);
    //     }
    //     return balance;
    // }
    // async getTokensAccountsBalance(): Promise<number> {
    //     let balance = 0;
    //     try {
    //         for (const token of this.tokenAccounts) {
    //             const accountInfo = await this.connection.getParsedAccountInfo(token);
    //             const { mint, tokenAmount: { amount, decimals } } = (accountInfo.value?.data as ParsedAccountData).parsed.info;
    //             if (this.tokenAddress.equals(new PublicKey(mint))) {
    //                 const amountNormalized = normalizeTokenAmount(amount, decimals);
    //                 balance += amountNormalized;
    //             }
    //         }
    //     } catch (error) {
    //         if (this.verbose) console.error('getTokensAccountsBalance:ERROR:', error);
    //     }
    //     return balance;
    // }
    // async getLockedStreams(): Promise<number> {
    //     let balance = 0;
    //     try {
    //         const invLocked = Number(process.env.INV_LOCKED || '0');
    //         balance += invLocked;
    //         // const msp = new Program(IDL, MSP_ID);
    //         // const filters = [{ dataSize: 500, memcmp: { bytes: '1', offset: 1 }, } as GetProgramAccountsFilter];
    //         // const streams = await msp.account.stream.all(filters);
    //     } catch (error) {
    //     }
    //     return balance;
    // }
    getLockedTokensAmount() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            try {
                const accountInfo = yield this.connection.getParsedAccountInfo(utils_1.INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY);
                const { mint, tokenAmount: { amount, decimals } } = ((_a = accountInfo.value) === null || _a === void 0 ? void 0 : _a.data).parsed.info;
                if (this.tokenAddress.equals(new web3_js_1.PublicKey(mint))) {
                    const amountNormalized = (0, utils_1.normalizeTokenAmount)(amount, decimals);
                    balance += amountNormalized;
                }
            }
            catch (error) {
                if (this.verbose)
                    console.error('getLockedTokensAmount:ERROR:', error);
            }
            return balance;
        });
    }
    getUnreleasedTokensAmount() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            try {
                const accountInfo = yield this.connection.getParsedAccountInfo(utils_1.UNRELEASED_TOKENS_ACCOUNT_PUBKEY);
                const { mint, tokenAmount: { amount, decimals } } = ((_a = accountInfo.value) === null || _a === void 0 ? void 0 : _a.data).parsed.info;
                if (this.tokenAddress.equals(new web3_js_1.PublicKey(mint))) {
                    const amountNormalized = (0, utils_1.normalizeTokenAmount)(amount, decimals);
                    balance += amountNormalized;
                }
            }
            catch (error) {
                if (this.verbose)
                    console.error('getUnreleasedTokensAmount:ERROR:', error);
            }
            return balance;
        });
    }
    getTotalTokenHolders(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfos = yield this.connection.getParsedProgramAccounts(token_1.TOKEN_PROGRAM_ID, {
                filters: [
                    {
                        memcmp: { offset: 0, bytes: tokenAddress },
                    },
                    {
                        dataSize: 165
                    }
                ],
            });
            const results = accountInfos
                .filter(i => i.account.data.parsed.info.tokenAmount.uiAmount > 0);
            return results.length;
        });
    }
}
exports.LockedTokens = LockedTokens;
