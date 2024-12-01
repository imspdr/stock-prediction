import { css } from "@emotion/react";
import { Circle } from "@mui/icons-material";
import { GivenData, PredictedData } from "@src/store/types";
import { useState, useEffect } from "react";

export default function TimeseriesChart(props: {
  givenData: GivenData[];
  predictedData: PredictedData[];
}) {
  const [divided, setDivided] = useState(false);

  const width = 1600;
  const height = 1000;
  const padding = 100;

  const predictedColor = "var(--highlight)";
  const givenColor = "blue";

  const givenData = props.predictedData.filter((data) => data.predicted == 0);
  const predictedData = props.predictedData.filter((data) => data.predicted == 1);

  const length = props.predictedData.length;
  const maxY = Math.max(
    ...props.predictedData.map((d) => d.yhat_upper),
    ...props.givenData.map((d) => d.y)
  );
  const minY = Math.min(
    ...props.predictedData.map((d) => d.yhat_lower),
    ...props.givenData.map((d) => d.y)
  );
  const maxTrend = Math.max(
    ...props.predictedData.map((d) => d.trend_upper),
    ...props.givenData.map((d) => d.y)
  );
  const minTrend = Math.min(
    ...props.predictedData.map((d) => d.trend_lower),
    ...props.givenData.map((d) => d.y)
  );
  const maxAbsAdditive = Math.max(...props.predictedData.map((d) => d.additive_terms));

  const xScale = (x: number) => (x / (length - 1)) * (width - 2 * padding) + padding;
  const yScale = (y: number) =>
    height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding);

  const trendScale = (y: number) =>
    height / 2 -
    padding / 2 -
    (((y - minTrend) / (maxTrend - minTrend)) * (height - 3 * padding)) / 2;
  const additiveScale = (y: number) =>
    height - padding - ((y / maxAbsAdditive + 1) * (height - 3 * padding)) / 4;

  const xAxis = [padding, height - padding, height / 2 - padding / 2, height / 2 + padding / 2];
  const yAxis = [padding, width - padding];

  const datas = [
    {
      name: "given",
      data: givenData,
      start: 0,
      color: givenColor,
    },
    {
      name: "predicted",
      data: predictedData,
      start: givenData.length,
      color: predictedColor,
    },
  ];
  return (
    <div
      css={css`
        width: 90%;
        max-width: 800px;
        aspect-ratio: 1.6 / 1;
        background-color: var(--paper);
        .data-transition {
          transition: 1s ease-in;
        }
      `}
      onClick={() => setDivided((v) => !v)}
    >
      <svg viewBox="0 0 1600 1000">
        {/* {xAxis.map((y) => (
          <path d={`M ${yAxis[0]} ${y} L ${yAxis[1]} ${y}`} stroke="var(--foreground)" />
        ))} */}
        {/* givenData dots */}
        {props.givenData.map((data: GivenData, i: number) => {
          return (
            <circle
              className="data-transition"
              cx={xScale(i)}
              cy={divided ? trendScale(data.y) : yScale(data.y)}
              r={2}
              fill={"var(--foreground)"}
            />
          );
        })}
        {/* main line  */}
        {datas.map((dataType) => {
          return (
            <>
              {divided ? (
                <path
                  className="data-transition"
                  d={`${dataType.data
                    .map((d) =>
                      d.index === dataType.start
                        ? `M ${xScale(d.index)} ${trendScale(d.trend_upper)}`
                        : `L ${xScale(d.index)} ${trendScale(d.trend_upper)}`
                    )
                    .join(" ")} ${dataType.data
                    .slice()
                    .reverse()
                    .map(
                      (d) => `L ${xScale(d.index)} ${trendScale(d.trend_lower)}
                  `
                    )}
                  Z
                `}
                  fill={dataType.color}
                  opacity="0.3"
                />
              ) : (
                <path
                  className="data-transition"
                  d={`${dataType.data
                    .map((d) =>
                      d.index === dataType.start
                        ? `M ${xScale(d.index)} ${yScale(d.yhat_upper)}`
                        : `L ${xScale(d.index)} ${yScale(d.yhat_upper)}`
                    )
                    .join(" ")} ${dataType.data
                    .slice()
                    .reverse()
                    .map(
                      (d) => `L ${xScale(d.index)} ${yScale(d.yhat_lower)}
                  `
                    )}
                  Z
                `}
                  fill={dataType.color}
                  opacity="0.3"
                />
              )}

              <path
                className="data-transition"
                d={
                  divided
                    ? dataType.data
                        .map((d) =>
                          d.index === dataType.start
                            ? `M ${xScale(d.index)} ${trendScale(d.trend)}`
                            : `L ${xScale(d.index)} ${trendScale(d.trend)}`
                        )
                        .join(" ")
                    : dataType.data
                        .map((d) =>
                          d.index === dataType.start
                            ? `M ${xScale(d.index)} ${yScale(d.yhat)}`
                            : `L ${xScale(d.index)} ${yScale(d.yhat)}`
                        )
                        .join(" ")
                }
                fill="none"
                stroke={dataType.color}
                strokeWidth="3"
              />
              <path
                className="data-transition"
                d={
                  divided
                    ? dataType.data
                        .map((d) =>
                          d.index === dataType.start
                            ? `M ${xScale(d.index)} ${additiveScale(d.additive_terms)}`
                            : `L ${xScale(d.index)} ${additiveScale(d.additive_terms)}`
                        )
                        .join(" ")
                    : dataType.data
                        .map((d) =>
                          d.index === dataType.start
                            ? `M ${xScale(d.index)} ${yScale(d.yhat)}`
                            : `L ${xScale(d.index)} ${yScale(d.yhat)}`
                        )
                        .join(" ")
                }
                fill="none"
                stroke={dataType.color}
                strokeWidth="3"
              />
            </>
          );
        })}
      </svg>
    </div>
  );
}
