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
        this.verbose = verbose;
    }
    getLockedTokensAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            console.log('Fetching locked tokens amount...');
            try {
                const meanTokenAddress = yield (0, utils_1.findATokenAddress)(utils_1.INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY, this.tokenAddress);
                const result = yield (0, utils_1.getTokenAccountBalanceByAddress)(this.connection, meanTokenAddress);
                console.log('accountBalance <TokenAmount | null>:', result);
                if (result) {
                    balance = result.uiAmount || 0;
                }
                return balance;
            }
            catch (error) {
                if (this.verbose) {
                    console.error('getLockedTokensAmount:ERROR:', error);
                }
                return balance;
            }
        });
    }
    getUnreleasedTokensAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = 0;
            console.log('Fetching unreleased tokens amount...');
            try {
                const meanTokenAddress = yield (0, utils_1.findATokenAddress)(utils_1.UNRELEASED_TOKENS_ACCOUNT_PUBKEY, this.tokenAddress);
                const result = yield (0, utils_1.getTokenAccountBalanceByAddress)(this.connection, meanTokenAddress);
                console.log('accountBalance <TokenAmount | null>:', result);
                if (result) {
                    balance = result.uiAmount || 0;
                }
                return balance;
            }
            catch (error) {
                if (this.verbose) {
                    console.error('getUnreleasedTokensAmount:ERROR:', error);
                }
                return balance;
            }
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
