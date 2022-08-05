import { useState, useEffect } from "react";
import RenderChannelsChart from "./RenderChannelsChart";
import RenderBrush from "./RenderBrush";

import data from "../pages/bike.json";

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

const style = styler([
  { key: "distance", color: "#e2e2e2" },
  { key: "altitude", color: "#e2e2e2" },
  { key: "cadence", color: "#ff47ff" },
  { key: "power", color: "green", width: 1, opacity: 0.5 },
  { key: "temperature", color: "#cfc793" },
  { key: "speed", color: "steelblue", width: 1, opacity: 0.5 },
]);

export default function Chart({ packets, channelNum }) {
  const initialRange = new TimeRange([75 * 60 * 1000, 125 * 60 * 1000]);

  const channels = {
    distance: {
      units: "miles",
      label: "Distance",
      format: ",.1f",
      series: null,
      show: false,
    },
    altitude: {
      units: "feet",
      label: "Altitude",
      format: "d",
      series: null,
      show: false,
    },
    cadence: {
      units: "rpm",
      label: "Cadence",
      format: "d",
      series: null,
      show: true,
    },
    power: {
      units: "watts",
      label: "Power",
      format: ",.1f",
      series: null,
      show: true,
    },
    temperature: {
      units: "deg F",
      label: "Temp",
      format: "d",
      series: null,
      show: false,
    },
    speed: {
      units: "mph",
      label: "Speed",
      format: ",.1f",
      series: null,
      show: true,
    },
  };

  const channelNames = [
    "speed",
    "power",
    "cadence",
    "temperature",
    "distance",
    "altitude",
  ];
  const displayChannels = ["speed", "power", "cadence"];
  const rollupLevels = ["1s", "5s", "15s", "25s"];

  const [state, setState] = useState({
    ready: false,
    mode: "channels",
    channels,
    channelNames,
    displayChannels,
    rollupLevels,
    rollup: "1m",
    tracker: null,
    timerange: initialRange,
    brushrange: initialRange,
  });

  const points = {};
  channelNames.forEach((channel) => {
    points[channel] = [];
  });

  console.log(data);

  useEffect(() => {
    setTimeout(() => {
      const { channelNames, channels, displayChannels, rollupLevels } = state;

      const points = {};
      channelNames.forEach((channel) => {
        points[channel] = [];
      });

      for (let i = 0; i < data.time.length; i += 1) {
        if (i > 0) {
          const deltaTime = data.time[i] - data.time[i - 1];
          const time = data.time[i] * 1000;

          points["distance"].push([time, data.distance[i]]);
          points["altitude"].push([time, data.altitude[i] * 3.28084]); // convert m to ft
          points["cadence"].push([time, data.cadence[i]]);
          points["power"].push([time, data.watts[i]]);
          points["temperature"].push([time, data.temp[i]]);

          if (deltaTime > 10) {
            points["speed"].push([time - 1000, null]);
          }

          const speed =
            (data.distance[i] - data.distance[i - 1]) /
            (data.time[i] - data.time[i - 1]); // meters/sec
          points["speed"].push([time, 2.236941 * speed]); // convert m/s to miles/hr
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
      }

      const minTime = channels.altitude.series.range().begin();
      const maxTime = channels.altitude.series.range().end();
      const minDuration = 10 * 60 * 1000;

      setState({
        ...state,
        ready: true,
        channels,
        minTime,
        maxTime,
        minDuration,
      });
    }, 0);
  }, []);

  const handleTrackerChanged = (t) => {
    setState({ tracker: t });
  };

  const handleTimeRangeChange = (timerange) => {
    const { channels } = state;
    if (timerange) {
      setState({ timerange, brushrange: timerange });
    } else {
      setState({
        timerange: channels["altitude"].range(),
        brushrange: null,
      });
    }
  };

  return (
    <div className="w-full h-fit border-blue-800 border-2 mt-20 ">
      <div className="row ml-40 mb-10">
        <div className="col-md-12" style={chartStyle}>
          <Resizable>
            {state.ready ? (
              <RenderChannelsChart
                state={state}
                style={style}
                handleTimeRangeChange={handleTimeRangeChange}
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
    </div>
  );
}

// LINE CHART ------------------------------------------------------------------------------------------------------

// import data from "../pages/usd_vs_euro.json";
// import {
//   ChartContainer,
//   ChartRow,
//   LineChart,
//   Charts,
//   Baseline,
//   baselineStyle,
//   baselineStyleLite,
//   baselineStyleExtraLite,
//   style,
//   YAxis,
//   Resizable,
// } from "react-timeseries-charts";

// import { TimeSeries } from "pondjs";

// export default function Chart({ packets, channelNum }) {
//   const points = data.widget[0].data.reverse();
//   const series = new TimeSeries({
//     name: "USD_vs_EURO",
//     columns: ["time", "value"],
//     points,
//   });

//   console.log(bikeData);

//   return (
//     <div className="w-full h-fit border-blue-800 border-2 mt-20">
//       <div className="mt-10">
//         <h1 className="ml-7 font-bold">Channel 1</h1>
//         <Resizable>
//           <ChartContainer
//             title="Euro price (USD)"
//             titleStyle={{ fill: "#555", fontWeight: 500 }}
//             timeRange={series.range()}
//             format="%d %b '%y"
//             timeAxisTickCount={5}
//           >
//             <ChartRow height="150">
//               <YAxis
//                 id="price"
//                 label="Price ($)"
//                 min={series.min()}
//                 max={series.max()}
//                 width="60"
//                 format="$,.2f"
//               />
//               <Charts>
//                 <LineChart axis="price" series={series} style={style} />
//                 <Baseline
//                   axis="price"
//                   style={baselineStyleLite}
//                   value={series.max()}
//                   label="Max"
//                   position="right"
//                 />
//                 <Baseline
//                   axis="price"
//                   style={baselineStyleLite}
//                   value={series.min()}
//                   label="Min"
//                   position="right"
//                 />
//                 <Baseline
//                   axis="price"
//                   style={baselineStyleExtraLite}
//                   value={series.avg() - series.stdev()}
//                 />
//                 <Baseline
//                   axis="price"
//                   style={baselineStyleExtraLite}
//                   value={series.avg() + series.stdev()}
//                 />
//                 <Baseline
//                   axis="price"
//                   style={baselineStyle}
//                   value={series.avg()}
//                   label="Avg"
//                   position="right"
//                 />
//               </Charts>
//             </ChartRow>
//           </ChartContainer>
//         </Resizable>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Legend,
//   Tooltip,
//   ReferenceLine,
// } from "recharts";

// export default function Chart({ packets, channelNum }) {
//   const [packetArray, setPacketArray] = useState([]);
//   const [idxx, setIdxx] = useState(-10);

//   const shiftValues = (myArray) => {
//     for (let i = 0; i < 10; i++) myArray.shift();
//   };

//   useEffect(() => {
//     let arr = packets.map((packet, index) => ({
//       id: idxx + index,
//       values: packet[channelNum],
//     }));
//     if (packetArray.length > 1000) {
//       shiftValues(packetArray);
//     }
//     setPacketArray([...packetArray, ...arr]);
//     setIdxx((id) => id + 10);
//   }, [packets]);

//   return (
//     <div className="w-full h-fit border-blue-800 border-2 mt-20">
//       <div className="mt-10">
//         <h1 className="ml-7 font-bold">Channel {channelNum + 1}</h1>
//         <ResponsiveContainer width="100%" aspect={3}>
//           <LineChart
//             data={packetArray}
//             width={500}
//             height={300}
//             margin={{ top: 40, right: 80, left: 20, bottom: 10 }}
//           >
//             <XAxis dataKey="id" interval={"preserveStartEnd"} />
//             <ReferenceLine y={0} stroke="blue" />
//             <YAxis
//               type="number"
//               domain={[-100, 100]}
//               allowDataOverflow={true}
//             />
//             <Tooltip
//               contentStyle={{ backgroundColor: "white", color: "black" }}
//             />
//             <Legend />
//             <Line
//               dataKey="values"
//               stroke="gray"
//               activeDot={{ stroke: "yellow" }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
