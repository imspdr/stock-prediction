import { css } from "@emotion/react";
import { observer } from "mobx-react";
import AutoComplete from "./components/AutoComplete";
import TimeseriesChart from "./components/TimeseriesChart";
import { useRootStore } from "@src/store/RootStoreProvider";
import NewsAnimation from "./components/NewsAnimation";

function MainPage() {
  const rootStore = useRootStore();
  const chartHeight = Math.round(((rootStore.height - 48) / 13) * 10);
  const newsHeight = Math.max(24, Math.min(chartHeight / 20, 48));
  // const selectedStock = {
  //   code: "asd",
  //   timeseriesData: timeseries,
  //   newsData: newss,
  // };

  const selectedStock = rootStore.kospi200.find((item) => item.code === rootStore.selectedCode);
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
          }
        }}
      />
      {rootStore.selectedCode && selectedStock && (
        <>
          <NewsAnimation newsData={selectedStock.news} height={newsHeight} />
          <TimeseriesChart
            givenData={selectedStock.given.filter((data, index) => {
              return (
                index ===
                selectedStock.given.findIndex((innerData) => innerData.ds.trim() === data.ds.trim())
              );
            })}
            predictedData={selectedStock.result}
            height={chartHeight}
            width={rootStore.width - 20}
          />
        </>
      )}
    </div>
  );
}

export default observer(MainPage);
