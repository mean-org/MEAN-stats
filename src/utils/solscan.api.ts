import fetch from 'cross-fetch';

export class SolscanApi {
    private solScanApiBaseUrl = 'https://api.solscan.io';
    private solScanPublicApiBaseUrl = 'https://public-api.solscan.io';
    private solScanApiHeaders = { "Accept": "application/json", "User-Agent": "MeanFi" };
    constructor() {

    }

    /**
     * Gets metadata of the token from SolScan.
     * @param tokenAddress token address
     * @returns 
     */
    async getMetaData(tokenAddress: string): Promise<SolScanMetaInfo | null> {
        try {
            const response = await fetch(`${this.solScanPublicApiBaseUrl}/token/meta?tokenAddress=${tokenAddress}`, {
                method: 'GET',
                headers: {
                    ...this.solScanApiHeaders
                }
            });
            const result = await response.json();
            if (!result.address) {
                throw `No metadata found for ${tokenAddress}`;
            }
            return result as SolScanMetaInfo;
        } catch (error) {
            console.error(`getMetaData(address:${tokenAddress})`, error);
            return null;
        }
    }

    /**
     * Gets metadata of the token from SolScan.
     * @param tokenAddress token address
     * @returns 
     */
    async getMetaData2(tokenAddress: string): Promise<SolScanMetaInfo | null> {
        try {
            const response = await fetch(`${this.solScanApiBaseUrl}/token/meta?token=${tokenAddress}`, {
                method: 'GET',
                headers: {
                    ...this.solScanApiHeaders
                }
            });
            const result = await response.json();
            if (!result.succcess) {
                throw `No metadata found for ${tokenAddress}`;
            }
            return result.data;
        } catch (error) {
            console.error(`getMetaData(address:${tokenAddress})`, error);
            return null;
        }
    }

    /**
     * Gets price of the token from SolScan.
     * @param tokenAddress token address
     * @returns 
     */
    async getTokenPrice(tokenAddress: string): Promise<SolScanTokenPrice | null> {
        try {
            const response = await fetch(`${this.solScanPublicApiBaseUrl}/market/token/${tokenAddress}`, {
                method: 'GET',
                headers: {
                    ...this.solScanApiHeaders
                }
            });

            const result = await response.json();

            if (!result.priceUsdt) {
                throw `No price found for ${tokenAddress}`;
            }
            return result;
        } catch (error) {
            console.error(`getTokenPrice(address:${tokenAddress})`, error);
            return null;
        }
    }

    /**
     * Gets info about given staking account
     * @param accountAddress Mint address of staking account
     */
    async getAccountInfo(accountAddress: string): Promise<SolScanAccountInfo | null> {
        try {
            const response = await fetch(`${this.solScanPublicApiBaseUrl}/account/${accountAddress}`, {
                method: 'GET',
                headers: {
                    ...this.solScanApiHeaders
                }
            });
            const result = await response.json();
            if (!result.type) {
                throw `No price found for ${accountAddress}`;
            }
            return result;
        } catch (error) {
            console.error(`getAccountInfo(address:${accountAddress})`, error);
            return null;
        }
    }

}

export interface SolScanMetaInfo {
    symbol: string;
    address: string;
    name: string;
    icon: string;
    decimals: number;
    website?: string;
    twitter?: string;
    coingeckoId?: string;
    holder: number;
    supply?: string;
    tag?: any[];
}

export interface SolScanTokenPrice {
    priceUsdt: number;
    volumeUsdt?: number;
    marketCapFD?: number;
    marketCapRank?: number;
    priceChange24h?: number;
    totalSupply?: number;
}

export interface SolScanAccountInfo {
    lamports: number;
    ownerProgram: string;
    type: string;
    rentEpoch: number;
    executable: boolean;
    account: string;
    tokenInfo?: SolScanTokenInfo;
}

export interface SolScanTokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    tokenAuthority: string;
    supply: string;
    type: string;
}