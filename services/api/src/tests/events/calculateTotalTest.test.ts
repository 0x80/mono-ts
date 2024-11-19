import { FakeFirestore } from "firestore-jest-mock";

import { calculateTotalHandler } from "../../events/calculateTotals";

describe("calculateTotal Test", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const db = new FakeFirestore({
    events: [
      {
        id: "bnn",
        schedule: [
          {
            name: "VIP",
            price: 1000,
            ticketTotal: 100,
            ticketCount: 50,
            maxTicketPerBuy: 10,
            resellingTickets: 10,
            type: "normal",
            description: "",
          },
          {
            name: "Regular",
            price: 500,
            ticketTotal: 100,
            ticketCount: 50,
            maxTicketPerBuy: 10,
            resellingTickets: 10,
            type: "normal",
            description: "",
          },
        ],
        finance: {
          serviceFee: 0.1,
          serviceFeeType: "Percentage",
          serviceFeeHidden: false,
        },
        resell: {
          hasResell: true,
          resellQueueNumber: 5,
        },
        info: {
          isConcurrent: false,
          status: "Active",
        },
        stats: {},
      },
    ],
  });

  test("Calculate total with no tickets selected", async () => {
    try {
      const event = await db.collection("events").doc("bnn").get();
      await calculateTotalHandler(event.data(), [], "", "");
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! Debes seleccionar tickets para continuar"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! Debes seleccionar tickets para continuar"
        );
      }
    }
  });

  test("Calculate total with fixed service fee", async () => {
    const dbFixedFee = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 0,
              ticketResellCount: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              type: "normal",
              ticketCount: 50,
              maxTicketPerBuy: 10,
              resellingTickets: 0,
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 50,
            serviceFeeType: "Fixed",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });

    const event = await dbFixedFee.collection("events").doc("bnn").get();
    const record = await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 2 },
        { name: "Regular", count: 6 },
      ],

      "",
      ""
    );

    expect(record.totalPrices).toStrictEqual({
      total: 5000,
      serviceFee: 400,
      totalWithServiceFee: 5400,
      lessAvailableTickets: false,
      serviceFeeHidden: false,
      schedules: [
        {
          name: "VIP",
          price: 1000,
          count: 2,
          total: 2000,
          serviceFee: 100,
          totalWithServiceFee: 2100,
          type: "normal",
          normalCount: 2,
          resellingCount: 0,
          description: "",
        },
        {
          name: "Regular",
          price: 500,
          count: 6,
          total: 3000,
          serviceFee: 300,
          totalWithServiceFee: 3300,
          type: "normal",
          normalCount: 6,
          resellingCount: 0,
          description: "",
        },
      ],
    });
  });

  test("Calculate total with exceeding available tickets", async () => {
    const dbExceedingTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 0,
              type: "normal",
              resellingTickets: 0,
              ticketResellCount: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              type: "normal",
              ticketCount: 50,
              maxTicketPerBuy: 0,
              resellingTickets: 0,
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 50,
            serviceFeeType: "Fixed",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbExceedingTickets
      .collection("events")
      .doc("bnn")
      .get();

    try {
      const record = await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 60 },
          { name: "Regular", count: 60 },
        ],
        "",
        ""
      );

      expect(record.totalPrices).toStrictEqual({
        total: 75000,
        serviceFee: 5000,
        totalWithServiceFee: 80000,
        lessAvailableTickets: true,
        serviceFeeHidden: false,

        schedules: [
          {
            name: "VIP",
            price: 1000,
            count: 50,
            total: 50000,
            serviceFee: 2500,
            totalWithServiceFee: 52500,
            type: "normal",
            normalCount: 50,
            resellingCount: 0,
            description: "",
          },
          {
            name: "Regular",
            price: 500,
            count: 50,
            total: 25000,
            serviceFee: 2500,
            totalWithServiceFee: 27500,
            type: "normal",
            normalCount: 50,
            resellingCount: 0,
            description: "",
          },
        ],
      });
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! No quedan tickets VIP, refrezca y inténtalo de nuevo"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! No quedan tickets VIP, refrezca y inténtalo de nuevo"
        );
      }
    }
  });

  test("Calculate total with max tickets per buy exceeded", async () => {
    const dbMaxTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 10,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 10,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 50,
            serviceFeeType: "Fixed",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbMaxTickets.collection("events").doc("bnn").get();

    try {
      const record = await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 20 },
          { name: "Regular", count: 20 },
        ],
        "",
        ""
      );

      expect(record.totalPrices).toStrictEqual({
        total: 15000,
        serviceFee: 1000,
        totalWithServiceFee: 16000,
        lessAvailableTickets: true,
        serviceFeeHidden: false,

        schedules: [
          {
            name: "VIP",
            price: 1000,
            count: 10,
            total: 10000,
            serviceFee: 500,
            type: "normal",
            totalWithServiceFee: 10500,
            normalCount: 10,
            resellingCount: 0,
            description: "",
          },
          {
            name: "Regular",
            price: 500,
            type: "normal",
            count: 10,
            total: 5000,
            serviceFee: 500,
            totalWithServiceFee: 5500,
            normalCount: 10,
            resellingCount: 0,
            description: "",
          },
        ],
      });
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! No puedes seleccionar más del permitido del ticket VIP"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! No puedes seleccionar más del permitido del ticket VIP"
        );
      }
    }
  });

  test("Calculate total with reselling tickets first", async () => {
    const dbResellingAll = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 10,
              resellingTickets: 3,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 50,
              type: "normal",
              maxTicketPerBuy: 10,
              resellingTickets: 10,
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.2,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 0,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbResellingAll.collection("events").doc("bnn").get();
    const record = await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 5 },
        { name: "Regular", count: 2 },
      ],

      "",
      ""
    );

    expect(record.totalPrices).toStrictEqual({
      total: 6000,
      serviceFee: 1200,
      totalWithServiceFee: 7200,
      lessAvailableTickets: false,
      serviceFeeHidden: false,

      schedules: [
        {
          name: "VIP",
          price: 1000,
          count: 5,
          total: 5000,
          serviceFee: 1000,
          totalWithServiceFee: 6000,
          normalCount: 2,
          type: "normal",
          resellingCount: 3,
          description: "",
        },
        {
          count: 2,
          name: "Regular",
          normalCount: 0,
          price: 500,
          resellingCount: 2,
          serviceFee: 200,
          type: "normal",
          total: 1000,
          totalWithServiceFee: 1200,
          description: "",
        },
      ],
    });
  });
  test("Calculate total with reselling tickets queue", async () => {
    const dbResellingAll = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 10,
              resellingTickets: 3,
              type: "normal",
              ticketResellCount: 3,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 52,
              maxTicketPerBuy: 10,
              resellingTickets: 10,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.2,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 3,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbResellingAll.collection("events").doc("bnn").get();
    const record = await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 5 },
        { name: "Regular", count: 2 },
      ],

      "",
      ""
    );

    expect(record.totalPrices).toStrictEqual({
      total: 6000,
      serviceFee: 1200,
      totalWithServiceFee: 7200,
      lessAvailableTickets: false,
      serviceFeeHidden: false,

      schedules: [
        {
          name: "VIP",
          price: 1000,
          count: 5,
          total: 5000,
          serviceFee: 1000,
          totalWithServiceFee: 6000,
          normalCount: 4,
          resellingCount: 1,
          type: "normal",
          description: "",
        },
        {
          count: 2,
          name: "Regular",
          normalCount: 1,
          price: 500,
          resellingCount: 1,
          serviceFee: 200,
          total: 1000,
          totalWithServiceFee: 1200,
          type: "normal",
          description: "",
        },
      ],
    });
  });

  test("Calculate total with zero tickets available", async () => {
    const dbZeroTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 10,
              ticketCount: 10,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 10,
              ticketCount: 10,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.1,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    try {
      const event = await dbZeroTickets.collection("events").doc("bnn").get();
      await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 3 },
          { name: "Regular", count: 3 },
        ],
        "",
        ""
      );
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! No quedan tickets VIP, refrezca y inténtalo de nuevo"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! No quedan tickets VIP, refrezca y inténtalo de nuevo"
        );
      }
    }
  });

  test("Calculate total with non unique permission", async () => {
    const dbZeroTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 10,
              ticketCount: 0,
              maxTicketPerBuy: 10,
              type: "unique",
              resellingTickets: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 10,
              ticketCount: 0,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.1,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
          producer: {
            domains: ["private.com"],
          },
        },
      ],
    });
    try {
      const event = await dbZeroTickets.collection("events").doc("bnn").get();
      await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 3 },
          { name: "Regular", count: 3 },
        ],
        "john.doe@non-private.com",
        ""
      );
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! No tienes permiso para comprar el ticket VIP, revisa la descripción del ticket!"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! No tienes permiso para comprar el ticket VIP, revisa la descripción del ticket!"
        );
      }
    }
  });

  test("Calculate total with correct unique permissions", async () => {
    const dbWithPermissions = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 90,
              maxTicketPerBuy: 10,
              type: "unique",
              resellingTickets: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 200,
              ticketCount: 180,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.1,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
          producer: {
            domains: ["private.com"],
          },
        },
      ],
    });

    const event = await dbWithPermissions.collection("events").doc("bnn").get();
    const record = await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 1 },
        { name: "Regular", count: 3 },
      ],
      "jane.doe@private.com",
      ""
    );

    expect(record.totalPrices).toStrictEqual({
      total: 2500,
      serviceFee: 250,
      totalWithServiceFee: 2750,
      lessAvailableTickets: false,
      serviceFeeHidden: false,

      schedules: [
        {
          name: "VIP",
          price: 1000,
          count: 1,
          total: 1000,
          serviceFee: 100,
          totalWithServiceFee: 1100,
          normalCount: 1,
          resellingCount: 0,
          type: "unique",
          description: "",
        },
        {
          name: "Regular",
          price: 500,
          count: 3,
          total: 1500,
          serviceFee: 150,
          totalWithServiceFee: 1650,
          normalCount: 3,
          resellingCount: 0,
          type: "normal",
          description: "",
        },
      ],
    });
  });

  test("Calculate total with null domains and unique ticket", async () => {
    const dbNullDomains = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 90,
              maxTicketPerBuy: 10,
              type: "unique",
              resellingTickets: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 200,
              ticketCount: 180,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.1,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
          producer: {
            domains: [],
          },
        },
      ],
    });

    const event = await dbNullDomains.collection("events").doc("bnn").get();
    const record = await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 1 },
        { name: "Regular", count: 2 },
      ],
      "john.doe@example.com",
      ""
    );

    expect(record.totalPrices).toStrictEqual({
      total: 2000,
      serviceFee: 200,
      totalWithServiceFee: 2200,
      lessAvailableTickets: false,
      serviceFeeHidden: false,

      schedules: [
        {
          name: "VIP",
          price: 1000,
          count: 1,
          total: 1000,
          serviceFee: 100,
          totalWithServiceFee: 1100,
          normalCount: 1,
          resellingCount: 0,
          type: "unique",
          description: "",
        },
        {
          name: "Regular",
          price: 500,
          count: 2,
          total: 1000,
          serviceFee: 100,
          totalWithServiceFee: 1100,
          normalCount: 2,
          resellingCount: 0,
          type: "normal",
          description: "",
        },
      ],
    });
  });

  test("Calculate total with a mix of normal and reselling tickets", async () => {
    const dbMixedTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 70,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 5,
              ticketResellCount: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 80,
              maxTicketPerBuy: 10,
              type: "normal",
              resellingTickets: 10,
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 0.2,
            serviceFeeType: "Percentage",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 3,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbMixedTickets.collection("events").doc("bnn").get();
    const record = await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 8 },
        { name: "Regular", count: 10 },
      ],
      "",
      ""
    );

    expect(record.totalPrices).toStrictEqual({
      total: 13000,
      serviceFee: 2600,
      totalWithServiceFee: 15600,
      lessAvailableTickets: false,
      serviceFeeHidden: false,
      schedules: [
        {
          name: "VIP",
          price: 1000,
          count: 8,
          total: 8000,
          serviceFee: 1600,
          totalWithServiceFee: 9600,
          normalCount: 7,
          resellingCount: 1,
          type: "normal",
          description: "",
        },
        {
          name: "Regular",
          price: 500,
          count: 10,
          total: 5000,
          serviceFee: 1000,
          totalWithServiceFee: 6000,
          normalCount: 9,
          resellingCount: 1,
          type: "normal",
          description: "",
        },
      ],
    });
  });

  test("Calculate total with max tickets per buy exceeded", async () => {
    const dbMaxTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 5,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 5,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 50,
            serviceFeeType: "Fixed",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbMaxTickets.collection("events").doc("bnn").get();

    try {
      await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 6 },
          { name: "Regular", count: 6 },
        ],
        "",
        ""
      );
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! No puedes seleccionar más del permitido del ticket VIP"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! No puedes seleccionar más del permitido del ticket VIP"
        );
      }
    }
  });

  test("Calculate total with ticket not visible error", async () => {
    const dbMaxTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 5,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
              visible: false,
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 5,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 50,
            serviceFeeType: "Fixed",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Active",
          },
          stats: {},
        },
      ],
    });
    const event = await dbMaxTickets.collection("events").doc("bnn").get();

    try {
      await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 6 },
          { name: "Regular", count: 6 },
        ],
        "",
        ""
      );
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! El ticket VIP no está disponible, refrezca la página e inténtalo de nuevo"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! El ticket VIP no está disponible, refrezca la página e inténtalo de nuevo"
        );
      }
    }

    await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 1 },
        { name: "Regular", count: 1 },
      ],
      "",
      "presencial"
    );

    await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 0 },
        { name: "Regular", count: 1 },
      ],
      "",
      ""
    );
  });

  test("Calculate total with event no active", async () => {
    const dbMaxTickets = new FakeFirestore({
      events: [
        {
          id: "bnn",
          schedule: [
            {
              name: "VIP",
              price: 1000,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 5,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
              visible: false,
            },
            {
              name: "Regular",
              price: 500,
              ticketTotal: 100,
              ticketCount: 50,
              maxTicketPerBuy: 5,
              resellingTickets: 0,
              type: "normal",
              ticketResellCount: 0,
              description: "",
            },
          ],
          finance: {
            serviceFee: 50,
            serviceFeeType: "Fixed",
            serviceFeeHidden: false,
          },
          resell: {
            hasResell: true,
            resellQueueNumber: 5,
          },
          info: {
            isConcurrent: false,
            status: "Visible",
          },
          stats: {},
        },
      ],
    });
    const event = await dbMaxTickets.collection("events").doc("bnn").get();

    try {
      await calculateTotalHandler(
        event.data(),
        [
          { name: "VIP", count: 6 },
          { name: "Regular", count: 6 },
        ],
        "",
        ""
      );
    } catch (error) {
      if (error instanceof Error) {
        // Standard JavaScript error handling
        expect(error.message).toStrictEqual(
          "Ups! El evento no está disponible, refrezca y inténtalo de nuevo"
        );
      } else {
        // If the error doesn't match the Error type, handle it generically
        expect(error).toStrictEqual(
          "Ups! El evento no está disponible, refrezca y inténtalo de nuevo"
        );
      }
    }

    await calculateTotalHandler(
      event.data(),
      [
        { name: "VIP", count: 1 },
        { name: "Regular", count: 1 },
      ],
      "",
      "presencial"
    );
  });
});
