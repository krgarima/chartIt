import {
  ChartContainer,
  ChartRow,
  Charts,
  YAxis,
  Brush,
  AreaChart,
} from "react-timeseries-charts";

const RenderBrush = ({ state, style, handleTimeRangeChange }) => {
  const { channels } = state;

  return (
    <ChartContainer
      timeRange={channels.altitude.series.range()}
      format="relative"
      trackerPosition={state.tracker}
    >
      <ChartRow height="100" debug={false}>
        <Brush
          timeRange={state.brushrange}
          allowSelectionClear
          onTimeRangeChanged={handleTimeRangeChange}
        />
        <YAxis
          id="axis1"
          label="Altitude (ft)"
          min={0}
          max={channels.altitude.max}
          width={70}
          type="linear"
          format="d"
        />
        <Charts>
          <AreaChart
            axis="axis1"
            style={style.areaChartStyle()}
            columns={{ up: ["altitude"], down: [] }}
            series={channels.altitude.series}
          />
        </Charts>
      </ChartRow>
    </ChartContainer>
  );
};

export default RenderBrush;
