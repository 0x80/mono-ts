import EventStepper from "@/components/Event/Stepper/Stepper";
import { StepperContextProvider } from "@/context/StepperContext";
import React, { useState, useEffect } from "react";
import { streamEvent } from "@/firebase/db/events";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useProducerContext } from "@/context/ProducerContext";
import { useAuthContext } from "@/context/AuthContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import type { EventForm, Event } from "@/firebase/interfaces/events";

function formatDateToISO(date: Date | undefined): string {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
};

export default function EventEdit() {
  const [eventEdit, setEventEdit] = useState<EventForm | null>(null);
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const { producerId } = useProducerContext();
  const { isAdmin } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;

      const unsubscribe = streamEvent(
        eventId,
        async (snapshot) => {
          const eventData = snapshot.data() as Event;
          const base64Image = await imageUrlToBase64(eventData.info.image);
          sessionStorage.setItem("uploadedFile", base64Image);
          const info = {
            name: eventData.info.name,
            description: eventData.info.description.replaceAll("!&!", "\n"),
            image: base64Image,
            start: formatDateToISO(eventData.info.start?.toDate()) ?? "",
            end: formatDateToISO(eventData.info.end?.toDate()) ?? "",
            activationDate: eventData.info.activationDate,
            tags: eventData.info.tags ?? [],
            isConcurrent: eventData.info.isConcurrent,
            isExternal: eventData.info.isExternal ?? false,
            externalUrl: eventData.info.externalUrl ?? "",
            activityType: eventData.info.activityType,
            spotifyUrl: eventData.info.spotifyUrl ?? "",
          };
          setEventEdit({
            info: info,
            finance: {
              serviceFee: Number(eventData.finance.serviceFee),
              serviceFeeType: eventData.finance.serviceFeeType,
              serviceFeeHidden: eventData.finance.serviceFeeHidden ?? false,
            },
            location: eventData.location,
            producer: {
              image: eventData.producer.image,
              name: eventData.producer.name,
              id: eventData.producer.id,
              domains: eventData.producer.domains ?? [],
              ratings: eventData.producer.ratings,
              earlyHash: eventData.producer.earlyHash ?? "",
            },
            schedule: eventData.schedule.map((schedule) => ({
              name: schedule.name,
              price: schedule.price,
              ticketTotal: schedule.ticketTotal,
              maxTicketPerBuy: schedule.maxTicketPerBuy,
              id: uuidv4(),
              type: schedule.type || "normal",
              description: schedule.description || "",
            })),
            resell: {
              hasResell: eventData.resell.hasResell,
              resellQueueNumber: eventData.resell.resellQueueNumber,
              resellHighestPrice: eventData.resell.resellHighestPrice,
              resellFee: eventData.resell.resellFee,
            },
            weekSchedule: eventData.weekSchedule!,
            operations: {
              requiredMetadata: eventData.operations.requiredMetadata,
              hasNonUserSell: eventData.operations.hasNonUserSell ?? false,
            },
          });
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    };

    loadEvent();
  }, [eventId]);
  if (isLoading || isAdmin === undefined || (!isAdmin && !producerId)) {
    return <LoadingComponent />;
  }

  if (!isAdmin && producerId !== eventEdit?.producer.id) {
    return <Unauthorized />;
  }

  return (
    <StepperContextProvider>
      {eventEdit !== null && (
        <EventStepper edit eventEdit={eventEdit} eventId={eventId} />
      )}
    </StepperContextProvider>
  );
}
