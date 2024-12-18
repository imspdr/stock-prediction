import { runInAction, makeAutoObservable } from "mobx";
import { StockData, NewsData, TimeseriesData } from "./types";
import { predictAPI } from "./apis";

export class RootStore {
  selectedCode: string;
  height: number;
  width: number;
  kospi200: StockData[];
  cacheData: {
    code: string;
    timeseriesData: TimeseriesData;
    newsData: NewsData[];
  }[];

  constructor() {
    this.selectedCode = "a";
    this.kospi200 = [];
    this.cacheData = [];
    this.width = 800;
    this.height = 800;
    makeAutoObservable(this);
  }
  setHeight = (height: number) => {
    runInAction(() => {
      this.height = height;
    });
  };
  setWidth = (width: number) => {
    runInAction(() => {
      this.width = width;
    });
  };
  setKospi200 = async () => {
    // const ret = await predictAPI.getKospi200();
    // runInAction(() => {
    //   this.kospi200 = ret;
    // });
  };
  getNewData = async (code: string) => {
    const stock = this.kospi200.find((stock) => stock.code === code);

    if (!stock) {
      return;
    }

    const newss = await predictAPI.getNews(stock.name);
    runInAction(() => {
      this.cacheData = [
        ...this.cacheData,
        {
          code: code,
          timeseriesData: {
            given: [],
            predicted: [],
          },
          newsData: newss,
        },
      ];
    });

    const ret = await predictAPI.getTimeseriesData(code, 40, 100);
    runInAction(() => {
      this.cacheData = this.cacheData.map((data) => {
        if (data.code === code) {
          return {
            code: code,
            timeseriesData: ret,
            newsData: newss,
          };
        } else {
          return data;
        }
      });
    });
  };
}
