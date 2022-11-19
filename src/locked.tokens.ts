import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { clusterApiUrl, Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import {
    normalizeTokenAmount,
    INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY,
    UNRELEASED_TOKENS_ACCOUNT_PUBKEY
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

    async getLockedTokensAmount(): Promise<number> {
        let balance = 0;

        try {
            const accountInfo = await this.connection.getParsedAccountInfo(INVESTORS_TOKEN_LOCKS_ACCOUNT_PUBKEY);
            const { mint, tokenAmount: { amount, decimals } } = (accountInfo.value?.data as ParsedAccountData).parsed.info;
            if (this.tokenAddress.equals(new PublicKey(mint))) {
                const amountNormalized = normalizeTokenAmount(amount, decimals);
                balance += amountNormalized;
            }
        } catch (error) {
            if (this.verbose) console.error('getLockedTokensAmount:ERROR:', error);
        }

        return balance;
    }

    async getUnreleasedTokensAmount(): Promise<number> {
        let balance = 0;

        try {
            const accountInfo = await this.connection.getParsedAccountInfo(UNRELEASED_TOKENS_ACCOUNT_PUBKEY);
            const { mint, tokenAmount: { amount, decimals } } = (accountInfo.value?.data as ParsedAccountData).parsed.info;
            if (this.tokenAddress.equals(new PublicKey(mint))) {
                const amountNormalized = normalizeTokenAmount(amount, decimals);
                balance += amountNormalized;
            }
        } catch (error) {
            if (this.verbose) console.error('getUnreleasedTokensAmount:ERROR:', error);
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