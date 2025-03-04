import { css, keyframes } from "@emotion/react";
import { observer } from "mobx-react";
import { NewsData } from "@src/store/types";
import { Typography, Skeleton } from "@mui/material";
import { useState, useEffect } from "react";

function NewsAnimation(props: { newsData: NewsData[]; height: number }) {
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
    <>
      {props.newsData.length > 0 ? (
        <div
          css={css`
            position: relative;
            border-radius: 10px;
            background-color: var(--background);
            padding: 0px 20px;
            min-width: 240px;
            max-width: 1000px;
            width: calc(100% - 40px);
            height: ${props.height}px;
            overflow: hidden;
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
                  width: calc(100% - 40px);
                  textp-overflow: ellipsis;
                  position: absolute;
                  font-size: ${props.height / 2}px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  top: ${(nowIndex % divideLength === i
                    ? 0
                    : nowIndex % divideLength === (i + 1) % divideLength
                    ? -1
                    : 1) *
                    props.height +
                  5}px;
                  animation: ${keyframes`
              from {
                top: ${
                  (nowIndex % divideLength === i
                    ? 1
                    : nowIndex % divideLength === (i + 1) % divideLength
                    ? 0
                    : -1) *
                    props.height +
                  5
                }px;
              }
              to {
                top: ${
                  (nowIndex % divideLength === i
                    ? 0
                    : nowIndex % divideLength === (i + 1) % divideLength
                    ? -1
                    : 1) *
                    props.height +
                  5
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
      ) : (
        <Skeleton
          variant="rectangular"
          css={css`
            min-width: 280px;
            max-width: 1000px;
            width: calc(100% - 10px);
            height: ${props.height}px;
            border-radius: 10px;
          `}
        />
      )}
    </>
  );
}

export default observer(NewsAnimation);
