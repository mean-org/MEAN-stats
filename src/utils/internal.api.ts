import fetch from 'cross-fetch';

export class InternalApi {
    private baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    private apiHeaders = { "Accept": "application/json", "User-Agent": "MeanFi" };

    async getTokenPrice(tokenAddress: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/?tokenAddress=${tokenAddress}`, {
                method: 'GET',
                headers: {
                    ...this.apiHeaders
                }
            });
            return response.json();
        } catch (error) {
            return null;
        }
    }
}