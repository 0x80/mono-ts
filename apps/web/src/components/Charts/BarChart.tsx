import { formatPriceToCLP } from "@/utils/parsePrice";
import React from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SimpleBarChart({
  data,
}: {
  data: {
    name: string;
    Vendido: number;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatPriceToCLP} />
        <Tooltip
          formatter={(value) => [formatPriceToCLP(Number(value)), "Vendido"]}
        />
        <Legend />
        <Bar dataKey="Vendido" shape={<Rectangle />} />
      </BarChart>
    </ResponsiveContainer>
  );
}
