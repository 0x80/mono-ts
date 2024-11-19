"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { formatPriceToCLP } from "@/utils/parsePrice";

export const description = "A bar chart";

type ChartData = {
  chartKey: string;
  chartValue: number;
  label: string;
  fill: string;
};

const chartConfigFormatter = (chartLabel: string, data: ChartData[]) => {
  return {
    chartValue: {
      label: chartLabel,
    },
    ...data.map((item) => {
      return {
        label: item.label,
      };
    }),
  } as ChartConfig;
};

export function BarAccountabilityChart({
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
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigFormatter(chartLabel, data)}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis
              domain={[0, 50000]}
              tickFormatter={(value) => formatPriceToCLP(value)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="chartValue"
              fill="var(--color-chartValue)"
              radius={8}
            />
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
