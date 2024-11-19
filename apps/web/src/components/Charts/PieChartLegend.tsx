import { Pie, PieChart, Cell, Legend, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
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
    data: data.map((item) => ({
      label: item.label,
    })),
  } as ChartConfig;
};

export function PieChartLegend({
  title,
  description,
  chartLabel,
  data,
}: {
  title: string;
  description: string;
  chartLabel: string;
  data: ChartData[];
}) {
  return (
    <Card className="flex flex-col">
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
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="label" />}
            />
            <Pie
              data={data}
              dataKey="chartValue"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              formatter={(value, entry) => {
                const item = data.find((d) => d.chartValue === entry.value);
                return item ? item.label : value;
              }}
              wrapperStyle={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "1rem",
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
