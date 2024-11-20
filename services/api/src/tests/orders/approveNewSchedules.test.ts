import { Timestamp } from "firebase-admin/firestore";
import { EventStatus, type Event } from "@repo/types";
import { OrderStatus, type Order } from "../../orders/interfaces";
import { calculateNewSchedulesAndStats } from "../../orders/onUpdate";

describe("calculateNewSchedulesAndStats", () => {
  let eventData: Event;
  let orderData: Order;
  let resellDeltaEarnings: number;

  beforeEach(() => {
    eventData = {
      info: {
        description: "Sample Event",
        end: Timestamp.now(),
        image: "sample_image_url",
        name: "Sample Event",
        start: Timestamp.now(),
        activationDate: 0,
        tags: ["tag1"],
        isConcurrent: false,
        type: "Type",
        status: EventStatus.Active,
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
        address: "123 Sample St",
        name: "Sample Location",
        lat: 0,
        lng: 0,
      },
      producer: {
        image: "producer_image_url",
        name: "Sample Producer",
        id: "producer_123",
        ratings: {
          ratingPoint: 5,
          ratingTotal: 10,
          ratingNumber: 2,
        },
      },
      schedule: [
        {
          ticketCount: 2,
          ticketResellCount: 1,
          name: "VIP",
          price: 50,
          serviceFeeSelled: 15,
          totalSelled: 100,
          totalWithServiceFeeSelled: 115,
          ticketTotal: 100,
          maxTicketPerBuy: 5,
          resellingTickets: 2,
          totalReselled: 20,
          totalReselledFee: 10,
          ticketReselledCount: 1,
          ticketSelledCount: 2,
          type: "VIP",
          description: "",
        },
      ],
      stats: {
        serviceFeeSelled: 15,
        totalSelled: 100,
        totalWithServiceFeeSelled: 115,
        ticketCount: 2,
        ticketResellCount: 1,
        ticketValidated: 0,
        ticketTotal: 100,
        resellingTickets: 2,
        totalReselled: 20,
        totalReselledFee: 10,
        ticketReselledCount: 1,
        ticketSelledCount: 1,
        resellDeltaEarnings: 0,
      },
      operations: {
        validators: [],
        validatorsData: [],
        requiredMetadata: [],
        hasNonUserSell: false,
      },
      tasks: {},
      resell: {
        hasResell: true,
        resellQueueNumber: 1,
        resellHighestPrice: true,
        resellFee: 0.5,
      },
    };

    orderData = {
      totalSelled: 1000,
      totalWithServiceFeeSelled: 1100,
      serviceFeeSelled: 100,
      itemCount: 5,
      userId: "user_123",
      expirationDate: "2024-01-01",

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      items: [
        {
          name: "VIP",
          price: 50,
          type: "VIP",
          quantity: 5,
          ids: ["ticket_1", "ticket_2"],
          normalCount: 3,
          resellingCount: 2,
          description: "",
          serviceFee: 100,
        },
      ],
      status: OrderStatus.Approved,
      eventId: "event_456",
      userName: "John Doe",
      eventName: "Sample Event",
      eventEndDate: Timestamp.now(),
      eventStartDate: Timestamp.now(),
      eventActivationDate: Timestamp.now(),
      hasActivationDate: true,
      eventLocationAddress: "123 Sample St",
      eventImageUrl: "event_image_url",
      eventLocationName: "Sample Location",
      userMail: "john.doe@example.com",
      userDni: "12345678A",
      eventProducer: "Sample Producer",
      eventProducerId: "producer_123",
      isConcurrent: false,
      orderId: "order_123",
      taskId: "task_123",
      floid: {
        payment_url: "payment_url",
        payment_token: "payment_token",
      },
      channel: "web",
      date: "2024-07-24",
      hour: 10,
      qrInfos: [
        {
          ticketId: "ticket_1",
          name: "VIP",
          url: "url_1",
        },
      ],
      isEventActivated: true,
      producerId: "producer_123",
      deviceType: "web",
      serviceFeeHidden: false,
    };

    resellDeltaEarnings = 50;
  });

  it("should correctly calculate new schedules and stats", () => {
    const { newSchedules, stats } = calculateNewSchedulesAndStats(
      eventData,
      orderData,
      resellDeltaEarnings,
      11
    );

    // Calculate expected values based on the input data
    const expectedSchedule = {
      ticketCount: 2,
      ticketResellCount: 1,
      name: "VIP",
      price: 50,
      serviceFeeSelled: 15 + 5 * 50 * 0.1, // Previous + New
      totalSelled: 100 + 3 * 50, // Previous + New
      totalWithServiceFeeSelled: 15 + 5 * 50 * 0.1 + 100 + 3 * 50, // Previous + New
      ticketTotal: 100,
      maxTicketPerBuy: 5,
      resellingTickets: 2, // Previous + New
      totalReselled: 31,
      totalReselledFee: 15.5,
      ticketReselledCount: 1 + 2, // Previous + New
      ticketSelledCount: 2 + 3, // Previous + New
      type: "VIP",
      description: "",
    };

    // Verify newSchedules contains the expected schedule
    expect(newSchedules).toHaveLength(1);
    expect(newSchedules[0]).toEqual(expectedSchedule);

    // Verify the stats returned are correct
    const expectedStats = {
      ...eventData.stats,
      serviceFeeSelled: expectedSchedule.serviceFeeSelled,
      totalSelled: expectedSchedule.totalSelled,
      totalWithServiceFeeSelled: expectedSchedule.totalWithServiceFeeSelled,
      ticketCount: 2,
      ticketResellCount: 1,
      ticketTotal: eventData.stats.ticketTotal,
      resellingTickets: 2,
      totalReselled: 31,
      totalReselledFee: 15.5,
      ticketReselledCount: 1 + 2,
      ticketSelledCount: 2 + 3,
      resellDeltaEarnings:
        eventData.stats.resellDeltaEarnings + resellDeltaEarnings,
    };

    expect(stats).toEqual(expectedStats);
  });
});
