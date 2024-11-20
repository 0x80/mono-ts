import type { Schedule } from "@repo/types";

export type TicketCount = {
  name: string;
  count: number;
};

const checkResellable = (
  count: number,
  base: number,
  resellQueueNumber: number
): boolean => {
  if (base % resellQueueNumber === 0) return true;
  return Array.from({ length: count }, (_, i) => base + i + 1).some(
    (num) => num % resellQueueNumber === 0
  );
};

export const calculateResellingCount = (
  count: number,
  schedule: Schedule,
  resellQueueNumber: number,
  hasResell: boolean
): { normalCount: number; resellingCount: number } => {
  if (!hasResell) return { normalCount: count, resellingCount: 0 };

  if (resellQueueNumber === 0) {
    const resellingCount = Math.min(schedule.resellingTickets, count);
    return { normalCount: count - resellingCount, resellingCount };
  }

  const canResell = checkResellable(
    count,
    schedule.ticketCount + schedule.ticketResellCount,
    resellQueueNumber
  );

  if (schedule.ticketTotal - schedule.ticketCount < count) {
    const resellingCount =
      count - (schedule.ticketTotal - schedule.ticketCount);
    return {
      normalCount: schedule.ticketTotal - schedule.ticketCount,
      resellingCount,
    };
  }

  if (canResell && schedule.resellingTickets > 0) {
    return { normalCount: count - 1, resellingCount: 1 };
  }

  return { normalCount: count, resellingCount: 0 };
};
