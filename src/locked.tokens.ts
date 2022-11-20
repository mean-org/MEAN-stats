import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { AccountInfo, clusterApiUrl, Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import {
    INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY,
    UNRELEASED_TOKENS_ACCOUNT_PUBKEY,
    findATokenAddress,
    getTokenAccountBalanceByAddress,
    normalizeTokenAmount
} from "./utils";

export class LockedTokens {
    private rpcUrl: string;
    private verbose: boolean;
    private connection: Connection;
    private tokenAddress: PublicKey;

    constructor(tokenAddress: string | PublicKey, rpcUrl?: string, verbose: boolean = false) {
        this.tokenAddress = typeof tokenAddress === 'string' ? new PublicKey(tokenAddress) : tokenAddress;
        this.rpcUrl = rpcUrl || clusterApiUrl('mainnet-beta');
        this.connection = new Connection(this.rpcUrl);
        this.verbose = verbose;
    }

    async getCurrentTokenSupply(): Promise<number> {
        let accInfo: AccountInfo<Buffer | ParsedAccountData> | null = null;

        console.log('Fetching current token supply...');
        try {
            accInfo = (
                await this.connection.getParsedAccountInfo(this.tokenAddress)
            ).value;
        } catch (error) {
            console.error('getCurrentTokenSupply:ERROR:', error);
        }
        if (accInfo) {
            const data = (accInfo as AccountInfo<ParsedAccountData>).data;
            if (data.parsed) {
                return normalizeTokenAmount(data.parsed.info.supply, data.parsed.info.decimals);
            }
        }
        return 0;
    }

    async getLockedTokensAmount(): Promise<number> {
        let balance = 0;

        console.log('Fetching locked tokens amount...');
        try {
            const meanTokenAddress = await findATokenAddress(INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY, this.tokenAddress);
            const result = await getTokenAccountBalanceByAddress(
                this.connection,
                meanTokenAddress,
            );
            if (result) {
                balance = result.uiAmount || 0;
            }
            return balance;
        } catch (error) {
            if (this.verbose) {
                console.error('getLockedTokensAmount:ERROR:', error);
            }
            return balance;
        }
    }

    async getUnreleasedTokensAmount(): Promise<number> {
        let balance = 0;

        console.log('Fetching unreleased tokens amount...');
        try {
            const meanTokenAddress = await findATokenAddress(UNRELEASED_TOKENS_ACCOUNT_PUBKEY, this.tokenAddress);
            const result = await getTokenAccountBalanceByAddress(
                this.connection,
                meanTokenAddress,
            );
            if (result) {
                balance = result.uiAmount || 0;
            }
            return balance;
        } catch (error) {
            if (this.verbose) {
                console.error('getUnreleasedTokensAmount:ERROR:', error);
            }
            return balance;
        }
    }

    async getTotalTokenHolders(tokenAddress: string): Promise<number> {
        console.log('Fetching token holders...');
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
