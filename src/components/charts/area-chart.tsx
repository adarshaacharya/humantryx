"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AreaChartProps {
  data?: Array<Record<string, string | number>> | undefined;
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  startEndOnly?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  height?: number;
}

export function AreaChartComponent({
  data,
  categories,
  index,
  colors = ["#1E40AF", "#3B82F6", "#93C5FD"],
  valueFormatter = (value: number) => `${value}`,
  startEndOnly = false,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  className,
  height = 300,
}: AreaChartProps) {
  // Handle case with no data
  if (!data?.length) {
    return (
      <div className="text-muted-foreground flex h-[300px] w-full items-center justify-center text-sm">
        No data available.
      </div>
    );
  }

  // Format tick labels
  const formatTick = (value: string) => {
    if (typeof value === "string") {
      // If it's too long, truncate it
      return value.length > 6 ? `${value.substring(0, 6)}...` : value;
    }
    return value;
  };

  const customTickFormatter = (value: any, index: number) => {
    if (startEndOnly) {
      // Only show the first and last tick labels
      return index === 0 || index === data.length - 1 ? formatTick(value) : "";
    }
    return formatTick(value);
  };

  // Custom tooltip formatter
  const renderTooltipContent = (props: any) => {
    const { active, payload } = props;

    if (active && payload?.length) {
      return (
        <div className="bg-background rounded-md border p-2 shadow-md">
          <div className="font-medium">{payload[0].payload[index]}</div>
          {categories.map((category, i) => (
            <div key={category} className="flex items-center gap-2 text-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="mr-1">{category}:</span>
              <span className="font-semibold">
                {valueFormatter(payload[0].payload[category] as number)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showXAxis && (
            <XAxis
              dataKey={index}
              tickFormatter={customTickFormatter}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
          )}
          {showYAxis && (
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => valueFormatter(value as number)}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={renderTooltipContent}
              cursor={{ stroke: "#ddd" }}
            />
          )}
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.6}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
