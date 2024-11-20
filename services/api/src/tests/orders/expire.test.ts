import { Timestamp } from "firebase-admin/firestore";
import { EventStatus, type Event } from "@repo/types";
import { OrderStatus, type Order } from "../../orders/interfaces";
import { getNewScheduleAndStatsExpired } from "../../orders/expireOrder";

describe("getNewScheduleAndStatsExpired", () => {
  let eventData: Event;
  let orderData: Order;

  beforeEach(() => {
    eventData = {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      info: {
        description: "Sample event description",
        end: Timestamp.now(),
        image: "event_image_url",
        name: "Sample Event",
        start: Timestamp.now(),
        activationDate: 0,
        tags: ["sample", "event"],
        isConcurrent: false,
        type: "Conference",
        status: EventStatus.Active,
        isExternal: false,
        externalUrl: "",
        activityType: "activityType",
      },
      finance: {
        serviceFee: 0.5,
        serviceFeeType: "Percentage",
        serviceFeeHidden: false,
      },
      location: {
        address: "123 Event Street",
        name: "Event Location",
        lat: 12.34,
        lng: 56.78,
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
          name: "VIP",
          price: 100,
          ticketCount: 100,
          ticketResellCount: 10,
          serviceFeeSelled: 500,
          totalSelled: 10000,
          totalWithServiceFeeSelled: 10500,
          ticketTotal: 1000,
          maxTicketPerBuy: 5,
          resellingTickets: 50,
          totalReselled: 5000,
          totalReselledFee: 500,
          ticketReselledCount: 20,
          ticketSelledCount: 80,
          type: "VIP",
          description: "",
        },
        {
          name: "Regular",
          price: 50,
          ticketCount: 200,
          ticketResellCount: 20,
          serviceFeeSelled: 200,
          totalSelled: 5000,
          totalWithServiceFeeSelled: 5200,
          ticketTotal: 5000,
          maxTicketPerBuy: 10,
          resellingTickets: 30,
          totalReselled: 1500,
          totalReselledFee: 150,
          ticketReselledCount: 15,
          ticketSelledCount: 70,
          type: "Regular",
          description: "",
        },
      ],
      weekSchedule: undefined,
      stats: {
        serviceFeeSelled: 700,
        totalSelled: 15000,
        totalWithServiceFeeSelled: 15700,
        ticketCount: 300,
        ticketResellCount: 30,
        ticketValidated: 0,
        ticketTotal: 15000,
        resellingTickets: 80,
        totalReselled: 6500,
        totalReselledFee: 650,
        ticketReselledCount: 35,
        ticketSelledCount: 150,
        resellDeltaEarnings: 0,
      },
      operations: {
        validators: [],
        validatorsData: [],
        requiredMetadata: [],
        hasNonUserSell: false,
      },
      tasks: {
        expireTaskId: "task_123",
        activateTicketsId: "task_124",
      },
      resell: {
        hasResell: true,
        resellQueueNumber: 1,
        resellHighestPrice: false,
        resellFee: 5,
      },
    };

    orderData = {
      totalSelled: 1000,
      itemCount: 5,

      totalWithServiceFeeSelled: 1050,
      serviceFeeSelled: 50,
      userId: "user_123",
      createdAt: Timestamp.now(),
      expirationDate: "2024-01-01",

      updatedAt: Timestamp.now(),
      items: [
        {
          name: "VIP",
          price: 100,
          type: "VIP",
          quantity: 2,
          ids: ["ticket_1", "ticket_2"],
          normalCount: 1,
          resellingCount: 1,
          description: "",
          serviceFee: 10,
        },
        {
          name: "Regular",
          price: 50,
          type: "Regular",
          quantity: 3,
          ids: ["ticket_3", "ticket_4", "ticket_5"],
          normalCount: 2,
          resellingCount: 1,
          description: "",
          serviceFee: 10,
        },
      ],
      status: OrderStatus.Pending,
      eventId: "event_123",
      userName: "John Doe",
      eventName: "Sample Event",
      eventEndDate: Timestamp.now(),
      eventStartDate: Timestamp.now(),
      eventActivationDate: Timestamp.now(),
      hasActivationDate: true,
      eventLocationAddress: "123 Event Street",
      eventImageUrl: "event_image_url",
      eventLocationName: "Event Location",
      userMail: "johndoe@example.com",
      userDni: "12345678",
      eventProducer: "Sample Producer",
      eventProducerId: "producer_123",
      isConcurrent: false,
      orderId: "order_123",
      taskId: "task_123",
      floid: {
        payment_url: "http://payment.url",
        payment_token: "token_123",
      },
      channel: "online",
      date: "2023-07-24",
      hour: 20,
      qrInfos: [],
      isEventActivated: true,
      producerId: "producer_123",
      deviceType: "web",
      serviceFeeHidden: false,
    };
  });

  it("should return updated schedules and recalculated stats", async () => {
    const { newSchedules, stats } = await getNewScheduleAndStatsExpired(
      eventData,
      orderData
    );

    // Test newSchedules
    expect(newSchedules).toHaveLength(eventData.schedule.length);

    const vipSchedule = newSchedules.find(
      (schedule) => schedule.name === "VIP"
    );
    const regularSchedule = newSchedules.find(
      (schedule) => schedule.name === "Regular"
    );

    expect(vipSchedule).toEqual({
      name: "VIP",
      price: 100,
      ticketCount: 99, // 100 - 1
      ticketResellCount: 20, // 10 - 1
      serviceFeeSelled: 500,
      totalSelled: 10000,
      totalWithServiceFeeSelled: 10500,
      ticketTotal: 1000,
      maxTicketPerBuy: 5,
      resellingTickets: 51, // 50 + 1
      totalReselled: 5000,
      totalReselledFee: 500,
      ticketReselledCount: 20,
      ticketSelledCount: 80,
      type: "VIP",
      description: "",
    });

    expect(regularSchedule).toEqual({
      name: "Regular",
      price: 50,
      ticketCount: 198, // 200 - 2
      ticketResellCount: 19, // 20 - 1
      serviceFeeSelled: 200,
      totalSelled: 5000,
      totalWithServiceFeeSelled: 5200,
      ticketTotal: 5000,
      maxTicketPerBuy: 10,
      resellingTickets: 31, // 30 + 1
      totalReselled: 1500,
      totalReselledFee: 150,
      ticketReselledCount: 15,
      ticketSelledCount: 70,
      type: "Regular",
      description: "",
    });

    // Test stats
    expect(stats).toEqual({
      serviceFeeSelled: 700,
      totalSelled: 15000,
      totalWithServiceFeeSelled: 15700,
      ticketCount: 300 - 3,
      ticketResellCount: 39,
      ticketValidated: 0,
      ticketTotal: 15000,
      resellingTickets: 80 + 2,
      totalReselled: 6500,
      totalReselledFee: 650,
      ticketReselledCount: 35,
      ticketSelledCount: 150,
      resellDeltaEarnings: 0,
    });
  });
});
