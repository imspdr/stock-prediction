import { css } from "@emotion/react";
import { GivenData, PredictedData } from "@src/store/types";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@mui/material";

export default function TimeseriesChart(props: {
  givenData: GivenData[];
  predictedData: PredictedData[];
  width: number;
  height: number;
}) {
  const width = Math.max(Math.min(1600, props.width), 280);
  const height = Math.max(Math.min(1000, props.height), 300);
  const padding = (50 / 1000) * height;
  const paddingTop = (50 / 1000) * height;
  const leftPadding = (30 / 1600) * width;
  const scrollWidth = (5 / 1000) * height;
  const smallFont = (30 / 1000) * height;
  const largeFont = (35 / 1000) * height;
  const rightPadding = smallFont * 5;
  const maxScale = 32;

  const predictedColor = "var(--highlight)";
  const givenColor = "var(--chart-gray)";

  const [divided, setDivided] = useState(false);
  const [scale, setScale] = useState(1);
  const [nowIndex, setNowIndex] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const transitionOn = useRef<boolean | null>(null);
  const scrolling = useRef<boolean | null>(null);
  const nowX = useRef<number>(0);
  const startX = useRef<number>(0);
  const scaleDistance = useRef<number | null>(null);
  const velocity = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);

  useEffect(() => {
    setNowIndex((v) => Math.min(length - scaledLength, v));
  }, [scale]);

  useEffect(() => {
    transitionOn.current = false;
  }, [divided]);

  const divide = () => {
    transitionOn.current = true;
    setDivided((v) => !v);
  };
  // add key down scroll effect
  const keyDownEvent = function (ev: KeyboardEvent) {
    if (ev.key === "ArrowRight") {
      setNowIndex((v) => Math.min(v + 1, Math.floor(length - length / scale)));
    } else if (ev.key === "ArrowLeft") {
      setNowIndex((v) => Math.max(0, v - 1));
    } else if (ev.key === "ArrowUp") {
      setScale((v) => Math.min(maxScale, v * 2));
    } else if (ev.key === "ArrowDown") {
      setScale((v) => Math.max(1, v / 2));
    } else if (ev.key === " ") {
      divide();
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", keyDownEvent);
    return () => {
      window.removeEventListener("keydown", keyDownEvent);
    };
  }, [scale]);

  const calcStart = (clientX: number) => {
    scrolling.current = true;
    startX.current = clientX;
    nowX.current = clientX;
    lastTimestamp.current = performance.now();
  };
  const calcEnd = () => {
    const t = Math.max(performance.now() - lastTimestamp.current, 200);
    const distance =
      (nowX.current - startX.current) / ((width - leftPadding - rightPadding) / scaledLength);
    velocity.current = (distance / t) * 100;
    scrolling.current = false;
    if (t < 1000) {
      requestAnimationFrame(applyInertia);
    }
  };

  const applyInertia = () => {
    velocity.current *= 0.95;

    setNowIndex((v) => {
      return Math.min(Math.max(0, v + Math.round(velocity.current)), length - scaledLength);
    });

    if (Math.abs(velocity.current) >= 1) {
      requestAnimationFrame(applyInertia);
    }
  };
  const setIndex = (clientPos: number) => {
    const gap =
      (startX.current - clientPos) / ((width - leftPadding - rightPadding) / scaledLength);
    if (Math.abs(gap) >= 1) {
      setNowIndex((v) => {
        return Math.min(Math.max(0, v + (gap >= 0 ? 1 : -1)), length - scaledLength);
      });
      startX.current = clientPos;
    }
  };

  const hoverTexts = [
    {
      label: "날짜",
      value: "ds",
    },
    {
      label: "종가",
      value: "y",
    },
    {
      label: "시가",
      value: "start",
    },
    {
      label: "고가",
      value: "upper",
    },
    {
      label: "저가",
      value: "lower",
    },
  ];

  const topperTexts = [
    {
      label: "y hat",
      value: "yhat",
    },
    {
      label: "trend",
      value: "trend",
    },
    {
      label: "pattern",
      value: "additive_terms",
    },
  ];

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
    height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding - paddingTop);

  const trendScale = (y: number) =>
    paddingTop +
    (height - paddingTop) / 2 -
    padding -
    ((y - minTrend) / (maxTrend - minTrend)) * ((height - paddingTop) / 2 - 2 * padding);
  const additiveScale = (y: number) =>
    height -
    padding -
    ((height - paddingTop) / 2 - padding * 2) / 2 -
    (y / maxAbsAdditive) * ((height - paddingTop) / 4 - padding);

  const yScale = (y: number) => {
    if (divided) {
      return trendScale(y);
    } else {
      return baseScale(y);
    }
  };
  // values for grid
  const yGap = Math.round((maxY - minY) / 8);
  const trendGap = Math.round((maxTrend - minTrend) / 8);
  const xAxis = [leftPadding, width - rightPadding];
  const yAxis = [...new Array(9)].map((_, i) => {
    return Math.round(divided ? minTrend : minY) + i * (divided ? trendGap : yGap);
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
      {!(props.givenData.length > 0) ? (
        <Skeleton
          variant="rectangular"
          css={css`
            width: ${width}px;
            height: ${height}px;
            border-radius: 10px;
          `}
        />
      ) : (
        <div
          css={css`
            height: ${height}px;
            width: ${width}px;
            background-color: var(--paper);
            cursor: ${scrolling.current ? "grabbing" : "grab"};
            .y-transition {
              transition: ${transitionOn.current ? "0.3s ease-in" : "0s"};
            }
            border-radius: 10px;
            border: 1px solid;
          `}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            onMouseDown={(e) => {
              calcStart(e.clientX);
            }}
            onMouseUp={() => {
              calcEnd();
            }}
            onMouseMove={(e) => {
              if (scrolling.current && scale > 1) {
                setIndex(e.clientX);
              }
              const svgElement = e.currentTarget;
              const rect = svgElement.getBoundingClientRect();

              const x = ((e.clientX - rect.left) / rect.width) * width;
              const y = ((e.clientY - rect.top) / rect.height) * height;
              setMousePos({
                x: Math.max(leftPadding, Math.min(x, width - rightPadding)),
                y: Math.max(padding + paddingTop - 10, Math.min(y, height - padding + 10)),
              });
            }}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                calcStart(e.touches[0].clientX);
              }
            }}
            onTouchMove={(ev) => {
              const t1 = ev.touches[0];
              // const t2 = ev.touches[1];
              // if (t1 && t2) {
              //   const distance = Math.sqrt(
              //     Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2)
              //   );
              //   if (scaleDistance.current !== null) {
              //     const delta = distance - scaleDistance.current;
              //     setScale((v) =>
              //       Math.max(1, Math.min(maxScale, v + Math.round(v + delta * 0.005)))
              //     );
              //   }
              //   scaleDistance.current = distance;
              // } else
              if (scrolling.current && scale > 1 && t1) {
                setIndex(t1.clientX);
              }
            }}
            onTouchEnd={(e) => {
              calcEnd();
            }}
            onWheel={(e) => {
              if (e.deltaY < 0) {
                setScale((v) => Math.min(maxScale, v * 2));
              } else {
                setScale((v) => Math.max(1, v / 2));
              }
            }}
            onMouseLeave={() => {
              scrolling.current = false;
            }}
          >
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
                  x={width - rightPadding + smallFont - 5}
                  y={yScale(y) + 10}
                  fontSize={smallFont}
                  fill={"var(--foreground)"}
                  className="y-transition"
                >
                  {y}
                </text>
              </>
            ))}
            {divided && (
              <>
                {additiveYAxis.map((y) => {
                  return (
                    <>
                      <path
                        d={`M ${xAxis[0]} ${additiveScale(y)} L ${xAxis[1]} ${additiveScale(y)}`}
                        stroke="var(--chart-grid)"
                        strokeWidth={1}
                      />
                      <text
                        x={width - rightPadding + smallFont - 5}
                        y={additiveScale(y) + 10}
                        fontSize={smallFont}
                        fill={"var(--foreground)"}
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
                      className="y-transition"
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
                      className="y-transition"
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
                    className="y-transition"
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
                    className="y-transition"
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
            {/* givenData chart */}
            {selectedGivenData.map((data: GivenData, i: number) => {
              const realIndex = nowIndex + i;
              return (
                <>
                  <rect
                    className="y-transition"
                    x={
                      xScale(realIndex) -
                      ((1 / (scaledLength - 1)) * (width - leftPadding - rightPadding)) / 4
                    }
                    y={yScale(Math.max(data.y, data.start))}
                    height={Math.max(1, Math.abs(yScale(data.start) - yScale(data.y)))}
                    width={
                      ((1 / (scaledLength - 1)) * (width - leftPadding - rightPadding)) /
                      2 /
                      (xScale(realIndex) >= width - rightPadding - 10 ? 2 : 1)
                    }
                    fill={data.start > data.y ? "var(--chart-blue)" : "var(--chart-red)"}
                  />
                  <rect
                    className="y-transition"
                    x={xScale(realIndex) - 0.5}
                    y={yScale(data.upper)}
                    height={yScale(data.lower) - yScale(data.upper)}
                    width={1}
                    fill={data.start > data.y ? "var(--chart-blue)" : "var(--chart-red)"}
                  />
                </>
              );
            })}
            {/* hovered text */}
            {mousePos.x > leftPadding &&
              mousePos.x < width - rightPadding &&
              mousePos.y <= height - padding + 1 &&
              mousePos.y >= padding + paddingTop - 1 &&
              (function () {
                const price = !divided
                  ? Math.round(
                      (1 -
                        (mousePos.y - padding - paddingTop) / (height - padding * 2 - paddingTop)) *
                        (maxY - minY) +
                        minY
                    )
                  : mousePos.y < paddingTop + (height - paddingTop) / 2 - padding + 10
                  ? Math.round(
                      (1 -
                        (mousePos.y - padding - paddingTop) /
                          ((height - paddingTop) / 2 - padding * 2)) *
                        (maxTrend - minTrend) +
                        minTrend
                    )
                  : mousePos.y < paddingTop + (height - paddingTop) / 2 + padding - 10
                  ? undefined
                  : Math.round(
                      ((((height - paddingTop) * 3) / 4 + paddingTop - mousePos.y) /
                        ((height - paddingTop) / 4 - padding)) *
                        maxAbsAdditive
                    );
                const y = divided ? Math.min(mousePos.y) : mousePos.y;
                const idx = Math.floor(
                  ((mousePos.x - leftPadding) / (width - leftPadding - rightPadding)) * scaledLength
                );
                const x =
                  leftPadding + (idx * (width - leftPadding - rightPadding)) / (scaledLength - 1);
                const drawBox =
                  selectedGivenData[idx] &&
                  price &&
                  price >= selectedGivenData[idx]?.lower &&
                  price <= selectedGivenData[idx]?.upper;
                const drawBoxHeight = smallFont * 7;
                const drawBoxWidth = smallFont * 8;
                const priceBoxHeight = largeFont * 1.1;
                return (
                  <>
                    {(price == 0 || !!price) && (
                      <>
                        <path
                          d={`M ${xAxis[0]} ${y} L ${xAxis[1]} ${y}`}
                          stroke="var(--chart-grid)"
                          strokeWidth={3}
                          className="y-transition"
                        />
                        <rect
                          x={width - rightPadding}
                          y={y - priceBoxHeight / 2}
                          fill={"var(--foreground)"}
                          width={rightPadding}
                          height={priceBoxHeight}
                          rx={largeFont / 4}
                          ry={largeFont / 4}
                        />
                        <text
                          x={width - rightPadding / 2}
                          y={y + priceBoxHeight / 2 - largeFont / 5}
                          fontSize={largeFont}
                          fill={"var(--paper)"}
                          className="y-transition"
                          text-anchor="middle"
                        >
                          {price}
                        </text>
                      </>
                    )}
                    <path
                      d={`M ${x} ${padding + paddingTop} L ${x} ${height - padding}`}
                      stroke="var(--chart-grid)"
                      strokeWidth={3}
                      className="y-transition"
                    />
                    <rect
                      x={Math.max(0, x - rightPadding * 0.6)}
                      y={height - padding / 2 - priceBoxHeight / 2}
                      fill={"var(--foreground)"}
                      width={rightPadding * 1.2}
                      height={priceBoxHeight}
                      rx={10}
                      ry={10}
                    />
                    <text
                      x={Math.max(rightPadding * 0.6, x)}
                      y={height - padding / 2 + priceBoxHeight / 5}
                      fontSize={largeFont}
                      fill={"var(--paper)"}
                      className="y-transition"
                      text-anchor="middle"
                    >
                      {nowIndex + idx < props.givenData.length
                        ? selectedGivenData[idx]?.ds
                        : nowIndex + idx}
                    </text>
                    {drawBox && (
                      <>
                        <rect
                          y={y > height / 2 ? y - drawBoxHeight : y}
                          x={x > width / 2 ? x - drawBoxWidth : x}
                          width={drawBoxWidth}
                          height={drawBoxHeight}
                          fill={"var(--paper)"}
                        />
                        {hoverTexts.map((item, index) => {
                          return (
                            <text
                              y={
                                (y > height / 2 ? y - drawBoxHeight : y) +
                                (index + 1) * (smallFont * 1.2)
                              }
                              x={(x > width / 2 ? x - drawBoxWidth : x) + smallFont / 3}
                              fontSize={smallFont}
                              fill={"var(--foreground)"}
                            >
                              {`${item.label} - ${
                                selectedGivenData[idx]![item.value as keyof GivenData]
                              }`}
                            </text>
                          );
                        })}
                      </>
                    )}
                    {idx < props.predictedData.length &&
                    width > rightPadding * 2 + smallFont * 22 + leftPadding ? (
                      <>
                        {topperTexts.map((item, index) => {
                          return (
                            !!props.predictedData[nowIndex + idx] && (
                              <text
                                y={paddingTop}
                                x={leftPadding + index * smallFont * 7}
                                fontSize={smallFont}
                                fill={"var(--foreground)"}
                              >
                                {`${item.label} ${
                                  props.predictedData[nowIndex + idx]![
                                    item.value as keyof PredictedData
                                  ]
                                }`}
                              </text>
                            )
                          );
                        })}
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                );
              })()}{" "}
            {/* {top side buttons} */}
            {
              <>
                <rect
                  x={width - rightPadding * 2}
                  y={paddingTop - smallFont}
                  height={paddingTop}
                  width={rightPadding}
                  rx={paddingTop / 2}
                  ry={paddingTop / 2}
                  fill="var(--highlight)"
                  onClick={() => {
                    transitionOn.current = true;
                    setDivided((v) => !v);
                  }}
                ></rect>
                <text
                  x={width - rightPadding * 2 + smallFont + 2}
                  y={paddingTop + 2}
                  fontSize={smallFont}
                  fill={"var(--foreground)"}
                  onClick={divide}
                >
                  {divided ? "합치기" : "펼치기"}
                </text>
                <text
                  x={width - rightPadding + smallFont * 1}
                  y={paddingTop}
                  fontSize={smallFont}
                  fill={"var(--foreground)"}
                  text-anchor="middle"
                  onClick={() => {
                    setScale((v) => Math.max(1, v / 2));
                  }}
                >
                  {"<"}
                </text>
                <text
                  x={width - rightPadding + smallFont * 2.5}
                  y={paddingTop}
                  fontSize={smallFont}
                  fill={"var(--foreground)"}
                  text-anchor="middle"
                >
                  {`x${scale.toFixed(0)}`}
                </text>
                <text
                  x={width - rightPadding + smallFont * 4}
                  y={paddingTop}
                  fontSize={smallFont}
                  fill={"var(--foreground)"}
                  text-anchor="middle"
                  onClick={() => {
                    setScale((v) => Math.min(maxScale, v * 2));
                  }}
                >
                  {">"}
                </text>
              </>
            }
          </svg>
        </div>
      )}
    </>
  );
}
