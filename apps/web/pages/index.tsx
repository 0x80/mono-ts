import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { user, isAdmin, isProducer } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      if (isAdmin) router.push("/admin");
      if (isProducer) router.push("/producers");
    } else {
      router.push("/auth/login");
    }
  }, [router, user, isAdmin, isProducer]);
  return <div></div>;
}
