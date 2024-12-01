import { css } from "@emotion/react";
import { observer } from "mobx-react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useRootStore } from "@src/store/RootStoreProvider";

function AutoComplete() {
  const rootStore = useRootStore();
  return (
    <div
      css={css`
        padding: 10px;
      `}
    >
      <Autocomplete
        disablePortal
        options={rootStore.kospi200.map((stock) => {
          return {
            label: stock.name,
            id: stock.code,
          };
        })}
        isOptionEqualToValue={(option, value) => {
          return option.id === value.id;
        }}
        css={css`
          width: 300px;
        `}
        renderInput={(params) => <TextField {...params} label="종목" />}
        onChange={(e, v) => {
          if (v && v.id) {
            rootStore.selectedCode = v.id;
            const useCache = rootStore.cacheData.find((stock) => stock.code === v.id);
            if (useCache) return;
            else {
              rootStore.getNewData(v.id);
            }
          }
        }}
      />
    </div>
  );
}

export default observer(AutoComplete);
