// Function to calculate VWAP
const calculateVWAP = async (historicalData) => {
    return new Promise((resolve, reject) => {
        try {
            // Calculate VWAP
            let totalTypicalPriceVolume = 0;
            let totalVolume = 0;
            // 0 => timestamp ,1 => open, 2 =>high , 3 => low, 4 => close , 5=> volume
            for(let candle in historicalData) {
                candle = historicalData[candle];
                const typicalPrice = (Number(candle?.[2]) + Number(candle?.[3]) + Number(candle?.[4])) / 3;
                totalTypicalPriceVolume += Number(Number(typicalPrice) * Number(candle?.[5]));
                totalVolume += Number(candle?.[5]);
            };
            const vwap = totalTypicalPriceVolume / ((totalVolume > 0) ? totalVolume : 1);
            // console.log(`VWAP: ${vwap}`);
            resolve(vwap);
        } catch (error) {
            console.error("Error:", error);
            reject(error);
        }
    });
}


// Function to calculate EMA12
const calculateEMA12 = async (historicalData) => {
    return new Promise((resolve, reject) => {
        try {
            const closePrices = historicalData.map((candle) => Number(candle?.[4]));
            const ema12 = calculateEMA(closePrices, 12);

            // console.log("EMA12:", ema12);
            resolve(ema12);
        } catch (error) {
            console.error("Error:", error);
            reject(error);
        }
    });
}

// Function to calculate Exponential Moving Average (EMA)
const calculateEMA = (data, period) => {
    return new Promise((resolve, reject) => {
        const multiplier = 2 / (period + 1);

        // Calculate the Simple Moving Average (SMA) for the first data points
        let sma = 0;
        for (let i = 0; i < period; i++) {
            sma += data[i];
        }
        sma /= period;

        // Calculate EMA for the remaining data points
        const emaArray = [sma];
        for (let i = period; i < data.length; i++) {
            const ema = (data[i] - emaArray[i - period]) * multiplier + emaArray[i - period];
            emaArray.push(ema);
        }

        resolve(emaArray);
    });
}


// Function to calculate VOLSMA20
const calculateVOLSMA20 = async (historicalData) => {
    return new Promise((resolve, reject) => {
        try {
            // Calculate VOLSMA20
            const volumeData = historicalData.map((candle) => candle?.[5]);
            const volsma20 = calculateSMA(volumeData, 20);

            // console.log("VOLSMA20:", volsma20);
            resolve(volsma20);
        } catch (error) {
            console.error("Error:", error);
            reject(error);
        }
    });
}

// Function to calculate Simple Moving Average (SMA)
const calculateSMA = (data, period) => {
    return new Promise((resolve, reject) => {
        const smaArray = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
            // Not enough data points for SMA yet
            smaArray.push(null);
            } else {
            // Calculate SMA for the current data point
            const sma = data.slice(i - period + 1, i + 1).reduce((sum, value) => sum + value, 0) / period;
            smaArray.push(sma);
            }
        }
        resolve(smaArray);
    });
}