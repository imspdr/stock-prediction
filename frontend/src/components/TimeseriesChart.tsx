import { css } from "@emotion/react";
import { Circle } from "@mui/icons-material";
import { GivenData, PredictedData } from "@src/store/types";
import { useState, useEffect, useCallback } from "react";

export default function TimeseriesChart(props: {
  givenData: GivenData[];
  predictedData: PredictedData[];
}) {
  const [divided, setDivided] = useState(false);
  const [scale, setScale] = useState(1);

  const [nowIndex, setNowIndex] = useState(0);

  const [transitionOn, setTransitionOn] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    setNowIndex((v) => Math.min(length - scaledLength, v));
  }, [scale]);
  useEffect(() => {
    setTransitionOn(false);
  }, [divided]);

  // add key down scroll effect
  const keyDownEvent = function (ev: KeyboardEvent) {
    if (ev.key === "ArrowRight") {
      setNowIndex((v) => Math.min(v + 1, length - length / scale));
    } else if (ev.key === "ArrowLeft") {
      setNowIndex((v) => Math.max(0, v - 1));
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", keyDownEvent);
    return () => {
      window.removeEventListener("keydown", keyDownEvent);
    };
  }, [scale]);

  const width = 1600;
  const height = 1000;
  const padding = 50;
  const leftPadding = 50;
  const rightPadding = 100;
  const scrollWidth = 5;

  const predictedColor = "var(--highlight)";
  const givenColor = "var(--chart-gray)";

  // select data using state
  const length = props.predictedData.length;
  const scaledLength = Math.floor(length / scale);

  const selectedGivenData = props.givenData.slice(nowIndex, nowIndex + scaledLength);
  const selectedPredictedData = props.predictedData.slice(nowIndex, nowIndex + scaledLength);

  const givenPrediction = selectedPredictedData.filter((data) => data.predicted == 0);
  const predictedData = selectedPredictedData.filter((data) => data.predicted == 1);

  // calc min max value to get proper size
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
  const maxAbsAdditive = Math.ceil(
    Math.max(...props.predictedData.map((d) => Math.abs(d.additive_terms)))
  );

  // functions to transform coordinate to svg's
  const xScale = (x: number) =>
    ((x - nowIndex) / (scaledLength - 1)) * (width - leftPadding - rightPadding) + leftPadding;
  const baseScale = (y: number) =>
    height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding);

  const trendScale = (y: number) =>
    height / 2 - padding - ((y - minTrend) / (maxTrend - minTrend)) * (height / 2 - 2 * padding);
  const additiveScale = (y: number) =>
    height -
    padding -
    (height / 2 - padding * 2) / 2 -
    (y / maxAbsAdditive) * (height / 4 - padding);

  const yScale = (y: number) => {
    if (divided) {
      return trendScale(y);
    } else {
      return baseScale(y);
    }
  };
  // values for grid
  const yGap = Math.round((maxY - minY) / 8);
  const xAxis = [leftPadding, width - rightPadding];
  const yAxis = [...new Array(9)].map((_, i) => {
    return Math.round(divided ? minTrend : minY) + i * yGap;
  });
  const additiveYAxis = [-maxAbsAdditive, 0, maxAbsAdditive];
  const datas = [
    {
      name: "given",
      data: givenPrediction,
      start: nowIndex,
      color: givenColor,
    },
    {
      name: "predicted",
      data: predictedData,
      start: nowIndex + givenPrediction.length,
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
      </div>
      <div
        css={css`
          width: 90%;
          max-width: 800px;
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
          if (scrolling && scale > 1) {
            setNowIndex((v) => {
              return Math.min(
                Math.max(
                  0,
                  v + Math.floor(((startX - e.clientX) / window.innerWidth) * scaledLength)
                ),
                length - scaledLength
              );
            });
          }
        }}
        onWheel={(e) => {
          if (e.deltaY < 0) {
            setTransitionOn(false);
            setScale((v) => (v > 8 ? 1 : v * 2));
          } else {
            setTransitionOn(false);
            setScale((v) => (v > 1 ? v / 2 : 1));
          }
        }}
        onMouseLeave={() => {
          setScrolling(false);
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`}>
          {/* {grid line} */}
          {yAxis.map((y) => (
            <>
              <path
                d={`M ${xAxis[0]} ${yScale(y)} L ${xAxis[1]} ${yScale(y)}`}
                stroke="var(--chart-grid)"
                strokeWidth={1}
                className="y-transition"
              />
              <text
                x={width - (rightPadding * 2) / 3}
                y={yScale(y) + 5}
                fontSize={20}
                fill={"var(--foreground)"}
                className="y-transition"
              >
                {y}
              </text>
            </>
          ))}
          {divided && (
            <>
              <rect
                x={0}
                y={height / 2 - padding / 2}
                height={padding}
                width={width}
                fill={"var(--background)"}
              />
              {additiveYAxis.map((y) => {
                return (
                  <>
                    <path
                      d={`M ${xAxis[0]} ${additiveScale(y)} L ${xAxis[1]} ${additiveScale(y)}`}
                      stroke="var(--chart-grid)"
                      strokeWidth={1}
                      className="y-transition"
                    />
                    <text
                      x={width - (rightPadding * 2) / 3}
                      y={additiveScale(y) + 5}
                      fontSize={20}
                      fill={"var(--foreground)"}
                      className="y-transition"
                    >
                      {y}
                    </text>
                  </>
                );
              })}
            </>
          )}
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
                      .map((d) => `L ${xScale(d.index)} ${trendScale(d.trend_lower)}`)} Z`}
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
                      .map((d) => `L ${xScale(d.index)} ${yScale(d.yhat_lower)}`)} Z`}
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
          {scale > 1 && (
            <rect
              x={(nowIndex / length) * width}
              y={height - scrollWidth}
              height={scrollWidth}
              width={width / scale}
              fill="var(--scroll-color)"
            />
          )}
          {/* givenData dots */}
          {selectedGivenData.map((data: GivenData, i: number) => {
            const realIndex = nowIndex + i;
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
                  y={yScale(Math.max(data.y, data.start))}
                  height={Math.max(1, Math.abs(yScale(data.start) - yScale(data.y)))}
                  width={((1 / (scaledLength - 1)) * (width - 2 * padding)) / 2}
                  fill={data.start > data.y ? "var(--chart-blue)" : "var(--chart-red)"}
                />
                <rect
                  className="y-transition"
                  x={xScale(realIndex)}
                  y={yScale(data.upper)}
                  height={yScale(data.lower) - yScale(data.upper)}
                  width={1}
                  fill={data.start > data.y ? "var(--chart-blue)" : "var(--chart-red)"}
                />
              </>
            );
          })}
        </svg>
      </div>
    </>
  );
}
