import { runInAction, makeAutoObservable } from "mobx";
import { StockData, NewsData, TimeseriesData } from "./types";
import { predictAPI } from "./apis";

export class RootStore {
  selectedCode: string;
  height: number;
  kospi200: StockData[];
  cacheData: {
    code: string;
    timeseriesData: TimeseriesData;
    newsData: NewsData[];
  }[];

  constructor() {
    this.selectedCode = "";
    this.kospi200 = [];
    this.cacheData = [];
    this.height = 800;
    makeAutoObservable(this);
  }
  setHeight = (height: number) => {
    runInAction(() => {
      this.height = height;
    });
  };
  setKospi200 = async () => {
    const ret = await predictAPI.getKospi200();
    runInAction(() => {
      this.kospi200 = ret;
    });
  };
  getNewData = async (code: string) => {
    const ret = await predictAPI.getTimeseriesData(code, 50, 100);
    const stock = this.kospi200.find((stock) => stock.code === code);
    let newss: NewsData[] = [];
    if (stock) {
      newss = await predictAPI.getNews(stock.name);
    }
    runInAction(() => {
      this.cacheData = [
        ...this.cacheData,
        {
          code: code,
          timeseriesData: ret,
          newsData: newss,
        },
      ];
    });
  };
}
