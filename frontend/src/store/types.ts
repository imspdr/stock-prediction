export type StockData = {
  code: string;
  name: string;
};

export type NewsData = {
  title: string;
  link: string;
};

export type GivenData = {
  ds: string;
  y: number;
};
export type PredictedData = {
  index: number;
  predicted: number;
  ds: string;
  trend: number;
  trend_lower: number;
  trend_upper: number;
  yhat_lower: number;
  yhat_upper: number;
  additive_terms: number;
  yhat: number;
};

export type TimeseriesData = {
  given: GivenData[];
  predicted: PredictedData[];
};
