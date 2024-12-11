import { css } from "@emotion/react";
import { Circle } from "@mui/icons-material";
import { GivenData, PredictedData } from "@src/store/types";
import { useState, useEffect } from "react";

export default function TimeseriesChart(props: {
  givenData: GivenData[];
  predictedData: PredictedData[];
}) {
  const [divided, setDivided] = useState(false);
  const [scale, setScale] = useState(1);

  const [window, setWindow] = useState(0);

  const [transitionOn, setTransitionOn] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [startX, setStartX] = useState(0);

  const width = 1600;
  const height = 1000;
  const padding = 50;
  const scrollWidth = 10;

  const predictedColor = "var(--highlight)";
  const givenColor = "blue";

  const length = props.predictedData.length;
  const scaledLength = props.predictedData.length / scale;

  const selectedGivenData = props.givenData.slice(window, window + scaledLength);
  const selectedPredictedData = props.predictedData.slice(window, window + scaledLength);

  const givenPrediction = selectedPredictedData.filter((data) => data.predicted == 0);
  const predictedData = selectedPredictedData.filter((data) => data.predicted == 1);

  const maxY = Math.max(
    ...selectedPredictedData.map((d) => d.yhat_upper),
    ...selectedGivenData.map((d) => d.upper)
  );
  const minY = Math.min(
    ...selectedPredictedData.map((d) => d.yhat_lower),
    ...selectedGivenData.map((d) => d.lower)
  );
  const maxTrend = Math.max(
    ...selectedPredictedData.map((d) => d.trend_upper),
    ...selectedGivenData.map((d) => d.upper)
  );
  const minTrend = Math.min(
    ...selectedPredictedData.map((d) => d.trend_lower),
    ...selectedGivenData.map((d) => d.lower)
  );
  const maxAbsAdditive = Math.max(...props.predictedData.map((d) => Math.abs(d.additive_terms)));

  const xScale = (x: number) =>
    ((x - window) / (scaledLength - 1)) * (width - 2 * padding) + padding;
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
      data: givenPrediction,
      start: window,
      color: givenColor,
    },
    {
      name: "predicted",
      data: predictedData,
      start: window + givenPrediction.length,
      color: predictedColor,
    },
  ];
  return (
    <>
      <div>
        <div
          onClick={() => {
            setTransitionOn(true);
            setDivided((v) => !v);
          }}
        >
          {" "}
          divide
        </div>

        <div
          onClick={() => {
            setTransitionOn(false);
            setScale((v) => (v > 1 ? v / 2 : 1));
          }}
        >
          {" "}
          -
        </div>
        <div
          onClick={() => {
            setTransitionOn(false);
            setScale((v) => (v > 8 ? 1 : v * 2));
          }}
        >
          {" "}
          +
        </div>
      </div>
      <div
        css={css`
          width: 90%;
          max-width: 800px;
          aspect-ratio: 1.6 / 1;
          background-color: var(--paper);
          cursor: ${scrolling ? "grabbing" : "grab"};
          .data-transition {
            transition: ${transitionOn ? "d 0.3s ease-in" : "0s"};
          }
          .cy-transition {
            transition: ${transitionOn ? "cy 0.3s ease-in" : "0s"};
          }
          .y-transition {
            transition: ${transitionOn ? "y 0.3s ease-in" : "0s"};
          }
        `}
        onMouseDown={(e) => {
          setScrolling(true);
          setStartX(e.clientX);
        }}
        onMouseUp={() => {
          setScrolling(false);
        }}
        onMouseMove={(e) => {
          if (scrolling) {
            setWindow((v) => {
              if (e.clientX < startX) {
                return Math.min(v + 1, length - scaledLength);
              } else {
                return Math.max(0, v - 1);
              }
            });
          }
        }}
        onFocus={() => {
          setScrolling(false);
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`}>
          {scale > 1 && (
            <rect
              x={(window / length) * width}
              y={height - scrollWidth}
              height={scrollWidth}
              width={width / scale}
              fill="var(--foreground)"
            />
          )}
          {/* {xAxis.map((y) => (
          <path d={`M ${yAxis[0]} ${y} L ${yAxis[1]} ${y}`} stroke="var(--foreground)" />
        ))} */}
          {/* givenData dots */}
          {selectedGivenData.map((data: GivenData, i: number) => {
            const realIndex = window + i;
            return (
              <>
                {/* <circle
                className="cy-transition"
                cx={xScale(i)}
                cy={divided ? trendScale(data.y) : yScale(data.y)}
                r={3}
                fill={"var(--foreground)"}
              /> */}
                <rect
                  className="y-transition"
                  x={xScale(realIndex) - ((1 / (scaledLength - 1)) * (width - 2 * padding)) / 4}
                  y={
                    divided
                      ? trendScale(Math.max(data.y, data.start))
                      : yScale(Math.max(data.y, data.start))
                  }
                  height={Math.max(1, Math.abs(yScale(data.start) - yScale(data.y)))}
                  width={((1 / (scaledLength - 1)) * (width - 2 * padding)) / 2}
                  fill={data.start > data.y ? "blue" : "red"}
                />
                <rect
                  className="y-transition"
                  x={xScale(realIndex)}
                  y={divided ? trendScale(data.upper) : yScale(data.upper)}
                  height={
                    divided
                      ? trendScale(data.lower) - trendScale(data.upper)
                      : yScale(data.lower) - yScale(data.upper)
                  }
                  width={1}
                  fill={data.start > data.y ? "blue" : "red"}
                />
              </>
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
    </>
  );
}
