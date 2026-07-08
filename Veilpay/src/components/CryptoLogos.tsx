const BTC_LOGO = '/cryptos/btc.svg';

const OTHER_LOGOS = [
  '/cryptos/xlm.svg',
  '/cryptos/eth.svg',
  '/cryptos/sol.svg',
  '/cryptos/xmr.svg',
  '/cryptos/zec.svg',
  '/cryptos/bnb.svg',
  '/cryptos/ltc.svg',
  '/cryptos/xrp.svg',
];

let currentBatch: string[] = [];

// Fisher-Yates shuffle utility
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getNextCryptoLogo = (): string => {
  if (currentBatch.length === 0) {
    // We need exactly 6 coins for the scene.
    // Guarantee 1 Bitcoin.
    // The remaining 5 are chosen randomly without repetition from the other logos.
    const shuffledOthers = shuffleArray(OTHER_LOGOS);
    const selectedOthers = shuffledOthers.slice(0, 5);
    
    // Combine BTC with the 5 selected logos, then shuffle them so BTC appears in a random spot.
    currentBatch = shuffleArray([BTC_LOGO, ...selectedOthers]);
  }
  
  return currentBatch.pop()!;
};
