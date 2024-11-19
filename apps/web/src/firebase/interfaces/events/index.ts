import type { Timestamp } from "@firebase/firestore";
import type { ProducerRating } from "../producers";

export type Info = {
  description: string;
  end: Timestamp | null;
  image: string;
  name: string;
  start: Timestamp | null;
  status: string;
  activationDate: number;
  tags: string[];
  isConcurrent: boolean;
  isExternal: boolean;
  externalUrl: string;
  activityType: string;
  spotifyUrl?: string;
};

export type Resell = {
  hasResell: boolean;
  resellQueueNumber: number;
  resellHighestPrice: boolean;
  resellFee: number;
};

export type InfoForm = {
  description: string;
  end: string | Date;
  image: string;
  name: string;
  start: string | Date;
  activationDate?: number;
  tags: string[];
  isConcurrent: boolean;
  isExternal: boolean;
  externalUrl: string;
  activityType: string;
  spotifyUrl?: string;
};

export type Finance = {
  serviceFee: number;
  serviceFeeType: string;
  serviceFeeHidden: boolean;
};

export type Location = {
  address: string;
  name: string;
  lat: number;
  lng: number;
};

export type EventProducer = {
  image: string;
  name: string;
  id: string;
  domains?: string[];
  ratings: ProducerRating;
  earlyHash?: string;
};

export type Schedule = {
  ticketCount: number;
  name: string;
  price: number;
  serviceFeeSelled: number;
  totalSelled: number;
  totalWithServiceFeeSelled: number;
  ticketTotal: number;
  maxTicketPerBuy: number;
  resellingTickets: number;
  totalReselled: number;
  totalReselledFee: number;
  ticketReselledCount: number;
  ticketSelledCount: number;
  type: string;
  description: string;
  visible?: boolean;
};

export type WeekScheduleDay = {
  start: number;
  end: number;
  ticketTotal: number;
  slotRange: number;
};

export type WeekSchedule = {
  [key: string]: WeekScheduleDay;
  sunday: WeekScheduleDay;
  monday: WeekScheduleDay;
  tuesday: WeekScheduleDay;
  wednesday: WeekScheduleDay;
  thursday: WeekScheduleDay;
  friday: WeekScheduleDay;
  saturday: WeekScheduleDay;
};

export type ScheduleForm = {
  name: string;
  price: number;
  ticketTotal: number;
  maxTicketPerBuy: number;
  id: string;
  type: string;
  description: string;
};

export type Stats = {
  serviceFeeSelled: number;
  totalSelled: number;
  totalWithServiceFeeSelled: number;
  ticketCount: number;
  ticketValidated: number;
  ticketTotal: number;
  resellingTickets: number;
  totalReselled: number;
  totalReselledFee: number;
  ticketReselledCount: number;
  ticketSelledCount: number;
  resellDeltaEarnings: number;
};

export type RequiredMetadata = {
  name: string;
  label: string;
  options: string[];
  type: string;
  obligatory: boolean;
  fillable?: boolean;
};

export type Operations = {
  validators: string[];
  blockedPaymentMethods: string[];
  validatorsData: { email: string; uid: string }[];
  requiredMetadata: RequiredMetadata[];
  hasNonUserSell: boolean;
};

export type Tasks = {
  expireTaskId?: string;
  activateTicketsId?: string;
};

export type Event = {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  info: Info;
  finance: Finance;
  location: Location;
  producer: EventProducer;
  schedule: Schedule[];
  weekSchedule?: WeekSchedule;
  stats: Stats;
  operations: Operations;
  tasks?: Tasks;
  resell: Resell;
};

export type EventForm = {
  info: InfoForm;
  finance: Finance;
  location: Location;
  producer: EventProducer;
  schedule: ScheduleForm[];
  weekSchedule: WeekSchedule;
  resell: Resell;
  operations: {
    requiredMetadata: RequiredMetadata[];
    hasNonUserSell: boolean;
  };
};

export type EventWithId = Event & {
  id: string;
};
