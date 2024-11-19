import { TicketStatus } from "~/events/tickets/interfaces";
import {
  resellSameCategory,
  resellHighestPrice,
} from "../../../events/tickets/resell";

describe("calculate resell category Test", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const dummyTicket = {
    eventId: "eventId",
    eventName: "eventName",
    eventImageUrl: "eventImageUrl",
    eventStart: null,
    eventEnd: null,
    eventActivationDate: null,
    locationName: "locationName",
    address: "address",
    name: "dummy",
    userId: "userId",
    userDni: "userDni",
    status: TicketStatus.Pending,
    createdAt: undefined,
    updatedAt: undefined,
    expirationDate: "2024-01-01",

    validatedAt: undefined,
    price: 100,
    date: "date",
    hour: 1,
    type: "normal",
    isConcurrent: false,
    orderId: "",
    producerId: "",
    description: "",
    metadata: {},
    userName: "userName",
    userMail: "userMail",
    channel: "free",
    resellable: true,
  };

  const dummySchedule = [
    {
      ticketCount: 0,
      ticketResellCount: 0,
      name: "dummy",
      price: 100,
      serviceFeeSelled: 0,
      totalSelled: 0,
      totalWithServiceFeeSelled: 0,
      ticketTotal: 1,
      maxTicketPerBuy: 1,
      resellingTickets: 3,
      totalReselled: 0,
      totalReselledFee: 0,
      ticketReselledCount: 0,
      ticketSelledCount: 0,
      type: "normal",
      description: "",
    },
    {
      ticketCount: 0,
      ticketResellCount: 0,
      name: "dummy1",
      price: 100,
      serviceFeeSelled: 0,
      totalSelled: 0,
      totalWithServiceFeeSelled: 0,
      ticketTotal: 1,
      maxTicketPerBuy: 1,
      resellingTickets: 0,
      totalReselled: 0,
      totalReselledFee: 0,
      ticketReselledCount: 0,
      ticketSelledCount: 0,
      type: "normal",
      description: "",
    },
  ];

  test("Resell Same Category", async () => {
    const { newSchedule, newTicketRef } = resellSameCategory(
      dummyTicket,
      dummyTicket.name,
      dummySchedule,
      false
    );
    expect(newSchedule).toStrictEqual([
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 4,
        totalReselled: 0,
        totalReselledFee: 0,
        type: "normal",
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy1",
        type: "normal",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ]);
    expect(newTicketRef).toStrictEqual({
      name: "dummy",
      price: 100,
    });
  });

  test("Cancel Resell Same Category", async () => {
    const { newSchedule, newTicketRef } = resellSameCategory(
      dummyTicket,
      dummyTicket.name,
      dummySchedule,
      true
    );
    expect(newSchedule).toStrictEqual([
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 2,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        type: "normal",
        description: "",
      },
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        type: "normal",
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ]);
    expect(newTicketRef).toStrictEqual({
      name: "dummy",
      price: 100,
    });
  });

  test("Resell Highest Category", async () => {
    const dummySchedule = [
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 10,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        type: "normal",
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        type: "normal",
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ];
    const { newSchedule, newTicketRef } = resellHighestPrice(
      dummyTicket,
      dummySchedule,
      false
    );
    expect(newSchedule).toStrictEqual([
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 10,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        type: "normal",
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 1,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        type: "normal",
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ]);
    expect(newTicketRef).toStrictEqual({
      name: "dummy1",
      price: 100,
    });
  });

  test("Resell Highest Category 2", async () => {
    const dummySchedule = [
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 10,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        type: "normal",
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        type: "normal",
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ];
    const { newSchedule, newTicketRef } = resellHighestPrice(
      dummyTicket,
      dummySchedule,
      false
    );
    expect(newSchedule).toStrictEqual([
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 10,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        type: "normal",
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 0,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 1,
        totalReselled: 0,
        totalReselledFee: 0,
        type: "normal",
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ]);
    expect(newTicketRef).toStrictEqual({
      name: "dummy2",
      price: 100,
    });
  });

  test("Resell Highest Category no tickets left", async () => {
    const dummySchedule = [
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        type: "normal",
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        type: "normal",
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy2",
        type: "normal",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ];
    const { newSchedule, newTicketRef } = resellHighestPrice(
      dummyTicket,
      dummySchedule,
      false
    );
    expect(newSchedule).toStrictEqual([
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        type: "normal",
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 1,
        totalReselled: 0,
        type: "normal",
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ]);
    expect(newTicketRef).toStrictEqual({
      name: "dummy2",
      price: 100,
    });
  });

  test("Cancel Resell Highest Category", async () => {
    const dummySchedule = [
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        type: "normal",
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 2,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        type: "normal",
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ];
    const { newSchedule, newTicketRef } = resellHighestPrice(
      { ...dummyTicket, resellRef: "dummy1" },
      dummySchedule,
      true
    );
    expect(newSchedule).toStrictEqual([
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy",
        price: 100,
        type: "normal",
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 3,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy1",
        price: 100,
        serviceFeeSelled: 0,
        totalSelled: 0,
        type: "normal",
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 1,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
      {
        ticketCount: 1,
        ticketResellCount: 0,
        name: "dummy2",
        price: 100,
        type: "normal",
        serviceFeeSelled: 0,
        totalSelled: 0,
        totalWithServiceFeeSelled: 0,
        ticketTotal: 1,
        maxTicketPerBuy: 1,
        resellingTickets: 0,
        totalReselled: 0,
        totalReselledFee: 0,
        ticketReselledCount: 0,
        ticketSelledCount: 0,
        description: "",
      },
    ]);
    expect(newTicketRef).toStrictEqual({
      name: "dummy1",
      price: 100,
    });
  });
});
