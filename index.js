const fs = require('fs');
let { tvl } = require('./meanfi-stats.json');
const { version } = require('./package.json');
const { LockedTokens } = require('./lib/locked.tokens');
const { MEAN_PUBKEY, getCoinGeckoPrices, MEAN_INFO, getTotalTvl } = require('./lib/utils/common');

(async () => {
    if (!process.env.INTERNAL_API_URL) {
        console.log('INTERNAL_API_URL is needed.');
        return 1;
    }

    const coinGeckoPrices = await getCoinGeckoPrices({ 'meanfi': MEAN_PUBKEY.toString() });

    let totalLocked = 0;
    const locked = new LockedTokens(MEAN_PUBKEY);
    try {
        const stakedMeans = await locked.getStakedMeanTokens();
        console.log('stakedMeans:', stakedMeans);
        totalLocked += stakedMeans;
    } catch (error) {
        console.error(error);
    }
    try {
        const streams = await locked.getLockedStreams();
        console.log('streams:', streams);
        totalLocked += streams;
    } catch (error) {
        console.error(error);
    }
    try {
        const tokenAccounts = await locked.getTokensAccountsBalance();
        console.log('tokenAccounts:', tokenAccounts);
        totalLocked += tokenAccounts;
    } catch (error) {
        console.error(error);
    }

    try {
        const tvlInfo = await getTotalTvl();
        if (tvlInfo) {
            tvl = tvlInfo;
        }
    } catch {
        console.log('Error: getTotalTvl()');
    }

    const circulatingSupply = Number((MEAN_INFO.totalSupply - totalLocked).toFixed(6));
    const result = {
        ...MEAN_INFO,
        circulatingSupply,
        marketCap: (coinGeckoPrices[MEAN_PUBKEY.toString()] * circulatingSupply),
        marketCapFD: (coinGeckoPrices[MEAN_PUBKEY.toString()] * MEAN_INFO.totalSupply),
        tvl,
        lastUpdateUtc: new Date().toISOString(),
        version
    };

    console.log(result);
    fs.writeFileSync('./meanfi-stats.json', JSON.stringify(result, null, 2), { encoding: 'utf8' });
})();