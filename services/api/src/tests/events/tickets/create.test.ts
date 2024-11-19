import { Timestamp } from "firebase-admin/firestore";
import { OrderStatus, type Order } from "../../../orders/interfaces";
import { generateTickets } from "../../../events/tickets/create";

describe("generateTickets", () => {
  let orderData: Order;

  beforeEach(() => {
    orderData = {
      totalSelled: 0,
      expirationDate: "2024-01-01",
      totalWithServiceFeeSelled: 0,
      serviceFeeSelled: 0,
      userId: "user_123",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      serviceFeeHidden: false,
      itemCount: 5,
      items: [
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
          serviceFee: 10,
        },
      ],
      deviceType: "web",
      status: OrderStatus.Pending,
      eventId: "event_123",
      userName: "John Doe",
      eventName: "Sample Event",
      eventEndDate: Timestamp.now(),
      eventStartDate: Timestamp.now(),
      eventActivationDate: Timestamp.now(),
      hasActivationDate: true,
      eventLocationAddress: "123 Sample Street",
      eventImageUrl: "sample_image_url",
      eventLocationName: "Sample Venue",
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
      channel: "free",
      date: "2023-07-24",
      hour: 20,
      qrInfos: [],
      isEventActivated: true,
      producerId: "producer_123",
    };
  });

  it("should generate the correct number of tickets", () => {
    const tickets = generateTickets(orderData, "free", {});
    expect(tickets.length).toBe(5); // 2 VIP + 3 Regular
  });

  it("should generate correct double tickets", () => {
    orderData.items = [
      {
        name: "Double",
        price: 50,
        type: "double",
        quantity: 1,
        ids: [],
        normalCount: 1,
        resellingCount: 0,
        description: "",
        serviceFee: 10,
      },
    ];
    const tickets = generateTickets(orderData, "free", {});
    expect(tickets.length).toBe(2); // 2 VIP + 3 Regular
    expect(tickets[0]?.price).toBe(25);
  });

  it("should generate tickets with correct properties", () => {
    const tickets = generateTickets(orderData, "free", {
      "VIP-0": { hola: "0" },
      "VIP-1": { hola: "1" },
      "Regular-0": { hola: "0" },
      "Regular-1": { hola: "1" },
      "Regular-2": { hola: "2" },
    });
    const vipTickets = tickets.filter((ticket) => ticket.name === "VIP");
    const regularTickets = tickets.filter(
      (ticket) => ticket.name === "Regular"
    );

    expect(vipTickets.length).toBe(2);
    expect(regularTickets.length).toBe(3);

    vipTickets.forEach((ticket, index) => {
      expect(ticket).toMatchObject({
        eventId: "event_123",
        eventName: "Sample Event",
        locationName: "Sample Venue",
        address: "123 Sample Street",
        eventActivationDate: orderData.eventActivationDate,
        userId: "user_123",
        status: "Active",
        eventStart: orderData.eventStartDate,
        eventEnd: orderData.eventEndDate,
        eventImageUrl: "sample_image_url",
        userDni: "12345678",
        name: "VIP",
        price: 100,
        date: "2023-07-24",
        hour: 20,
        isConcurrent: false,
        orderId: "order_123",
        producerId: "producer_123",
        type: "VIP",
        description: "",
        channel: "free",
        metadata: { hola: index.toString() },
      });
    });

    regularTickets.forEach((ticket, index) => {
      expect(ticket).toMatchObject({
        eventId: "event_123",
        eventName: "Sample Event",
        locationName: "Sample Venue",
        address: "123 Sample Street",
        eventActivationDate: orderData.eventActivationDate,
        userId: "user_123",
        status: "Active",
        eventStart: orderData.eventStartDate,
        eventEnd: orderData.eventEndDate,
        eventImageUrl: "sample_image_url",
        userDni: "12345678",
        name: "Regular",
        price: 50,
        date: "2023-07-24",
        hour: 20,
        isConcurrent: false,
        orderId: "order_123",
        producerId: "producer_123",
        type: "Regular",
        description: "",
        channel: "free",
        metadata: { hola: index.toString() },
      });
    });
  });

  it("should generate tickets with status based on event activation", () => {
    // Case when event is not activated
    orderData.isEventActivated = false;
    const tickets = generateTickets(orderData, "free", {});
    tickets.forEach((ticket) => {
      expect(ticket.status).toBe("Pending");
    });

    // Case when event is activated
    orderData.isEventActivated = true;
    const ticketsActivated = generateTickets(orderData, "free", {});
    ticketsActivated.forEach((ticket) => {
      expect(ticket.status).toBe("Active");
    });

    orderData.isEventActivated = false;
    orderData.hasActivationDate = false;
    const ticketsWithoutActivationDate = generateTickets(orderData, "free", {});
    ticketsWithoutActivationDate.forEach((ticket) => {
      expect(ticket.status).toBe("Active");
    });
  });
});
