import fetch from 'cross-fetch';

export class JupPriceApi {
    private baseUrl = 'https://price.jup.ag/v1';
    private apiHeaders = { "Accept": "application/json", "User-Agent": "MeanFi" };

    /**
     * Gets price of the token from Jupiter Price API (docs.jup.ag/jupiter-api/price-api-for-solana-beta).
     * @param tokenAddress token address or symbol
     * @returns 
     */
    async getTokenPrice(tokenAddress: string): Promise<JupPrice | null> {
        try {
            const response = await fetch(`${this.baseUrl}/price?id=${tokenAddress}`, {
                method: 'GET',
                headers: {
                    ...this.apiHeaders
                }
            });
            const result = await response.json();

            return result.data;
        } catch (error) {
            console.error(`getTokenPrice(address:${tokenAddress})`, error);
            return null;
        }
    }
}

export interface JupPrice {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
}