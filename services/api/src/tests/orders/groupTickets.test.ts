import { groupTickets } from "../../orders/approve";
import type { OrderItem } from "../../orders/interfaces";
import { TicketStatus, type Ticket } from "../../events/tickets/interfaces";

describe("groupTickets", () => {
  let ticketsGrouped: OrderItem[];
  let tickets: { id: string; ticket: Ticket }[];

  beforeEach(() => {
    ticketsGrouped = [
      {
        name: "VIP",
        price: 100,
        type: "VIP",
        quantity: 2,
        ids: [],
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
        ids: [],
        normalCount: 2,
        resellingCount: 1,
        description: "",
        serviceFee: 5,
      },
    ];

    tickets = [
      {
        id: "1",
        ticket: {
          name: "VIP",
          eventId: "",
          eventName: "",
          eventImageUrl: "",
          eventStart: null,
          eventEnd: null,
          eventActivationDate: null,
          locationName: "",
          address: "",
          userId: "",
          userDni: "",
          status: TicketStatus.Pending,
          price: 100,
          date: "",
          hour: 0,
          isConcurrent: false,
          orderId: "",
          producerId: "",
          type: "VIP",
          description: "",
          metadata: {},
          userName: "userName",
          userMail: "userMail",
          channel: "free",
          resellable: true,
        },
      },
      {
        id: "2",
        ticket: {
          name: "Regular",
          eventId: "",
          eventName: "",
          eventImageUrl: "",
          eventStart: null,
          eventEnd: null,
          eventActivationDate: null,
          locationName: "",
          address: "",
          userId: "",
          userDni: "",
          status: TicketStatus.Pending,
          price: 50,
          date: "",
          hour: 0,
          isConcurrent: false,
          orderId: "",
          producerId: "",
          type: "Regular",
          description: "",
          metadata: {},
          userName: "userName",
          userMail: "userMail",
          channel: "free",
          resellable: true,
        },
      },
      {
        id: "3",
        ticket: {
          name: "VIP",
          eventId: "",
          channel: "free",
          eventName: "",
          eventImageUrl: "",
          eventStart: null,
          eventEnd: null,
          eventActivationDate: null,
          locationName: "",
          address: "",
          userId: "",
          userDni: "",
          status: TicketStatus.Pending,
          price: 100,
          date: "",
          hour: 0,
          isConcurrent: false,
          orderId: "",
          producerId: "",
          type: "VIP",
          description: "",
          metadata: {},
          userName: "userName",
          userMail: "userMail",
          resellable: true,
        },
      },
    ];
  });

  it("should group tickets by name and append ids", () => {
    const result = groupTickets(ticketsGrouped, tickets);
    expect(result.find((item) => item.name === "VIP")?.ids).toEqual(["1", "3"]);
    expect(result.find((item) => item.name === "Regular")?.ids).toEqual(["2"]);
  });

  it("should return the original ticketsGrouped if no matching tickets are found", () => {
    const noMatchTickets = [
      {
        id: "4",
        ticket: {
          name: "NoMatch",
          eventId: "",
          eventName: "",
          eventImageUrl: "",
          eventStart: null,
          eventEnd: null,
          eventActivationDate: null,
          locationName: "",
          address: "",
          userId: "",
          userDni: "",
          status: TicketStatus.Pending,
          price: 100,
          date: "",
          hour: 0,
          isConcurrent: false,
          orderId: "",
          producerId: "",
          type: "NoMatch",
          description: "",
          metadata: {},
          userName: "userName",
          userMail: "userMail",
          resellable: true,
          channel: "free",
        },
      },
    ];
    const result = groupTickets(ticketsGrouped, noMatchTickets);
    expect(result).toEqual(ticketsGrouped);
  });
});
