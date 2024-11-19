"use client";
// Removed unused import
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A mixed bar chart";

type ChartData = {
  chartKey: string;
  chartValue: number;
  label: string;
  fill: string;
};

const chartConfigFormatter = (chartLabel: string) => {
  return {
    chartValue: {
      label: chartLabel,
    },
  } as ChartConfig;
};

export function VerticalBarChart({
  title,
  description,
  chartLabel,
  footer,
  data,
}: {
  title: string;
  description: string;
  chartLabel: string;
  footer: string;
  data: ChartData[];
}) {
  const chartConfig = chartConfigFormatter(chartLabel);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
            />
            <XAxis
              dataKey="chartValue"
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => value + "%"}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="chartValue" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="leading-none text-muted-foreground">{footer}</div>
        </CardFooter>
      )}
    </Card>
  );
}
