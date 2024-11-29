import { observer } from "mobx-react";
import TextField from "@mui/material/TextField";
import { useRootStore } from "@src/store/RootStoreProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Suspense, useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { css } from "@emotion/react";
import { unselectable } from "@src/util";
import Autocomplete from "@mui/material/Autocomplete";
import ThemeToggle from "@src/components/ThemeToggle";

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const navigate = useNavigate();
  const rootStore = useRootStore();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    rootStore.setKospi200();
  }, []);

  const toggleTheme = () => {
    const styles = getComputedStyle(document.body);

    //light
    const black = styles.getPropertyValue("--black");
    const white = styles.getPropertyValue("--white");
    const light = styles.getPropertyValue("--light");
    const mint = styles.getPropertyValue("--mint");
    const pink = styles.getPropertyValue("--pink");
    const scrollColorBlack = styles.getPropertyValue("--scroll-color-black");

    //dark
    const darkBlack = styles.getPropertyValue("--dark-black");
    const darkWhite = styles.getPropertyValue("--dark-white");
    const darkMint = styles.getPropertyValue("--dark-mint");
    const darkPink = styles.getPropertyValue("--dark-pink");
    const scrollColorWhite = styles.getPropertyValue("--scroll-color-white");

    const docEl = document.documentElement;
    if (darkMode) {
      docEl.style.setProperty("--background", light);
      docEl.style.setProperty("--foreground", black);
      docEl.style.setProperty("--scroll-color", scrollColorBlack);
      docEl.style.setProperty("--highlight", mint);
      docEl.style.setProperty("--paper", white);
      docEl.style.setProperty("--warning", pink);
    } else {
      docEl.style.setProperty("--background", darkBlack);
      docEl.style.setProperty("--foreground", darkWhite);
      docEl.style.setProperty("--scroll-color", scrollColorWhite);
      docEl.style.setProperty("--highlight", darkMint);
      docEl.style.setProperty("--paper", black);
      docEl.style.setProperty("--warning", darkPink);
    }
    setDarkMode((v) => !v);
  };
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <>
        <div
          css={css`
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            height: 48px;

            min-width: 300px;
            padding-left: 10px;
            ${unselectable}
          `}
        >
          <Typography onClick={() => navigate("/")}>{"IMSPDR / cotevis"}</Typography>
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
            sx={{ width: 300, height: 60 }}
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
          <ThemeToggle onClick={toggleTheme} isDark={darkMode} />
        </div>
        <div
          css={css`
            position: absolute;
            top: 48px;
            width: 100%;
            height: calc(100vh - 48px);
            ${unselectable}
          `}
        ></div>
      </>
    </ThemeProvider>
  );
}

export default observer(App);
