import {
  ChartContainer,
  ChartRow,
  LineChart,
  Charts,
  Baseline,
  LabelAxis,
  ValueAxis,
} from "react-timeseries-charts";

import "moment-duration-format";
import moment from "moment";
import React from "react";
import { format } from "d3-format";
import _ from "underscore";

const baselineStyles = {
  speed: {
    stroke: "steelblue",
    opacity: 0.5,
    width: 0.25,
  },
  power: {
    stroke: "green",
    opacity: 0.5,
    width: 0.25,
  },
};

const speedFormat = format(".1f");

const RenderChannelsChart = ({
  state,
  style,
  handleTimeRangeChange,
  handleTrackerChanged,
}) => {
  const {
    timerange,
    displayChannels,
    channels,
    // maxTime,
    // minTime,
    // minDuration,
  } = state;

  const durationPerPixel = timerange.duration() / 800 / 1000;
  // console.log(timerange.duration());
  const rows = [];

  for (let channelName of displayChannels) {
    const charts = [];
    let series = channels[channelName].series;
    // console.log(series);
    _.forEach(channels[channelName].rollups, (rollup) => {
      if (rollup.duration < durationPerPixel * 2) {
        series = rollup.series.crop(timerange);
      }
    });
    // console.log(series);
    charts.push(
      <LineChart
        key={`line-${channelName}`}
        axis={`${channelName}_axis`}
        series={series}
        columns={[channelName]}
        style={style}
        breakLine
      />
    );
    charts.push(
      <Baseline
        key={`baseline-${channelName}`}
        axis={`${channelName}_axis`}
        style={baselineStyles.speed}
        value={channels[channelName].avg}
      />
    );
    // console.log(charts);

    // Get the value at the current tracker position for the ValueAxis
    let value = "--";
    if (state.tracker) {
      const approx =
        (+state.tracker - +timerange.begin()) /
        (+timerange.end() - +timerange.begin());
      const ii = Math.floor(approx * series.size());
      const i = series.bisect(new Date(state.tracker), ii);
      const v = i < series.size() ? series.at(i).get(channelName) : null;
      if (v) {
        value = parseInt(v, 10);
      }
    }

    // Get the summary values for the LabelAxis
    const summary = [
      { label: "Max", value: speedFormat(channels[channelName].max) },
      { label: "Min", value: speedFormat(channels[channelName].min) },
    ];

    rows.push(
      <ChartRow
        height="150"
        visible={channels[channelName].show}
        key={`row-${channelName}`}
      >
        <LabelAxis
          id={`${channelName}_axis`}
          label={channels[channelName].label}
          values={summary}
          min={-50}
          max={50}
          width={140}
          type="linear"
          format=",.1f"
        />
        <Charts>{charts}</Charts>
        <ValueAxis
          id={`${channelName}_valueaxis`}
          value={value}
          // detail={channels[channelName].units}
          width={80}
          min={0}
          max={35}
        />
      </ChartRow>
    );
  }

  return (
    <ChartContainer
      timeRange={state.timerange}
      format="relative"
      showGrid={false}
      enablePanZoom
      // maxTime={maxTime}
      // minTime={minTime}
      // minDuration={minDuration}
      trackerPosition={state.tracker}
      onTimeRangeChanged={handleTimeRangeChange}
      onChartResize={(width) => handleChartResize(width)}
      onTrackerChanged={handleTrackerChanged}
      timeAxisTickCount={15}
    >
      {rows}
    </ChartContainer>
  );
};

export default RenderChannelsChart;
