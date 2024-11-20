import { type Schedule, type Event, EventStatus } from "@repo/types";
import { calculateStats } from "../../orders/approve";
import { Timestamp } from "firebase-admin/firestore";

describe("calculateStats", () => {
  let eventData: Event;
  let newSchedules: Schedule[];

  beforeEach(() => {
    eventData = {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      info: {
        description: "Sample Event",
        end: Timestamp.now(),
        image: "sample_image_url",
        name: "Sample Event",
        start: Timestamp.now(),
        status: EventStatus.Active,
        activationDate: 1627890123,
        tags: ["music", "festival"],
        isConcurrent: false,
        type: "concert",
        isExternal: false,
        externalUrl: "",
        activityType: "activityType",
      },
      finance: {
        serviceFee: 0.1,
        serviceFeeType: "Percentage",
        serviceFeeHidden: false,
      },
      location: {
        address: "123 Sample Street",
        name: "Sample Venue",
        lat: 40.712776,
        lng: -74.005974,
      },
      producer: {
        name: "Sample Producer",
        id: "producer_123",
        image: "",
        ratings: {
          ratingPoint: 5,
          ratingTotal: 10,
          ratingNumber: 2,
        },
      },
      schedule: [],
      stats: {
        serviceFeeSelled: 0,
        totalSelled: 100,
        totalWithServiceFeeSelled: 0,
        ticketCount: 0,
        ticketResellCount: 0,
        ticketValidated: 0,
        ticketTotal: 0,
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        resellDeltaEarnings: 0,
      },
      operations: {
        validators: ["validator_1", "validator_2"],
        validatorsData: [
          { email: "validator1@example.com", uid: "validator_1" },
          { email: "validator2@example.com", uid: "validator_2" },
        ],
        requiredMetadata: [],
        hasNonUserSell: false,
      },
      tasks: {
        expireTaskId: "expire_task_123",
        activateTicketsId: "activate_task_123",
      },
      resell: {
        hasResell: true,
        resellQueueNumber: 10,
        resellHighestPrice: true,
        resellFee: 5,
      },
    };

    newSchedules = [
      {
        ticketCount: 10,
        ticketResellCount: 2,
        name: "Schedule 1",
        price: 100,
        serviceFeeSelled: 10,
        totalSelled: 200,
        totalWithServiceFeeSelled: 210,
        ticketTotal: 10,
        maxTicketPerBuy: 5,
        resellingTickets: 1,
        totalReselled: 50,
        totalReselledFee: 5,
        ticketReselledCount: 1,
        ticketSelledCount: 10,
        type: "Type 1",
        description: "",
      },
      {
        ticketCount: 20,
        ticketResellCount: 3,
        name: "Schedule 2",
        price: 150,
        serviceFeeSelled: 15,
        totalSelled: 300,
        totalWithServiceFeeSelled: 315,
        ticketTotal: 20,
        maxTicketPerBuy: 5,
        resellingTickets: 2,
        totalReselled: 75,
        totalReselledFee: 7.5,
        ticketReselledCount: 2,
        ticketSelledCount: 20,
        type: "Type 2",
        description: "",
      },
    ];
  });

  it("should correctly calculate stats without resellDeltaEarnings", () => {
    const result = calculateStats(newSchedules, eventData);
    expect(result.serviceFeeSelled).toBe(25);
    expect(result.totalSelled).toBe(500);
    expect(result.totalWithServiceFeeSelled).toBe(525);
    expect(result.ticketCount).toBe(30);
    expect(result.resellingTickets).toBe(3);
    expect(result.totalReselled).toBe(125);
    expect(result.totalReselledFee).toBe(12.5);
    expect(result.ticketReselledCount).toBe(3);
    expect(result.ticketSelledCount).toBe(30);
    expect(result.resellDeltaEarnings).toBe(0);
  });

  it("should correctly calculate stats with resellDeltaEarnings", () => {
    const resellDeltaEarnings = 100;
    const result = calculateStats(newSchedules, eventData, resellDeltaEarnings);
    expect(result.resellDeltaEarnings).toBe(100);
  });
});
