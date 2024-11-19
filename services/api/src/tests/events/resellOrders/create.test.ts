import { createResellOrderObject } from "../../../events/resellOrders/create";

describe("createResellOrderObject", () => {
  let data: {
    userId: string;
    eventId: string;
    ticketId: string;
    bankName: string;
    bankAccountType: string;
    bankAccountNumber: string;
    bankAccountName: string;
    bankAccountDni: string;
    bankAccountEmail: string;
    userName: string;
    userEmail: string;
    eventImageUrl: string;
  };

  beforeEach(() => {
    data = {
      userId: "user_123",
      eventId: "event_456",
      ticketId: "ticket_789",
      bankName: "Sample Bank",
      bankAccountType: "Savings",
      bankAccountNumber: "1234567890",
      bankAccountName: "John Doe",
      bankAccountDni: "12345678A",
      bankAccountEmail: "john.doe@example.com",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      eventImageUrl: "event_image_url",
    };
  });

  it("should correctly create a resell order object", () => {
    const ticketPrice = 100;
    const ticketName = "VIP Ticket";
    const newTicketRef = { name: "VIP Ticket Ref", price: 120 };
    const eventName = "Sample Event";
    const orderId = "order_123";

    const result = createResellOrderObject(
      data,
      ticketPrice,
      ticketName,
      newTicketRef,
      eventName,
      orderId,
      {
        hasResell: true,
        resellQueueNumber: 1,
        resellHighestPrice: true,
        resellFee: 0.2,
      }
    );

    expect(result).toEqual({
      ticketName: ticketName,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      eventId: data.eventId,
      ticketId: data.ticketId,
      eventName: eventName,
      status: "Pending",
      newTicketRef: newTicketRef.name,
      earning: ticketPrice * 0.2, // 20% of ticketPrice
      deltaEarning: newTicketRef.price - ticketPrice, // price difference
      total: ticketPrice * 0.8, // 80% of ticketPrice
      bankName: data.bankName,
      bankAccountType: data.bankAccountType,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
      bankAccountDni: data.bankAccountDni,
      bankAccountEmail: data.bankAccountEmail,
      eventImageUrl: data.eventImageUrl,
      orderPriority: 0,
      orderId: orderId ?? "",
    });
  });

  it("should handle missing orderId", () => {
    const ticketPrice = 100;
    const ticketName = "VIP Ticket";
    const newTicketRef = { name: "VIP Ticket Ref", price: 120 };
    const eventName = "Sample Event";

    const result = createResellOrderObject(
      data,
      ticketPrice,
      ticketName,
      newTicketRef,
      eventName,

      "",
      {
        hasResell: true,
        resellQueueNumber: 1,
        resellHighestPrice: true,
        resellFee: 0.2,
      }
    );

    expect(result.orderId).toBe("");
  });

  it("should correctly create a resell order with max", () => {
    const ticketPrice = 100;
    const ticketName = "VIP Ticket";
    const newTicketRef = { name: "VIP Ticket Ref", price: 120 };
    const eventName = "Sample Event";
    const orderId = "order_123";

    const result = createResellOrderObject(
      data,
      ticketPrice,
      ticketName,
      newTicketRef,
      eventName,
      orderId,
      {
        hasResell: true,
        resellQueueNumber: 1,
        resellHighestPrice: true,
        resellFee: 0.2,
        resellMax: 90,
        resellReturn: 1,
      }
    );

    expect(result).toEqual({
      ticketName: ticketName,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      eventId: data.eventId,
      ticketId: data.ticketId,
      eventName: eventName,
      status: "Pending",
      newTicketRef: newTicketRef.name,
      earning: 10, // 20% of ticketPrice
      deltaEarning: newTicketRef.price - ticketPrice, // price difference
      total: 90, // 80% of ticketPrice
      bankName: data.bankName,
      bankAccountType: data.bankAccountType,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
      bankAccountDni: data.bankAccountDni,
      bankAccountEmail: data.bankAccountEmail,
      eventImageUrl: data.eventImageUrl,
      orderPriority: 0,
      orderId: orderId ?? "",
    });
  });

  it("should correctly create a resell order with resell return", () => {
    const ticketPrice = 100;
    const ticketName = "VIP Ticket";
    const newTicketRef = { name: "VIP Ticket Ref", price: 120 };
    const eventName = "Sample Event";
    const orderId = "order_123";

    const result = createResellOrderObject(
      data,
      ticketPrice,
      ticketName,
      newTicketRef,
      eventName,
      orderId,
      {
        hasResell: true,
        resellQueueNumber: 1,
        resellHighestPrice: true,
        resellFee: 0.2,
        resellReturn: 1,
      }
    );

    expect(result).toEqual({
      ticketName: ticketName,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      eventId: data.eventId,
      ticketId: data.ticketId,
      eventName: eventName,
      status: "Pending",
      newTicketRef: newTicketRef.name,
      earning: 0, // 20% of ticketPrice
      deltaEarning: newTicketRef.price - ticketPrice, // price difference
      total: 100, // 80% of ticketPrice
      bankName: data.bankName,
      bankAccountType: data.bankAccountType,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
      bankAccountDni: data.bankAccountDni,
      bankAccountEmail: data.bankAccountEmail,
      eventImageUrl: data.eventImageUrl,
      orderPriority: 0,
      orderId: orderId ?? "",
    });
  });
});
