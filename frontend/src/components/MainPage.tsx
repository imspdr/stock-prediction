import { css } from "@emotion/react";
import { observer } from "mobx-react";
import AutoComplete from "./AutoComplete";
import TimeseriesChart from "./TimeseriesChart";
import { useRootStore } from "@src/store/RootStoreProvider";
import sample from "@src/store/timeseries.json";

function MainPage() {
  const rootStore = useRootStore();
  //const selectedStock = rootStore.cacheData.find((cache) => cache.code === rootStore.selectedCode);
  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
      `}
    >
      <AutoComplete />

      <TimeseriesChart givenData={sample.given} predictedData={sample.predicted} />
    </div>
  );
}

export default observer(MainPage);
