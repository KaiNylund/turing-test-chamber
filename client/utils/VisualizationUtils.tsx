import * as d3 from 'd3';
import moment from "moment";
import store from "../model/store";
import { MessageStats } from '../types';


function getMessage(messagesArr: {[k: string]: any}[], num: number, player: string) {
  return messagesArr.find((x) => (x.messageNum === num && x.player === player));
}


export function formatMessageStats(messageStatsJson: MessageStats) {
  // x is group -- messageNum
  // y is height -- time message took
  // z is color -- player
  let startTime = moment.utc(store.getState().role.assignedTime);
	let formattedArr: {[k: string]: any}[] = [];
	for (const player of Object.keys(messageStatsJson)) {
    let playerStats = messageStatsJson[player as keyof typeof messageStatsJson];
    for (const messageStat of playerStats) {
      formattedArr.push({messageNum: messageStat.messageNum,
                         time: moment.utc(messageStat.datetime),
                         player: player});
    }
  }
  // Calculate the times it took to write each message from the times they were
  // submitted
  for (let entry of formattedArr) {
    let num = entry.messageNum;
    let player = entry.player;
    let time = entry.time;

    if (player === "guesser") {
      if (num === 0) {
        entry["timeDiff"] = moment.duration(time.diff(startTime)).asSeconds();
      } else {
        let prevMsg = getMessage(formattedArr, num - 1, "tricker");
        if (prevMsg !== undefined) {
          entry["timeDiff"] = moment.duration(time.diff(prevMsg.time)).asSeconds();
        } else {
          entry["timeDiff"] = 0.0;
        }
      }
    } else { // player === "tricker" || player === "gpt3"
      let guesserMsg = getMessage(formattedArr, num, "guesser");
      if (guesserMsg !== undefined) {
        entry["timeDiff"] = moment.duration(time.diff(guesserMsg.time)).asSeconds();
      } else {
        entry["timeDiff"] = 0.0;
      }
    }
  }
  return formattedArr;
}

function appendCircle(svg: any, title: string, value: number,
                      r: number, x: number, y: number, color: string, marginTop: number) {
  svg.append("circle")
    .style("stroke", "gray")
    .style("fill", color)
    .attr("r", r)
    .attr("cx", x)
    .attr("cy", marginTop + y);

  svg.append("text")
    .attr("class", "circle-val")
    .attr("text-anchor", "middle")
    .attr("x", x)
    .attr("y", marginTop + y + 5)
    .attr("font-size", "1rem")
    .text(value);

  svg.append("text")
    .attr("class", "circle-title")
    .attr("text-anchor", "middle")
    .attr("x", x)
    .attr("y", marginTop)
    .attr("font-size", "0.75rem")
    .text(title);
}


export function twoCirclesChart(selector: string,
                         width: number,
                         height: number,
                         d1: number,
                         d2: number,
                         t1: string,
                         t2: string,
                         c1: string = "green",
                         c2: string = "red",
                         marginTop: number = 10
                         ) {
  let r1 = d1 / (d1 + d2) * (width / 5);
  let r2 = d2 / (d1 + d2) * (width / 5);
  const svg = d3.selectAll(selector)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  appendCircle(svg, t1, d1, r1, width / 4, height / 2, c1, marginTop);
  appendCircle(svg, t2, d2, r2, 3 * width / 4, height / 2, c2, marginTop);
}


// I don't think d3 and typescript are friends
type barChartType = {
  x?: ((d: any, i: any) => any) | undefined,
  y?: ((d: any) => any) | undefined,
  z?: ((d: any) => any) | undefined,
  chartTitle : string,
  title?: any,
  marginTop?: number | undefined,
  marginRight?: number | undefined,
  marginBottom?: number | undefined,
  marginLeft?: number | undefined,
  width: number | undefined,
  height: number | undefined,
  xDomain?: any,
  xRange?: any[] | undefined,
  xPadding?: number | undefined,
  yDomain?: any,
  yRange?: any[] | undefined,
  zDomain?: any,
  zPadding?: number | undefined,
  yFormat?: any,
  yLabel: string,
  xLabel: string,
  colors?: readonly string[] | undefined
}

// From https://observablehq.com/@d3/grouped-bar-chart
export function groupedBarChart(data: Iterable<any>, {
  x = (d, i) => i, // given d in data, returns the (ordinal) x-value
  y = d => d, // given d in data, returns the (quantitative) y-value
  z = () => 1, // given d in data, returns the (categorical) z-value
  chartTitle,
  title, // given d in data, returns the title text
  marginTop = 30, // top margin, in pixels
  marginRight = 0, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  xDomain, // array of x-values
  xRange = [marginLeft, width - marginRight], // [xmin, xmax]
  xPadding = 0.1, // amount of x-range to reserve to separate groups
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [ymin, ymax]
  zDomain, // array of z-values
  zPadding = 0.05, // amount of x-range to reserve to separate bars
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  xLabel,
  colors = d3.schemeTableau10, // array of colors
}: barChartType) {
  let yType = d3.scaleLinear;  // type of y-scale
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);

  // Compute default domains, and unique the x- and z-domains.
  if (xDomain === undefined) xDomain = X;
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  if (zDomain === undefined) zDomain = Z;
  xDomain = new d3.InternSet(xDomain);
  zDomain = new d3.InternSet(zDomain);

  // Omit any data not present in both the x- and z-domain.
  const I = d3.range(X.length).filter(i => xDomain.has(X[i]) && zDomain.has(Z[i]));

  // Construct scales, axes, and formats.
  const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
  const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
  const yScale = yType(yDomain, yRange);
  const zScale = d3.scaleOrdinal(zDomain, colors);
  // @ts-ignore
  // Ok honestly d3 types in TS are super confusing and I gave up while trying to figure out
  // what type xScale should be cast to here
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

  // Compute titles.
  if (title === undefined) {
    const formatValue = yScale.tickFormat(100, yFormat);
    title = (i: number) => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = (i: number) => T(O[i], i, data);
  }

  const svg = d3.select("#grouped-bar-chart > svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", (width - marginLeft) / 2)
          .attr("y", "1rem")
          .attr("fill", "currentColor")
          .attr("text-anchor", "middle")
          .attr("font-size", "1rem")
          .text(chartTitle));

  // y-label
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", 0)
    .attr("x", (height - marginTop) / -2)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text(yLabel);

  // x-label
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2 + 6)
    .attr("y", height - 2)
    .text(xLabel);

  const bar = svg.append("g")
    .selectAll("rect")
    .data(I)
    .join("rect")
      .attr("x", i => xScale(X[i])! + xzScale(Z[i])!)
      .attr("y", i => yScale(Y[i]))
      .attr("width", xzScale.bandwidth())
      .attr("height", i => yScale(0) - yScale(Y[i]))
      .attr("fill", i => zScale(Z[i]));

  if (title) bar.append("title")
      .text(title);

  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis);
}