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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolscanApi = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class SolscanApi {
    constructor() {
        this.solScanApiBaseUrl = 'https://api.solscan.io';
        this.solScanPublicApiBaseUrl = 'https://public-api.solscan.io';
        this.solScanApiHeaders = { "Accept": "application/json", "User-Agent": "MeanFi" };
    }
    /**
     * Gets metadata of the token from SolScan.
     * @param tokenAddress token address
     * @returns
     */
    getMetaData(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.solScanPublicApiBaseUrl}/token/meta?tokenAddress=${tokenAddress}`, {
                    method: 'GET',
                    headers: Object.assign({}, this.solScanApiHeaders)
                });
                const result = yield response.json();
                if (!result.address) {
                    throw `No metadata found for ${tokenAddress}`;
                }
                return result;
            }
            catch (error) {
                console.error(`getMetaData(address:${tokenAddress})`, error);
                return null;
            }
        });
    }
    /**
     * Gets metadata of the token from SolScan.
     * @param tokenAddress token address
     * @returns
     */
    getMetaData2(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.solScanApiBaseUrl}/token/meta?token=${tokenAddress}`, {
                    method: 'GET',
                    headers: Object.assign({}, this.solScanApiHeaders)
                });
                const result = yield response.json();
                if (!result.succcess) {
                    throw `No metadata found for ${tokenAddress}`;
                }
                return result.data;
            }
            catch (error) {
                console.error(`getMetaData(address:${tokenAddress})`, error);
                return null;
            }
        });
    }
    /**
     * Gets price of the token from SolScan.
     * @param tokenAddress token address
     * @returns
     */
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.solScanPublicApiBaseUrl}/market/token/${tokenAddress}`, {
                    method: 'GET',
                    headers: Object.assign({}, this.solScanApiHeaders)
                });
                const result = yield response.json();
                if (!result.priceUsdt) {
                    throw `No price found for ${tokenAddress}`;
                }
                return result;
            }
            catch (error) {
                console.error(`getTokenPrice(address:${tokenAddress})`, error);
                return null;
            }
        });
    }
    /**
     * Gets info about given staking account
     * @param accountAddress Mint address of staking account
     */
    getAccountInfo(accountAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.solScanPublicApiBaseUrl}/account/${accountAddress}`, {
                    method: 'GET',
                    headers: Object.assign({}, this.solScanApiHeaders)
                });
                const result = yield response.json();
                if (!result.type) {
                    throw `No price found for ${accountAddress}`;
                }
                return result;
            }
            catch (error) {
                console.error(`getAccountInfo(address:${accountAddress})`, error);
                return null;
            }
        });
    }
}
exports.SolscanApi = SolscanApi;
