import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import type { Event } from "@/firebase/interfaces/events";
import { VerticalBarChart } from "@/components/Charts/VerticalBarChart";
import { PieAccountabilityChart } from "@/components/Charts/PieAccountabilityChart";
import { BarAccountabilityChart } from "@/components/Charts/BarAccountabilityChart";
import { formatPriceToCLP } from "@/utils/parsePrice";

import { getEventsTicketsFromBigQueryFunction } from "@/firebase/functions/bigquery/getEventsTicketsFromBigQuery";
import { PieChartLegend } from "@/components/Charts/PieChartLegend";

const colorSelector = (index: number, colorType: string) => {
  const newIndex = index % 5;
  switch (newIndex) {
    case 0:
      return "hsl(var(--chart" + colorType + "-1))";
    case 1:
      return "hsl(var(--chart" + colorType + "-2))";
    case 2:
      return "hsl(var(--chart" + colorType + "-3))";
    case 3:
      return "hsl(var(--chart" + colorType + "-4))";
    case 4:
      return "hsl(var(--chart" + colorType + "-5))";
    default:
      return "hsl(var(--chart" + colorType + "-1))";
  }
};

type RequiredMetadataCountsState = {
  [key: string]: {
    counts: { [key: string]: number };
    total: number;
    label: string;
  };
};

export default function EventAccountablity({
  event,
  eventId,
}: {
  event: Event;
  eventId: string;
}) {
  const [requiredMetadataCountsState, setRequiredMetadataCountsState] =
    useState<RequiredMetadataCountsState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId || !event?.operations) return;
    getEventsTicketsFromBigQueryFunction({ eventId: eventId as string }).then(
      (result) => {
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
                if (!metadataCount.counts[value]) {
                  metadataCount.counts[value] = 0;
                }
                metadataCount.counts[value]++;
                metadataCount.total++;
              }
            }
          });
        });
        setRequiredMetadataCountsState(requiredMetadataCounts);
        setLoading(false);
      }
    );
  }, [eventId, event?.operations]);
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid xs={12} md={6} xl={4}>
        <VerticalBarChart
          title="Progreso por ticket"
          description="% del total vendido por ticket"
          chartLabel="% vendido"
          footer={
            "Has vendido un " +
            Math.round(
              (event.stats.ticketSelledCount * 100) / event.stats.ticketTotal
            ) +
            "% de los tickets"
          }
          data={[
            ...event.schedule.map((schedule, index) => ({
              chartKey: String(index),
              label: schedule.name,
              chartValue:
                (schedule.ticketSelledCount * 100) / schedule.ticketTotal,
              fill: colorSelector(index, ""),
            })),
          ]}
        />
      </Grid>
      <Grid xs={12} md={6} xl={4}>
        <PieAccountabilityChart
          totalValue={event.stats.ticketSelledCount}
          title="Desglose tickets vendidos"
          description="Cantidad vendida por ticket"
          chartLabel="vendidos"
          footer={
            "Faltan " +
            (event.stats.ticketTotal - event.stats.ticketSelledCount) +
            " tickets por vender"
          }
          data={[
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
          ]}
        ></PieAccountabilityChart>
      </Grid>
      <Grid xs={12} md={6} xl={4}>
        <BarAccountabilityChart
          title="Desglose ingresos por venta"
          description="Ingresos por ticket CLP"
          chartLabel="CLP"
          footer={
            "Ha vendido " +
            formatPriceToCLP(event.stats.totalSelled) +
            " en total"
          }
          data={[
            ...event.schedule.map((schedule, index) => ({
              label: schedule.name,
              chartValue: schedule.totalSelled,
              chartKey: String(index),
              fill: colorSelector(index, ""),
            })),
          ]}
        ></BarAccountabilityChart>
      </Grid>
      {event.stats.totalReselledFee > 0 && (
        <>
          <Grid xs={12} md={6} xl={4}>
            <PieAccountabilityChart
              totalValue={event.stats.ticketReselledCount}
              title="Desglose tickets revendidos"
              description="Cantidad revendidos por ticket"
              chartLabel="revendidos"
              footer={
                "Se han revendido " +
                event.stats.ticketReselledCount +
                " tickets"
              }
              data={[
                ...event.schedule.map((schedule, index) => ({
                  label: schedule.name,
                  chartKey: String(index),
                  chartValue: schedule.ticketReselledCount,
                  fill: colorSelector(index, "-sapphire"),
                })),
              ]}
            ></PieAccountabilityChart>
          </Grid>
          <Grid xs={12} md={6} xl={4}>
            <BarAccountabilityChart
              title="Desglose ingresos por reventa"
              description="Ingresos por reventa CLP"
              chartLabel="CLP"
              footer={
                "Tienes " +
                formatPriceToCLP(
                  (event.stats.totalReselled +
                    event.stats.resellDeltaEarnings || 0) *
                    event.resell.resellFee
                ) +
                " de ingresos por reventa"
              }
              data={[
                ...event.schedule.map((schedule, index) => ({
                  label: schedule.name,
                  chartValue:
                    schedule.totalReselled * (1 - event.resell.resellFee),
                  chartKey: String(index),
                  fill: colorSelector(index, "-sapphire"),
                })),
                {
                  label: "Delta Reventa",
                  chartValue:
                    (event.stats.resellDeltaEarnings || 0) *
                    (1 - event.resell.resellFee),
                  fill: "#34D399",
                  chartKey: "Delta Reventa",
                },
              ]}
            ></BarAccountabilityChart>
          </Grid>
          <Grid xs={12} md={6} xl={4}>
            <BarAccountabilityChart
              title="Desglose ingresos totales"
              description="Ingresos totales CLP (venta + reventa)"
              chartLabel="CLP"
              footer={
                "Ha vendido " +
                formatPriceToCLP(event.stats.totalSelled) +
                " en total"
              }
              data={[
                ...event.schedule.map((schedule, index) => ({
                  label: schedule.name,
                  chartValue:
                    schedule.totalReselled -
                    schedule.totalReselledFee +
                    schedule.totalSelled,
                  chartKey: String(index),
                  fill: colorSelector(index, ""),
                })),
                {
                  label: "Delta Reventa",
                  chartKey: "Delta Reventa",

                  chartValue:
                    (event.stats.resellDeltaEarnings || 0) *
                    (1 - event.resell.resellFee),
                  fill: "#34D399",
                },
              ]}
            ></BarAccountabilityChart>
          </Grid>
        </>
      )}
      {(event.stats.ticketValidated ?? 0) > 0 && (
        <Grid xs={12} md={6} xl={4}>
          <PieAccountabilityChart
            title="Tickets validados"
            description="Cantidad validada de tickets"
            chartLabel="validados"
            footer={
              "Faltan " +
              (event.stats.ticketTotal - event.stats.ticketValidated) +
              " tickets por validar"
            }
            totalValue={event.stats.ticketValidated}
            data={[
              {
                label: "Validados",
                chartKey: "Validados",
                chartValue: event.stats.ticketValidated,
                fill: "black",
              },
              {
                label: "Faltantes",
                chartKey: "Faltantes",
                chartValue:
                  event.stats.ticketTotal - event.stats.ticketValidated,
                fill: "#adacaa",
              },
            ]}
          ></PieAccountabilityChart>
        </Grid>
      )}

      {event.operations?.requiredMetadata?.length > 0 &&
        !loading &&
        Object.keys(requiredMetadataCountsState).map((key) => {
          const item = requiredMetadataCountsState[key];
          if (!item) return null;
          return (
            <Grid xs={12} md={6} xl={4} key={key}>
              <PieChartLegend
                title={""}
                description={"Desglose por " + item.label}
                chartLabel="tickets"
                data={[
                  ...Object.keys(item.counts).map((count, index) => {
                    const itemCount = item.counts[count];
                    return {
                      label: count,
                      chartValue: itemCount ?? 0,
                      chartKey: count,
                      fill: colorSelector(index, "-rainbow"),
                    };
                  }),
                ]}
              ></PieChartLegend>{" "}
            </Grid>
          );
        })}
    </Grid>
  );
}
