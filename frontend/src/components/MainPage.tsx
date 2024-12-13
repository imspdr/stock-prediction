import { css } from "@emotion/react";
import { observer } from "mobx-react";
import AutoComplete from "./AutoComplete";
import TimeseriesChart from "./TimeseriesChart";
import { useRootStore } from "@src/store/RootStoreProvider";
import NewsAnimation from "./NewsAnimation";
import { Skeleton } from "@mui/material";

function MainPage() {
  const rootStore = useRootStore();
  const selectedStock = rootStore.cacheData.find((cache) => cache.code === rootStore.selectedCode);
  return (
    <div
      css={css`
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      `}
    >
      {rootStore.kospi200.length > 0 ? (
        <AutoComplete />
      ) : (
        <Skeleton
          variant="rectangular"
          css={css`
            width: 80%;
            max-width: 500px;
            min-width: 280px;
            height: 58px;
            border-radius: 10px;
          `}
        />
      )}
      {selectedStock ? (
        <>
          <NewsAnimation newsData={selectedStock.newsData} />
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
          />
        </>
      ) : rootStore.selectedCode ? (
        <>
          <Skeleton
            variant="rectangular"
            css={css`
              width: calc(100%);
              height: 52px;
              max-width: 1000px;
              min-width: 280px;
              border-radius: 10px;
            `}
          />
          <Skeleton
            variant="rectangular"
            css={css`
              width: calc(100%);
              height: 300px;
              max-width: 1000px;
              min-width: 280px;
              border-radius: 10px;
            `}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default observer(MainPage);
