import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { Producer } from "@/firebase/interfaces/producers";
import { streamProducer } from "@/firebase/db/producers";
import ProducerForm from "@/components/Producer/ProducerForm";
import { useProducerContext } from "@/context/ProducerContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import { useAuthContext } from "@/context/AuthContext";

export default function EventEdit() {
  const [producerEdit, setProducerEdit] = useState<Producer | null>(null);
  const router = useRouter();
  const producerId = router.query.producerId as string;
  const producerContext = useProducerContext();
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    const unsubscribe = streamProducer(
      producerId,
      async (snapshot) => {
        const producerData = snapshot.data() as Producer;

        setProducerEdit({
          ...producerData,
          image: producerData.image,
          backgroundImage: producerData.backgroundImage,
        });
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, [producerId]);
  return isAdmin || producerId == producerContext.producerId ? (
    <>
      {producerEdit !== null && (
        <ProducerForm
          edit
          producerEdit={producerEdit}
          producerId={producerId}
        />
      )}
    </>
  ) : (
    <Unauthorized></Unauthorized>
  );
}
