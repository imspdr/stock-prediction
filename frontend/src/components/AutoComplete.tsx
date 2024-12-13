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
        max-width: 500px;
        min-width: 280px;
        width: 80%;
      `}
    >
      <Autocomplete
        disablePortal
        css={css`
          .MuiOutlinedInput-root {
            border: 1px solid;
            border-radius: 10px;
          }
        `}
        options={rootStore.kospi200.map((stock) => {
          return {
            label: stock.name,
            id: stock.code,
          };
        })}
        isOptionEqualToValue={(option, value) => {
          return option.id === value.id;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="종목"
            css={css`
              background-color: var(--paper);
            `}
          />
        )}
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
