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
exports.InternalApi = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class InternalApi {
    constructor() {
        this.baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
        this.apiHeaders = { "Accept": "application/json", "User-Agent": "MeanFi" };
    }
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.baseUrl}/?tokenAddress=${tokenAddress}`, {
                    method: 'GET',
                    headers: Object.assign({}, this.apiHeaders)
                });
                return response.json();
            }
            catch (error) {
                return null;
            }
        });
    }
}
exports.InternalApi = InternalApi;
