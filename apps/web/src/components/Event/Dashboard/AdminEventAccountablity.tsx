import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import type { Event } from "@/firebase/interfaces/events";
import { VerticalBarChart } from "@/components/Charts/VerticalBarChart";
import { PieAccountabilityChart } from "@/components/Charts/PieAccountabilityChart";
import { BarAccountabilityChart } from "@/components/Charts/BarAccountabilityChart";
import { formatPriceToCLP } from "@/utils/parsePrice";
import { getEventsTicketsFromBigQueryFunction } from "@/firebase/functions/bigquery/getEventsTicketsFromBigQuery";
import { PieChartLegend } from "@/components/Charts/PieChartLegend";

const colorSelector = (index: number, colorType: string) => {
  const colors = [
    "hsl(var(--chart" + colorType + "-1))",
    "hsl(var(--chart" + colorType + "-2))",
    "hsl(var(--chart" + colorType + "-3))",
    "hsl(var(--chart" + colorType + "-4))",
    "hsl(var(--chart" + colorType + "-5))",
  ];
  return colors[index % colors.length] ?? "hsl(var(--chart-1))";
};

type RequiredMetadataCountsState = {
  [key: string]: {
    counts: { [key: string]: number };
    total: number;
    label: string;
  };
};

type PaymentMethodsCount = {
  webPay: { label: string; count: number; color: string };
  khipu: { label: string; count: number; color: string };
  floid: { label: string; count: number; color: string };
  presencial: { label: string; count: number; color: string };
  free: { label: string; count: number; color: string };
  generated: { label: string; count: number; color: string };
};

export default function AdminEventAccountablity({
  event,
  eventId,
}: {
  event: Event;
  eventId: string;
}) {
  const [requiredMetadataCountsState, setRequiredMetadataCountsState] =
    useState<RequiredMetadataCountsState>({});
  const [loading, setLoading] = useState(true);
  const [paymentMethodsCount, setPaymentMethodsCount] =
    useState<PaymentMethodsCount>({
      webPay: { label: "WebPay", count: 0, color: "#ff3d3d" },
      khipu: { label: "Khipu", count: 0, color: "#983dff" },
      floid: { label: "Floid", count: 0, color: "#ffe23d" },
      presencial: {
        label: "Manual",
        count: 0,
        color: colorSelector(0, "-rainbow"),
      },
      free: { label: "Gratis", count: 0, color: colorSelector(1, "-rainbow") },
      generated: {
        label: "Generados",
        count: 0,
        color: colorSelector(2, "-rainbow"),
      },
    });
  const fetchCalledRef = useRef(false);
  useEffect(() => {
    // Prevent re-initializing if fetchData has already run
    if (!eventId || !event?.operations || fetchCalledRef.current) return;

    const fetchData = async () => {
      fetchCalledRef.current = true;
      const result = await getEventsTicketsFromBigQueryFunction({
        eventId: eventId as string,
      });

      const paymentMethodsCountTemp = {
        webPay: { label: "WebPay", count: 0, color: "#ff3d3d" },
        khipu: { label: "Khipu", count: 0, color: "#983dff" },
        floid: { label: "Floid", count: 0, color: "#ffe23d" },
        presencial: {
          label: "Manual",
          count: 0,
          color: colorSelector(0, "-rainbow"),
        },
        free: {
          label: "Gratis",
          count: 0,
          color: colorSelector(1, "-rainbow"),
        },
        generated: {
          label: "Generados",
          count: 0,
          color: colorSelector(2, "-rainbow"),
        },
      };

      const requiredMetadataCounts: RequiredMetadataCountsState = {};

      result.data.forEach((doc) => {
        const metadata = JSON.parse(doc.metadata);

        event.operations?.requiredMetadata?.forEach((field) => {
          if (field.type !== "select") return;
          if (!requiredMetadataCounts[field.name]) {
            requiredMetadataCounts[field.name] = {
              counts: {},
              total: 0,
              label: field.label,
            };
          }

          const value = metadata[field.name];
          if (value) {
            const metadataCount = requiredMetadataCounts[field.name];
            if (metadataCount) {
              if (!metadataCount.counts) {
                metadataCount.counts = {};
              }
              metadataCount.counts[value] =
                (metadataCount.counts[value] || 0) + 1;
              metadataCount.total++;
            }
          }
        });
        const paymentMethod =
          doc.channel as keyof typeof paymentMethodsCountTemp;
        try {
          paymentMethodsCountTemp[paymentMethod].count++;
        } catch {
          paymentMethodsCountTemp[paymentMethod] = {
            label: paymentMethod,
            count: 1,
            color: colorSelector(5, "-rainbow"),
          };
        }
      });
      setRequiredMetadataCountsState(requiredMetadataCounts);

      setPaymentMethodsCount(paymentMethodsCountTemp);
      setLoading(false);
    };

    fetchData();
  }, [eventId, event?.operations]);

  const renderCharts = () => {
    const charts = [
      {
        component: VerticalBarChart,
        props: {
          title: "Progreso por ticket",
          description: "% del total vendido por ticket",
          chartLabel: "% vendido",
          footer: `Has vendido un ${Math.round(
            (event.stats.ticketSelledCount * 100) / event.stats.ticketTotal
          )}% de los tickets`,
          data: event.schedule.map((schedule, index) => ({
            chartKey: String(index),
            label: schedule.name,
            chartValue:
              (schedule.ticketSelledCount * 100) / schedule.ticketTotal,
            fill: colorSelector(index, ""),
          })),
        },
      },
      {
        component: PieAccountabilityChart,
        props: {
          title: "Desglose tickets vendidos",
          description: "Cantidad vendida por ticket",
          chartLabel: "vendidos",
          footer: `Faltan ${
            event.stats.ticketTotal - event.stats.ticketSelledCount
          } tickets por vender`,
          totalValue: event.stats.ticketSelledCount,
          data: [
            ...event.schedule.map((schedule, index) => ({
              label: schedule.name,
              chartKey: String(index),
              chartValue: schedule.ticketSelledCount,
              fill: colorSelector(index, ""),
            })),
            {
              label: "Faltantes",
              chartKey: "Faltantes",
              chartValue:
                event.stats.ticketTotal - event.stats.ticketSelledCount,
              fill: "#adacaa",
            },
          ],
        },
      },
      {
        component: BarAccountabilityChart,
        props: {
          title: "Desglose ingresos por venta",
          description: "Ingresos por ticket CLP",
          chartLabel: "CLP",
          footer: `Ha vendido ${formatPriceToCLP(
            event.stats.totalSelled
          )} en total`,
          data: event.schedule.map((schedule, index) => ({
            label: schedule.name,
            chartValue: schedule.totalSelled,
            chartKey: String(index),
            fill: colorSelector(index, ""),
          })),
        },
      },
    ];

    if (event.stats.totalReselledFee > 0) {
      charts.push(
        {
          component: PieAccountabilityChart,
          props: {
            title: "Desglose tickets revendidos",
            description: "Cantidad revendidos por ticket",
            chartLabel: "revendidos",
            footer: `Se han revendido ${event.stats.ticketReselledCount} tickets`,
            totalValue: event.stats.ticketReselledCount,
            data: event.schedule.map((schedule, index) => ({
              label: schedule.name,
              chartKey: String(index),
              chartValue: schedule.ticketReselledCount,
              fill: colorSelector(index, "-sapphire"),
            })),
          },
        },
        {
          component: BarAccountabilityChart,
          props: {
            title: "Desglose ingresos por reventa",
            description: "Ingresos por reventa CLP",
            chartLabel: "CLP",
            footer: `Tienes ${formatPriceToCLP(
              (event.stats.totalReselledFee + event.stats.resellDeltaEarnings ||
                0) * event.resell.resellFee
            )} de ingresos por reventa`,
            data: [
              ...event.schedule.map((schedule, index) => ({
                label: schedule.name,
                chartValue: schedule.totalReselled * event.resell.resellFee,
                chartKey: String(index),
                fill: colorSelector(index, "-sapphire"),
              })),
              {
                label: "Delta Reventa",
                chartValue:
                  (event.stats.resellDeltaEarnings || 0) *
                  event.resell.resellFee,
                fill: "#34D399",
                chartKey: "Delta Reventa",
              },
            ],
          },
        },
        {
          component: BarAccountabilityChart,
          props: {
            title: "Desglose ingresos totales",
            description: "Ingresos totales CLP (venta + reventa)",
            chartLabel: "CLP",
            footer: `Ha vendido ${formatPriceToCLP(
              event.stats.totalSelled
            )} en total`,
            data: [
              ...event.schedule.map((schedule, index) => ({
                label: schedule.name,
                chartValue:
                  schedule.totalReselled * event.resell.resellFee +
                  schedule.totalSelled,
                chartKey: String(index),
                fill: colorSelector(index, ""),
              })),
              {
                label: "Delta Reventa",
                chartKey: "Delta Reventa",
                chartValue:
                  (event.stats.resellDeltaEarnings || 0) *
                  event.resell.resellFee,
                fill: "#34D399",
              },
            ],
          },
        }
      );
    }

    if ((event.stats.ticketValidated ?? 0) > 0) {
      charts.push({
        component: PieAccountabilityChart,
        props: {
          title: "Tickets validados",
          description: "Cantidad validada de tickets",
          chartLabel: "validados",
          footer: `Faltan ${
            event.stats.ticketTotal - event.stats.ticketValidated
          } tickets por validar`,
          totalValue: event.stats.ticketValidated,
          data: [
            {
              label: "Validados",
              chartKey: "Validados",
              chartValue: event.stats.ticketValidated,
              fill: "black",
            },
            {
              label: "Faltantes",
              chartKey: "Faltantes",
              chartValue: event.stats.ticketTotal - event.stats.ticketValidated,
              fill: "#adacaa",
            },
          ],
        },
      });
    }

    return charts.map(({ component: Component, props }, index) => (
      <Grid xs={12} md={6} xl={4} key={index}>
        <Component {...props} />
      </Grid>
    ));
  };

  const renderMetadataCharts = () => {
    if (loading || !event.operations?.requiredMetadata?.length) return null;

    return Object.keys(requiredMetadataCountsState).map((key) => {
      const item = requiredMetadataCountsState[key];
      if (!item) return null;
      return (
        <Grid xs={12} md={6} xl={4} key={key}>
          <PieChartLegend
            title=""
            description={`Desglose por ${item.label}`}
            chartLabel="tickets"
            data={Object.keys(item.counts).map((count, index) => ({
              label: count,
              chartValue: item.counts[count] ?? 0,
              chartKey: count,
              fill: colorSelector(index, "-rainbow"),
            }))}
          />
        </Grid>
      );
    });
  };

  const renderPaymentMethodChart = () => {
    if (loading) return null;

    return (
      <Grid xs={12} md={6} xl={4}>
        <PieChartLegend
          title=""
          description="Desglose por método de pago"
          chartLabel="tickets"
          data={Object.keys(paymentMethodsCount)
            .filter(
              (key) =>
                paymentMethodsCount[key as keyof PaymentMethodsCount].count > 0
            )
            .map((key) => {
              const paymentKey = key as keyof PaymentMethodsCount;
              const item = paymentMethodsCount[paymentKey];
              return {
                label: item.label,
                chartValue: item.count,
                chartKey: item.label,
                fill: item.color,
              };
            })}
        />
      </Grid>
    );
  };

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} className="sapphire">
      {renderCharts()}
      {renderMetadataCharts()}
      {renderPaymentMethodChart()}
    </Grid>
  );
}
