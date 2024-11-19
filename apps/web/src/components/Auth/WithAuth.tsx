import { useAuthContext } from "@/context/AuthContext";
import React, { type ReactNode } from "react";
import Unauthorized from "./Unauthorized";

export default function WithAuth({
  children,
  admin = false,
  producer = false,
}: {
  children: ReactNode;
  admin?: boolean;
  producer?: boolean;
}) {
  const { user, isAdmin, isProducer } = useAuthContext();
  if (!user) return <Unauthorized />;
  if (admin && producer) {
    if (isAdmin || isProducer) return <div>{children}</div>;
  }
  if (!isAdmin && admin) return <Unauthorized />;
  if (!isProducer && producer) return <Unauthorized />;

  return <div>{children}</div>;
}
