import { runInAction, makeAutoObservable } from "mobx";
import { StockData, NewsData, TimeseriesData } from "./types";
import { predictAPI } from "./apis";

export class RootStore {
  selectedCode: string;
  kospi200: StockData[];
  cacheData: {
    code: string;
    timeseriesData: TimeseriesData[];
    newsData: NewsData[];
  }[];

  constructor() {
    this.selectedCode = "000000";
    this.kospi200 = [];
    this.cacheData = [];
    makeAutoObservable(this);
  }
  setKospi200 = async () => {
    const ret = await predictAPI.getKospi200();
    runInAction(() => {
      this.kospi200 = ret;
    });
  };
  getNewData = async (code: string) => {};
}
