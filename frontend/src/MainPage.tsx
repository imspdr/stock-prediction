import { css } from "@emotion/react";
import { observer } from "mobx-react";
import AutoComplete from "./components/AutoComplete";
import TimeseriesChart from "./components/TimeseriesChart";
import { useRootStore } from "@src/store/RootStoreProvider";
import NewsAnimation from "./components/NewsAnimation";
import { Skeleton } from "@mui/material";
import timeseries from "@src/store/timeseries.json";
import newss from "@src/store/news.json";

function MainPage() {
  const rootStore = useRootStore();
  const chartHeight = Math.round(((rootStore.height - 48) / 13) * 10);
  const newsHeight = Math.max(24, Math.min(chartHeight / 20, 48));
  const selectedStock = {
    code: "asd",
    timeseriesData: timeseries,
    newsData: newss,
  };

  //const selectedStock = rootStore.cacheData.find((cache) => cache.code === rootStore.selectedCode);
  return (
    <div
      css={css`
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      `}
    >
      <AutoComplete
        height={newsHeight * 2}
        kospi200={rootStore.kospi200}
        onSelected={(id) => {
          if (id) {
            rootStore.selectedCode = id;
            const useCache = rootStore.cacheData.find((stock) => stock.code === id);
            if (useCache) return;
            else {
              rootStore.getNewData(id);
            }
          }
        }}
      />
      {rootStore.selectedCode && selectedStock && (
        <>
          <NewsAnimation newsData={selectedStock.newsData} height={newsHeight} />
          <TimeseriesChart
            givenData={selectedStock.timeseriesData.given.filter((data, index) => {
              return (
                index ===
                selectedStock.timeseriesData.given.findIndex(
                  (innerData) => innerData.ds.trim() === data.ds.trim()
                )
              );
            })}
            predictedData={selectedStock.timeseriesData.predicted}
            height={chartHeight}
            width={rootStore.width - 20}
          />
        </>
      )}
    </div>
  );
}

export default observer(MainPage);
