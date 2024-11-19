import React from "react";
import type { Event } from "@/firebase/interfaces/events";
import { formatPriceToCLP } from "@/utils/parsePrice";
import Grid from "@mui/material/Unstable_Grid2";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import { useAuthContext } from "@/context/AuthContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import DashboardCard from "@/components/Charts/Card";
import SelledCard from "@/components/Charts/SelledCard";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import { useProducerContext } from "@/context/ProducerContext";
import { Box } from "@mui/material";
import LocalAtmRoundedIcon from "@mui/icons-material/LocalAtmRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import SupervisedUserCircleRoundedIcon from "@mui/icons-material/SupervisedUserCircleRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
const AdminDashboard = ({ event }: { event: Event }) => (
  <Grid
    container
    spacing={{ xs: 2, md: 3 }}
    justifyContent="start"
    alignItems="sart"
  >
    <Grid xs={12} md={6} lg={3}>
      <SelledCard
        title="Tickets vendidos"
        count={event.stats.ticketSelledCount}
        icon={<LocalActivityRoundedIcon />}
      />
    </Grid>
    <Grid xs={12} md={6} lg={3}>
      <SelledCard
        title="Tickets revendidos"
        count={event.stats.ticketReselledCount}
        icon={<ConfirmationNumberRoundedIcon />}
      />
    </Grid>
    <Grid xs={12} md={6} lg={3}>
      <SelledCard
        title="Comisión por venta"
        count={formatPriceToCLP(event.stats.serviceFeeSelled)}
        icon={<LocalAtmRoundedIcon />}
      />
    </Grid>
    <Grid xs={12} md={6} lg={3}>
      <SelledCard
        title="Comisión por reventa"
        count={formatPriceToCLP(
          (event.stats.totalReselled + event.stats.resellDeltaEarnings || 0) *
            event.resell.resellFee
        )}
        icon={<CurrencyExchangeRoundedIcon />}
      />
    </Grid>
    <Grid xs={12} md={6} lg={4}>
      <DashboardCard
        title="Comisión Total"
        count={formatPriceToCLP(
          event.stats.serviceFeeSelled +
            (event.stats.totalReselled + event.stats.resellDeltaEarnings || 0) *
              event.resell.resellFee
        )}
        color="secondary"
        icon={<AccountBalanceRoundedIcon />}
      />
    </Grid>
    <Grid xs={12} md={6} lg={4}>
      <DashboardCard
        title="Recaudado por el productor"
        count={formatPriceToCLP(
          (event.stats.totalReselled + event.stats.resellDeltaEarnings || 0) *
            (1 - event.resell.resellFee) +
            event.stats.totalSelled
        )}
        color="error"
        icon={<SupervisedUserCircleRoundedIcon />}
      />
    </Grid>
    <Grid xs={12} md={6} lg={4}>
      <DashboardCard
        title="Recaudación Total (No toma en cuenta el dinero a transferir por reventa)"
        count={formatPriceToCLP(
          event.stats.totalWithServiceFeeSelled +
            event.stats.totalReselled +
            (event.stats.resellDeltaEarnings || 0)
        )}
        color="info"
        icon={<SavingsRoundedIcon />}
      />
    </Grid>
  </Grid>
);

const ProducerDashboard = ({ event }: { event: Event }) => (
  <Box>
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      justifyContent="space-between"
      alignItems="start"
    >
      <Grid xs={12} md={6} lg={3}>
        <SelledCard
          title="Tickets vendidos"
          count={event.stats.ticketSelledCount}
          icon={<LocalActivityRoundedIcon />}
        />
      </Grid>
      <Grid xs={12} md={6} lg={3}>
        <SelledCard
          title="Tickets revendidos"
          count={event.stats.ticketReselledCount}
          icon={<ConfirmationNumberRoundedIcon />}
        />
      </Grid>
      <Grid xs={12} md={6} lg={3}>
        <SelledCard
          title="Ingresos por venta"
          count={formatPriceToCLP(event.stats.totalSelled)}
          icon={<LocalAtmRoundedIcon />}
        />
      </Grid>
      <Grid xs={12} md={6} lg={3}>
        <SelledCard
          title="Ingresos por reventa"
          count={formatPriceToCLP(
            (event.stats.totalReselled + event.stats.resellDeltaEarnings || 0) *
              (1 - event.resell.resellFee)
          )}
          icon={<LocalAtmRoundedIcon />}
        />
      </Grid>
    </Grid>
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid xs={12} md={6} lg={4}>
        <DashboardCard
          title="Ingresos Totales"
          count={formatPriceToCLP(
            (event.stats.totalReselled + event.stats.resellDeltaEarnings || 0) *
              (1 - event.resell.resellFee) +
              event.stats.totalSelled
          )}
          color="secondary"
          icon={<AccountBalanceRoundedIcon />}
        />
      </Grid>
    </Grid>
  </Box>
);

export default function EventPage({ event }: { event: Event }) {
  const { isAdmin } = useAuthContext();
  const { producerId } = useProducerContext();

  if (!event) {
    return (
      <div>
        <h1>
          <LoadingComponent />
        </h1>
      </div>
    );
  }

  if (!isAdmin && producerId !== event.producer.id) {
    return <Unauthorized />;
  }

  return isAdmin ? (
    <AdminDashboard event={event} />
  ) : (
    <ProducerDashboard event={event} />
  );
}
