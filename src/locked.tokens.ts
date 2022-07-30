import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { clusterApiUrl, Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { normalizeTokenAmount, SMEAN_PUBKEY, InternalApi, SolscanApi, MEAN_PUBKEY } from "./utils";

export class LockedTokens {
    private rpcUrl: string;
    private verbose: boolean;
    private connection: Connection;
    private tokenAddress: PublicKey;
    private internalApi: InternalApi;
    private solscanApi: SolscanApi;
    private tokenAccounts: PublicKey[];

    constructor(tokenAddress: string | PublicKey, rpcUrl?: string, verbose: boolean = false) {
        this.tokenAddress = typeof tokenAddress === 'string' ? new PublicKey(tokenAddress) : tokenAddress;
        this.rpcUrl = rpcUrl || clusterApiUrl('mainnet-beta');
        this.connection = new Connection(this.rpcUrl);
        this.internalApi = new InternalApi();
        this.solscanApi = new SolscanApi();
        this.verbose = verbose;

        const tokenAccountList: string[] = (JSON.parse(process.env.TOKEN_ACCOUNTS_LIST || '[]')) as string[];
        this.tokenAccounts = tokenAccountList.map(x => new PublicKey(x));
    }

    /**
     * 
     * @returns Amount of tokens locked
     */
    async getLockedTokenNumber(): Promise<number> {
        let total = 0;
        // 1. staked means
        const stakedMeans = await this.getStakedMeanTokens();
        total += stakedMeans;

        // 2. TokenAccounts mean
        const tokenAccountsBalance = await this.getTokensAccountsBalance();
        total += tokenAccountsBalance;

        // 3. locked streams
        const lockedStreams = await this.getLockedStreams();
        total += lockedStreams;

        return total;
    }

    async getStakedMeanTokens(): Promise<number> {
        let balance = 0;
        try {
            const sMeanPrice = await this.internalApi.getTokenPrice(SMEAN_PUBKEY.toString());
            if (this.verbose) console.log('sMeanPrice:', sMeanPrice);
            if (sMeanPrice) {
                const meanPrice = await this.solscanApi.getTokenPrice(MEAN_PUBKEY.toString());
                if (this.verbose) console.log('meanPrice:', meanPrice);
                if (meanPrice) {
                    balance = Number(sMeanPrice.marketCapFD) / meanPrice.priceUsdt;
                }
            }
        } catch (error) {
            if (this.verbose) console.error('getStakedMeanTokens:ERROR:', error);
        }
        return balance;
    }

    async getTokensAccountsBalance(): Promise<number> {
        let balance = 0;
        try {
            for (const token of this.tokenAccounts) {
                const accountInfo = await this.connection.getParsedAccountInfo(token);
                const { mint, tokenAmount: { amount, decimals } } = (accountInfo.value?.data as ParsedAccountData).parsed.info;
                if (this.tokenAddress.equals(new PublicKey(mint))) {
                    const amountNormalized = normalizeTokenAmount(amount, decimals);
                    balance += amountNormalized;
                }
            }
        } catch (error) {
            if (this.verbose) console.error('getTokensAccountsBalance:ERROR:', error);
        }
        return balance;
    }

    async getLockedStreams(): Promise<number> {
        let balance = 0;
        try {
            const invLocked = Number(process.env.INV_LOCKED || '0');
            balance += invLocked;

            // const msp = new Program(IDL, MSP_ID);
            // const filters = [{ dataSize: 500, memcmp: { bytes: '1', offset: 1 }, } as GetProgramAccountsFilter];
            // const streams = await msp.account.stream.all(filters);
        } catch (error) {

        }
        return balance;
    }

    async getTotalTokenHolders(tokenAddress: string): Promise<number> {
        const accountInfos = await this.connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
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
            .filter(i => (i.account.data as ParsedAccountData).parsed.info.tokenAmount.uiAmount > 0);

        return results.length;
    }
}