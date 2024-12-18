import { css } from "@emotion/react";
import { Skeleton, TextField, Autocomplete } from "@mui/material";
import { StockData } from "@src/store/types";

export default function AutoComplete(props: {
  height: number;
  kospi200: StockData[];
  onSelected: (v: string) => void;
}) {
  return (
    <>
      {props.kospi200.length > 0 ? (
        <div
          css={css`
            min-width: 260px;
            max-width: 500px;
            width: calc(100% - 20px);
          `}
        >
          <Autocomplete
            disablePortal
            css={css`
              height: ${props.height}px;
              .MuiOutlinedInput-root {
                border: 1px solid;
                border-radius: 10px;
                height: ${props.height}px;
              }
              .MuiInputBase-root {
                font-size: ${props.height / 3}px;
              }
            `}
            options={props.kospi200.map((stock) => {
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
                  font-size: ${props.height}px;
                  background-color: var(--paper);
                `}
              />
            )}
            onChange={(e, v) => {
              if (v) {
                props.onSelected(v.id);
              }
            }}
          />
        </div>
      ) : (
        <Skeleton
          variant="rectangular"
          css={css`
            min-width: 260px;
            max-width: 500px;
            width: calc(100% - 20px);
            height: ${props.height}px;
            border-radius: 10px;
          `}
        />
      )}
    </>
  );
}
