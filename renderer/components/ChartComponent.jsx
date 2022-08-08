import { useState, useEffect } from "react";
import RenderChannelsChart from "./RenderChannelsChart";
import RenderBrush from "./RenderBrush";

import {
  Resizable,
  chartStyle,
  brushStyle,
  styler,
} from "react-timeseries-charts";

import "moment-duration-format";
// import moment from "moment";
import React from "react";
// import { format } from "d3-format";
import _ from "underscore";

import { TimeSeries, TimeRange, avg, percentile, median } from "pondjs";
import data from "../../public/myOutputFile.json";
import { stat } from "fs";

const style = styler([
  { key: "Fp1", color: "#e2e2e2" },
  { key: "FP2", color: "#e2e2e2" },
  { key: "F3", color: "#e2e2e2" },
  { key: "F4", color: "#e2e2e2" },
  { key: "Fz", color: "#e2e2e2" },
  { key: "Pz", color: "#e2e2e2" },
]);

export default function Chart() {
  const initialRange = new TimeRange([0, 3 * 1000]);

  const channels = {
    Fp1: {
      label: "Fp1",
      series: null,
      show: true,
    },
    FP2: {
      label: "Fp2",
      series: null,
      show: true,
    },
    F3: {
      label: "F3",
      series: null,
      show: true,
    },
    F4: {
      label: "F4",
      series: null,
      show: true,
    },
    Fz: {
      label: "Fz",
      series: null,
      show: true,
    },
    Pz: {
      label: "Pz",
      series: null,
      show: true,
    },
  };

  const channelNames = ["Fp1", "FP2", "F3", "F4", "Fz", "Pz"];
  const displayChannels = ["Fp1", "FP2", "F3", "F4", "Fz", "Pz"];
  const rollupLevels = ["1s", "5s", "15s", "25s"];

  const [state, setState] = useState({
    ready: false,
    mode: "channels",
    channels,
    channelNames,
    displayChannels,
    rollupLevels,
    rollup: "1s",
    tracker: null,
    timerange: initialRange,
    brushrange: new TimeRange([0, 3 * 1000]),
  });
  const [val, setVal] = useState({
    min: -100,
    max: 100,
  });

  useEffect(() => {
    setTimeout(() => {
      const { channelNames, channels, displayChannels, rollupLevels } = state;

      const points = {};
      channelNames.forEach((channel) => {
        points[channel] = [];
      });

      for (let i = 0; i < 23000; i += 1) {
        if (i > 0) {
          points["Pz"].push([i * 4, data[i].Pz]);
          points["Fz"].push([i * 4, data[i].Fz]);
          // points["T4"].push([i * 4, data[i].T4]);
          // points["T3"].push([i * 4, data[i].T3]);
          points["F4"].push([i * 4, data[i].F4]);
          points["F3"].push([i * 4, data[i].F3]);
          points["FP2"].push([i * 4, data[i].FP2]);
          points["Fp1"].push([i * 4, data[i].Fp1]);
        }
      }

      for (let channelName of channelNames) {
        // The TimeSeries itself, for this channel
        const series = new TimeSeries({
          name: channels[channelName].name,
          columns: ["time", channelName],
          points: points[channelName],
        });

        if (_.contains(displayChannels, channelName)) {
          const rollups = _.map(rollupLevels, (rollupLevel) => {
            return {
              duration: parseInt(rollupLevel.split("s")[0], 10),
              series: series.fixedWindowRollup({
                windowSize: rollupLevel,
                aggregation: { [channelName]: { [channelName]: avg() } },
              }),
            };
          });
          channels[channelName].rollups = rollups;
        }
        channels[channelName].series = series;

        // Some simple statistics for each channel
        channels[channelName].avg = parseInt(series.avg(channelName), 10);
        channels[channelName].max = parseInt(series.max(channelName), 10);
        channels[channelName].min = parseInt(series.min(channelName), 10);
      }

      // const minTime = channels.altitude.series.range().begin();
      // const maxTime = channels.altitude.series.range().end();
      // const minDuration = 10 * 60 * 1000;

      setState({
        ...state,
        ready: true,
        channels,
        // minTime,
        // maxTime,
        // minDuration,
      });
    }, 0);
  }, []);

  const handleTrackerChanged = (t) => {
    setState({ tracker: t });
  };

  const handleTimeRangeChange = (timerange) => {
    const { channels } = state;
    // if (timerange) {
    setState({ ...state, timerange, brushrange: timerange });
    // }
    // else {
    //   setState({
    //     timerange: channels["altitude"].range(),
    //     brushrange: null,
    //   });
    // }
  };

  return (
    <div className="w-full h-fit border-blue-800 border-2 mt-10 ">
      <div className="row ml-40 mb-10">
        <div className="col-md-12" style={chartStyle}>
          <Resizable>
            {state.ready ? (
              <RenderChannelsChart
                state={state}
                style={style}
                handleTimeRangeChange={handleTimeRangeChange}
                val={val}
              />
            ) : (
              <div>Loading.....</div>
            )}
          </Resizable>
        </div>
      </div>
      <div className="row ml-40">
        <div className="col-md-12" style={brushStyle}>
          <Resizable>
            {state.ready ? (
              <RenderBrush
                state={state}
                setState={setState}
                style={style}
                handleTimeRangeChange={handleTimeRangeChange}
                handleTrackerChanged={handleTrackerChanged}
              />
            ) : (
              <div>Loading.....</div>
            )}
          </Resizable>
        </div>
      </div>

      <div>
        <span>Range: </span>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() => setVal({ min: -100, max: 100 })}
        >
          100
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() => setVal({ min: -200, max: 200 })}
        >
          200
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() => setVal({ min: -300, max: 300 })}
        >
          300
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() => setVal({ min: -400, max: 400 })}
        >
          400
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() =>
            setVal({
              min: null,
              max: null,
            })
          }
        >
          auto
        </button>
      </div>

      <div>
        <span>Time: </span>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() =>
            setState({
              ...state,
              timerange: new TimeRange([0, 3 * 1000]),
              brushrange: new TimeRange([0, 3 * 1000]),
            })
          }
        >
          3 sec
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() =>
            setState({
              ...state,
              timerange: new TimeRange([0, 5 * 1000]),
              brushrange: new TimeRange([0, 5 * 1000]),
            })
          }
        >
          5 sec
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() =>
            setState({
              ...state,
              timerange: new TimeRange([0, 7 * 1000]),
              brushrange: new TimeRange([0, 7 * 1000]),
            })
          }
        >
          7 sec
        </button>
        <button
          className="border-2 m-2 p-0.5"
          onClick={() =>
            setState({
              ...state,
              timerange: new TimeRange([0, 10 * 1000]),
              brushrange: new TimeRange([0, 10 * 1000]),
            })
          }
        >
          10 sec
        </button>
      </div>
    </div>
  );
}
