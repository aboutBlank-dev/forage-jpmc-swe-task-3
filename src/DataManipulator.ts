import { ServerRespond } from "./DataStreamer";

export interface Row {
  price_abc: number;
  price_def: number;
  ratio: number;
  timestamp: Date;
  upper_bound: number;
  lower_bound: number;
  trigger_alert: number | undefined;
}

const LOWER_BOUND = 0.95; // -5%
const UPPER_BOUND = 1.05; // +5%

export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    if (serverResponds.length < 2) return {} as Row;

    //I will assume that index 0 always corresponds to the stock ABC and index 1 to stock DEF (For the purpose of this exercise)
    const stockABC = serverResponds[0];
    const stockDEF = serverResponds[1];

    const priceABC = (stockABC.top_ask.price + stockABC.top_bid.price) / 2;
    const priceDEF = (stockDEF.top_ask.price + stockDEF.top_bid.price) / 2;
    const ratio = priceDEF == 0 ? 0 : priceABC / priceDEF; //Avoid division by zero

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      //We want to use the most recent timestamp
      timestamp:
        stockABC.timestamp > stockDEF.timestamp
          ? stockABC.timestamp
          : stockDEF.timestamp,
      upper_bound: UPPER_BOUND,
      lower_bound: LOWER_BOUND,
      trigger_alert:
        ratio > UPPER_BOUND || ratio < LOWER_BOUND ? ratio : undefined, //Trigger alert if ratio is above/below the upper/lower bound
    };
  }
}
