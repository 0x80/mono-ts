import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import type { EventStatsCollection } from "@/firebase/interfaces/events/stats";
import { getEventStats } from "@/firebase/db/events/stats";
import LoadingComponent from "../../Materials/LoadingComponent";
import DashboardCard from "@/components/Charts/Card";
import AdsClickRoundedIcon from "@mui/icons-material/AdsClickRounded";
const useStyles = makeStyles()((_) => ({
  loadingComponent: {
    height: "60px",
  },
  boldSpan: {
    fontWeight: "bold",
  },
}));

export default function ExternalClicked({
  eventId,
  dashboard = false,
}: {
  eventId: string;
  dashboard: boolean;
}) {
  const [stats, setStats] = useState<EventStatsCollection>({
    externalRedirected: 0,
    eventId: "",
  });
  const { classes } = useStyles();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    getEventStats(eventId).then((result) => {
      const statData = result.data();
      if (statData) {
        setStats(statData);
      }
      setLoading(false);
    });
  }, [eventId]);

  return loading ? (
    <div className={classes.loadingComponent}>
      <LoadingComponent />
    </div>
  ) : dashboard ? (
    <DashboardCard
      title="Clicks:"
      count={stats.externalRedirected}
      color="primary"
      icon={<AdsClickRoundedIcon />}
    ></DashboardCard>
  ) : (
    <div>
      <span className={classes.boldSpan}>{stats.externalRedirected}</span>{" "}
      clicks
    </div>
  );
}
