"use client";

import React from "react";
import { Label, Pie, PieChart } from "recharts";

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

export function PieAccountabilityChart({
  title,
  description,
  chartLabel,
  footer,
  data,
  totalValue,
}: {
  title: string;
  description: string;
  chartLabel: string;
  footer: string;
  data: ChartData[];
  totalValue?: number;
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfigFormatter(chartLabel, data)}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="chartValue"
              nameKey="chartKey"
              innerRadius={80}
              strokeWidth={5}
            >
              {totalValue && (
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalValue.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {chartLabel}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {footer != "" && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground"> {footer} </div>
        </CardFooter>
      )}
    </Card>
  );
}
