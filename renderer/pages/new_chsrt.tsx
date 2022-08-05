import React from "react";
import Head from "next/head";
import { TimeSeries } from "pondjs";
// import Link from "next/link";
// const { ipcRenderer } = require("electron");

import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
} from "react-timeseries-charts";

// const series1 = new TimeSeries({
//   name: "USD_vs_EURO",
//   columns: ["time", "value"],
//   points,
// });

function Chart() {
  return (
    <React.Fragment>
      <Head>
        <title>Neuphony - Chart It</title>
      </Head>
      <div className="w-full h-fit border-red-800 border-2 mt-20">
        <div className="mt-10">
          {/* <ChartContainer timeRange={series1.timerange()} width={800}>
            <ChartRow height="200">
              <YAxis
                id="axis1"
                label="AUD"
                min={0.5}
                max={1.5}
                width="60"
                type="linear"
                format="$,.2f"
              />
              <Charts>
                <LineChart axis="axis1" series={series1} column={["aud"]} />
                <LineChart axis="axis2" series={series2} column={["euro"]} />
              </Charts>
              <YAxis
                id="axis2"
                label="Euro"
                min={0.5}
                max={1.5}
                width="80"
                type="linear"
                format="$,.2f"
              />
            </ChartRow>
          </ChartContainer> */}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Chart;
