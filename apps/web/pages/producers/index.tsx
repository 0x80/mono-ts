import WithAuth from "@/components/Auth/WithAuth";
import ProducerHome from "@/components/Producer/Home";
import React from "react";

export default function ProducerHomePage() {
  return (
    <WithAuth producer>
      <ProducerHome></ProducerHome>
    </WithAuth>
  );
}
