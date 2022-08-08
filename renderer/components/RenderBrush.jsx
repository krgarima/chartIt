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
      timeRange={channels.Fp1.series.range()}
      format="relative"
      trackerPosition={state.tracker}
    >
      <ChartRow height="25" debug={false}>
        <Brush
          timeRange={state.brushrange}
          allowSelectionClear
          onTimeRangeChanged={handleTimeRangeChange}
        />
        <YAxis id="axis1" min={0} width={70} type="linear" format="m" />
        <Charts>
          <AreaChart
            axis="axis1"
            style={style.areaChartStyle()}
            series={channels.Fp1.series}
          />
        </Charts>
      </ChartRow>
    </ChartContainer>
  );
};

export default RenderBrush;
