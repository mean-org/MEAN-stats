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
exports.JupPriceApi = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class JupPriceApi {
    constructor() {
        this.baseUrl = 'https://price.jup.ag/v1';
        this.apiHeaders = { "Accept": "application/json", "User-Agent": "MeanFi" };
    }
    /**
     * Gets price of the token from Jupiter Price API (docs.jup.ag/jupiter-api/price-api-for-solana-beta).
     * @param tokenAddress token address or symbol
     * @returns
     */
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.baseUrl}/price?id=${tokenAddress}`, {
                    method: 'GET',
                    headers: Object.assign({}, this.apiHeaders)
                });
                const result = yield response.json();
                return result.data;
            }
            catch (error) {
                console.error(`getTokenPrice(address:${tokenAddress})`, error);
                return null;
            }
        });
    }
}
exports.JupPriceApi = JupPriceApi;
