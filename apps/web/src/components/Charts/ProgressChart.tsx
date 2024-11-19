import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// Define the data structure
type ProgressBarData = {
  name: string;
  progress: number;
  fill: string; // Color for each progress bar
};

const HorizontalProgressBarChart = ({ data }: { data: ProgressBarData[] }) => {
  const formatToPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={formatToPercentage}
        />
        <YAxis type="category" dataKey="name" />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Progreso"]}
        />
        <Bar
          dataKey="progress"
          isAnimationActive={false}
          background={{ fill: "#eee" }}
        >
          <LabelList
            dataKey="progress"
            position="right"
            formatter={formatToPercentage}
          />
          {data.map((entry, index) => (
            <Bar key={index} dataKey="progress" fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalProgressBarChart;
