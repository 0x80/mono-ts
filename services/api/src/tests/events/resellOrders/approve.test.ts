import * as admin from "firebase-admin";
import type { ResellOrderWithId } from "../../../events/resellOrders/interfaces";
import { deleteQrInfos } from "../../../events/resellOrders/approve";

import { FakeFirestore } from "firestore-jest-mock";

describe("deleteQrInfos", () => {
  it("should delete specified QR infos from orders", async () => {
    const db = new FakeFirestore({
      orders: [
        {
          id: "order_123",
          orderId: "order_123",
          qrInfos: [
            { ticketId: "ticket_1", name: "VIP", url: "url_1" },
            { ticketId: "ticket_2", name: "VIP", url: "url_2" },
          ],
        },
      ],
    });

    const resellOrders: ResellOrderWithId[] = [
      {
        id: "resell_1",
        userId: "user_123",
        eventId: "event_123",
        userName: "John Doe",
        userEmail: "john.doe@example.com",
        ticketId: "ticket_1",
        status: "Pending",
        earning: 100,
        deltaEarning: 50,
        total: 150,
        bankName: "Sample Bank",
        bankAccountType: "Checking",
        bankAccountNumber: "123456789",
        bankAccountName: "John Doe",
        bankAccountDni: "12345678A",
        bankAccountEmail: "john.doe@example.com",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        ticketName: "VIP",
        orderPriority: 1,
        eventName: "Sample Event",
        eventImageUrl: "sample_event_image_url",
        orderId: "order_123",
        newTicketRef: "VIP",
      },
    ];

    const updatedOrders = await deleteQrInfos(db, resellOrders);

    expect(updatedOrders).toEqual({
      order_123: [{ ticketId: "ticket_2", name: "VIP", url: "url_2" }],
    });
  });
});

/* describe("getResellOrders", () => {
  let db: admin.firestore.Firestore;

  beforeEach(() => {
// Using our fake Firestore from above:
mockFirebase({
  database: {
    users: [
      {
        id: 'abc123',
        name: 'Homer Simpson',
      },
      {
        id: 'abc456',
        name: 'Lisa Simpson',
        _collections: {
          notes: [
            {
              id: 'note123',
              text: 'This is a document in a subcollection!',
            },
          ],
        },
      },
    ],
    posts: [{ id: '123abc', title: 'Really cool title' }],
  },
});
  });

  it("should fetch resell orders based on order items", async () => {
    const order: Order = {
      eventId: "event456",
      items: [
        {
          name: "VIP",
          resellingCount: 2,
          price: 100,
          quantity: 5,
          type: "VIP",
          ids: ["ticket_1", "ticket_2"],
          normalCount: 3,
        },
        {
          name: "Regular",
          resellingCount: 0,
          price: 50,
          quantity: 3,
          type: "Regular",
          ids: ["ticket_3", "ticket_4"],
          normalCount: 3,
        },
        {
          name: "Standard",
          resellingCount: 1,
          price: 30,
          quantity: 2,
          type: "Standard",
          ids: ["ticket_5"],
          normalCount: 1,
        },
      ],
      totalSelled: 1000,
      totalWithServiceFeeSelled: 1100,
      serviceFeeSelled: 100,
      userId: "user_123",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      status: "Completed",
      userName: "John Doe",
      eventName: "Sample Event",
      eventEndDate: admin.firestore.Timestamp.now(),
      eventStartDate: admin.firestore.Timestamp.now(),
      eventActivationDate: admin.firestore.Timestamp.now(),
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
        {
          ticketId: "ticket_2",
          name: "VIP",
          url: "url_2",
        },
      ],
      isEventActivated: true,
      producerId: "producer_123",
    };

    mockCollection.mockReturnThis();
    mockDoc.mockReturnThis();
    mockQuery.mockReturnThis();
    mockWhere.mockReturnThis();
    mockOrderBy.mockReturnThis();
    mockLimit.mockReturnThis();

    const resellOrderData = {
      userId: "user123",
      eventId: "event456",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      ticketId: "ticket123",
      status: "Pending",
      earning: 50,
      deltaEarning: 5,
      total: 55,
      bankName: "Bank",
      bankAccountType: "Checking",
      bankAccountNumber: "12345678",
      bankAccountName: "John Doe",
      bankAccountDni: "12345678A",
      bankAccountEmail: "john.doe@example.com",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      ticketName: "VIP",
      orderPriority: 1,
      eventName: "Sample Event",
      eventImageUrl: "sample_image_url",
      orderId: "order123",
    };

    mockGet.mockResolvedValueOnce({
      docs: [
        { id: "resellOrder123", data: () => resellOrderData },
        { id: "resellOrder124", data: () => resellOrderData },
      ],
    });

    const { resellOrdersArray } = await getResellOrders(db, order);

    expect(mockCollection).toHaveBeenCalledWith("events");
    expect(mockDoc).toHaveBeenCalledWith("event456");
    expect(mockCollection).toHaveBeenCalledWith("resellOrders");
    expect(mockWhere).toHaveBeenCalledWith("status", "==", "Pending");
    expect(mockWhere).toHaveBeenCalledWith("newTicketRef", "==", "VIP");
    expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "asc");
    expect(mockLimit).toHaveBeenCalledWith(2);

    expect(resellOrdersArray).toHaveLength(2);
    expect(resellOrdersArray[0]).toEqual({
      id: "resellOrder123",
      ...resellOrderData,
    });
    expect(resellOrdersArray[1]).toEqual({
      id: "resellOrder124",
      ...resellOrderData,
    });
  });
}); */
