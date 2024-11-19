import WithAuth from "@/components/Auth/WithAuth";
import ProducerForm from "@/components/Producer/ProducerForm";
import React from "react";

export default function ProducerCreate() {
  return (
    <WithAuth admin>
      <ProducerForm />
    </WithAuth>
  );
}
