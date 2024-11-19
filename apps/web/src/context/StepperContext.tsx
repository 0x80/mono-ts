import type { EventForm } from "@/firebase/interfaces/events";
import {
  createContext,
  useState,
  useContext,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";

type StepperContextType = {
  event: EventForm;
  setEvent: Dispatch<SetStateAction<EventForm>>;
};

export const StepperContext = createContext<StepperContextType>({
  event: {
    operations: { requiredMetadata: [], hasNonUserSell: false },
    info: {
      description: "",
      end: "",
      image: "",
      name: "",
      start: "",
      activationDate: 0,
      tags: [],
      isConcurrent: false,
      isExternal: false,
      externalUrl: "",
      activityType: "",
    },
    resell: {
      hasResell: true,
      resellQueueNumber: 0,
      resellHighestPrice: false,
      resellFee: 0.5,
    },
    finance: {
      serviceFee: 0,
      serviceFeeType: "Percentage",
      serviceFeeHidden: false,
    },
    location: {
      address: "",
      name: "",
      lat: 0,
      lng: 0,
    },
    schedule: [],
    producer: {
      image: "",
      name: "",
      id: "",
      ratings: {
        ratingPoint: 0,
        ratingTotal: 0,
        ratingNumber: 0,
      },
      earlyHash: "",
    },
    weekSchedule: {
      sunday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      monday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      tuesday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      wednesday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      thursday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      friday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      saturday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
    },
  },
  setEvent: () => {},
});

export const useStepperContext = () => {
  const { event, setEvent } = useContext(StepperContext);
  return { event, setEvent };
};

type StepperContextProviderProps = {
  children: ReactNode;
};

export const StepperContextProvider = ({
  children,
}: StepperContextProviderProps) => {
  const [event, setEvent] = useState<EventForm>({
    operations: { requiredMetadata: [], hasNonUserSell: false },
    info: {
      description: "",
      end: "",
      image: "",
      name: "",
      start: "",
      activationDate: 0,
      tags: [],
      isConcurrent: false,
      isExternal: false,
      externalUrl: "",
      activityType: "",
    },
    finance: {
      serviceFee: 0,
      serviceFeeType: "Percentage",
      serviceFeeHidden: false,
    },
    location: {
      address: "",
      name: "",
      lat: 0,
      lng: 0,
    },
    schedule: [],
    producer: {
      image: "",
      name: "",
      id: "",
      ratings: {
        ratingPoint: 0,
        ratingTotal: 0,
        ratingNumber: 0,
      },
      earlyHash: "",
    },
    resell: {
      hasResell: true,
      resellQueueNumber: 0,
      resellHighestPrice: false,
      resellFee: 0.5,
    },
    weekSchedule: {
      sunday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      monday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      tuesday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      wednesday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      thursday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      friday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
      saturday: {
        start: 480,
        end: 1200,
        ticketTotal: 0,
        slotRange: 0,
      },
    },
  });

  return (
    <StepperContext.Provider value={{ event, setEvent }}>
      {children}
    </StepperContext.Provider>
  );
};
