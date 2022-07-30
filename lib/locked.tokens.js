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
    constructor(tokenAddress, rpcUrl, verbose = false) {
        this.tokenAddress = typeof tokenAddress === 'string' ? new web3_js_1.PublicKey(tokenAddress) : tokenAddress;
        this.rpcUrl = rpcUrl || (0, web3_js_1.clusterApiUrl)('mainnet-beta');
        this.connection = new web3_js_1.Connection(this.rpcUrl);
        this.internalApi = new utils_1.InternalApi();
        this.solscanApi = new utils_1.SolscanApi();
        this.verbose = verbose;
        const tokenAccountList = (JSON.parse(process.env.TOKEN_ACCOUNTS_LIST || '[]'));
        this.tokenAccounts = tokenAccountList.map(x => new web3_js_1.PublicKey(x));
    }
    /**
     *
     * @returns Amount of tokens locked
     */
    getLockedTokenNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            let total = 0;
            // 1. staked means
            const stakedMeans = yield this.getStakedMeanTokens();
            total += stakedMeans;
            // 2. TokenAccounts mean
            const tokenAccountsBalance = yield this.getTokensAccountsBalance();
            total += tokenAccountsBalance;
            // 3. locked streams
            const lockedStreams = yield this.getLockedStreams();
            total += lockedStreams;
            return total;
        });
    }
    getStakedMeanTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            try {
                const sMeanPrice = yield this.internalApi.getTokenPrice(utils_1.SMEAN_PUBKEY.toString());
                if (this.verbose)
                    console.log('sMeanPrice:', sMeanPrice);
                if (sMeanPrice) {
                    const meanPrice = yield this.solscanApi.getTokenPrice(utils_1.MEAN_PUBKEY.toString());
                    if (this.verbose)
                        console.log('meanPrice:', meanPrice);
                    if (meanPrice) {
                        balance = Number(sMeanPrice.marketCapFD) / meanPrice.priceUsdt;
                    }
                }
                else {
                }
            }
            catch (error) {
                if (this.verbose)
                    console.error('getStakedMeanTokens:ERROR:', error);
            }
            return balance;
        });
    }
    getTokensAccountsBalance() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            try {
                for (let i = 0; i < this.tokenAccounts.length; i++) {
                    const token = this.tokenAccounts[i];
                    const accountInfo = yield this.connection.getParsedAccountInfo(token);
                    const { mint, tokenAmount: { amount, decimals } } = ((_a = accountInfo.value) === null || _a === void 0 ? void 0 : _a.data).parsed.info;
                    if (this.tokenAddress.equals(new web3_js_1.PublicKey(mint))) {
                        const amountNormalized = (0, utils_1.normalizeTokenAmount)(amount, decimals);
                        balance += amountNormalized;
                    }
                }
            }
            catch (error) {
                if (this.verbose)
                    console.error('getTokensAccountsBalance:ERROR:', error);
            }
            return balance;
        });
    }
    getLockedStreams() {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            try {
                const invLocked = Number(process.env.INV_LOCKED || '0');
                balance += invLocked;
                // const msp = new Program(IDL, MSP_ID);
                // const filters = [{ dataSize: 500, memcmp: { bytes: '1', offset: 1 }, } as GetProgramAccountsFilter];
                // const streams = await msp.account.stream.all(filters);
            }
            catch (error) {
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
