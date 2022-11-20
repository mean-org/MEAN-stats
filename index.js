const fileName = 'mean-stats.json';
const fs = require('fs');
let { tvl } = require(`./${fileName}`);
const { version } = require('./package.json');
const { LockedTokens } = require('./lib/locked.tokens');
const { MEAN_PUBKEY, getCoinGeckoPrices, MEAN_INFO, getTotalTvl, sleep } = require('./lib/utils/common');

(async () => {
    if (!process.env.INTERNAL_API_URL) {
        console.log('INTERNAL_API_URL is needed.');
        return 1;
    }
    const twoSeconds = 2 * 1000;
    const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    const coinGeckoPrices = await getCoinGeckoPrices({ 'meanfi': MEAN_PUBKEY.toString() });

    let totalLocked = 0;
    let unreleasedTokens = 0;
    const locked = new LockedTokens(MEAN_PUBKEY, rpcUrl);

    let totalHolders = 0;
    try {
        totalHolders = await locked.getTotalTokenHolders(MEAN_PUBKEY.toString());
        console.log('totalHolders:', totalHolders);
    } catch (error) {
        console.log(error);
    }
    finally {
        await sleep(twoSeconds);
    }

    try {
        const lockedTokens = await locked.getLockedTokensAmount();
        console.log('lockedTokens:', lockedTokens);
        totalLocked += lockedTokens;
    } catch (error) {
        console.error(error);
    }

    try {
        const unreleasedAmount = await locked.getUnreleasedTokensAmount();
        console.log('unreleasedAmount:', unreleasedAmount);
        unreleasedTokens = unreleasedAmount;
    } catch (error) {
        console.error(error);
    }

    try {
        const tvlInfo = await getTotalTvl();
        if (tvlInfo) {
            tvl = tvlInfo;
        }
    } catch (error) {
        console.log('Error: getTotalTvl() ->', error);
    }

    const circulatingSupply = Number((MEAN_INFO.totalSupply - unreleasedTokens - totalLocked).toFixed(6));
    const result = {
        ...MEAN_INFO,
        circulatingSupply,
        holders: totalHolders > 0 ? totalHolders : undefined,
        marketCap: (coinGeckoPrices[MEAN_PUBKEY.toString()] * circulatingSupply),
        marketCapFD: (coinGeckoPrices[MEAN_PUBKEY.toString()] * MEAN_INFO.totalSupply),
        tvl,
        lastUpdateUtc: new Date().toISOString(),
        version
    };

    console.log(result);
    fs.writeFileSync(`./${fileName}`, JSON.stringify(result, null, 2), { encoding: 'utf8' });
})();