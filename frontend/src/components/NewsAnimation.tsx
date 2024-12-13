import { css, keyframes } from "@emotion/react";
import { observer } from "mobx-react";
import { NewsData } from "@src/store/types";
import { Typography } from "@mui/material";
import { useState, useEffect } from "react";

function NewsAnimation(props: { newsData: NewsData[] }) {
  const [hover, setHover] = useState(false);
  const [nowIndex, setNowIndex] = useState(0);
  const divideLength = props.newsData.length;
  useEffect(() => {
    const inter = setInterval(() => {
      setNowIndex((v) => v + 1);
    }, 2000);
    return () => {
      clearInterval(inter);
    };
  }, []);
  return (
    <div
      css={css`
        position: relative;
        max-width: 958px;
        min-width: 238px;
        height: 52px;
        border-radius: 10px;
        background-color: var(--paper);
        border: 1px solid;
        padding: 0px 20px;
        width: calc(100% - 42px);
        ${!hover && "overflow: hidden;"}
      `}
    >
      {props.newsData.map((news, i) => {
        return (
          <Typography
            onClick={() => {
              window.open(news.link, "_blank", "noopener,noreferrer");
            }}
            css={css`
              white-space: nowrap;
              overflow: hidden;
              textp-overflow: ellipsis;
              position: absolute;
              top: ${10 +
              (nowIndex % divideLength === i
                ? 0
                : nowIndex % divideLength === (i + 1) % divideLength
                ? -1
                : 1) *
                50}px;
              animation: ${keyframes`
                from {
                  top: ${
                    10 +
                    (nowIndex % divideLength === i
                      ? 1
                      : nowIndex % divideLength === (i + 1) % divideLength
                      ? 0
                      : -1) *
                      50
                  }px;
                }
                to {
                  top: ${
                    10 +
                    (nowIndex % divideLength === i
                      ? 0
                      : nowIndex % divideLength === (i + 1) % divideLength
                      ? -1
                      : 1) *
                      50
                  }px;
                }`} 1s;
              opacity: ${i == nowIndex % divideLength || i == (nowIndex - 1) % divideLength
                ? 1
                : 0};
            `}
            variant="h6"
          >
            {news.title}
          </Typography>
        );
      })}
    </div>
  );
}

export default observer(NewsAnimation);
