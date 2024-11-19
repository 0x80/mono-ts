import WithAuth from "@/components/Auth/WithAuth";
import ProducerEventsTable from "@/components/Producer/Events";
import React from "react";

export default function ProducerEvents() {
  return (
    <WithAuth producer>
      <ProducerEventsTable />
    </WithAuth>
  );
}
