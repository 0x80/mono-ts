/**
 * Import function triggers from their respective submodules:
 *
 * Import {onCall} from "firebase-functions/v2/https"; import
 * {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at
 * https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";

setGlobalOptions({
  maxInstances: 100,
  region: "southamerica-east1",
});

//import neo4j from "neo4j-driver";
import { db, storage, auth } from "@repo/firebase/firebase";

import {
  createUser as createUserHandler,
  onDeleteUser as onDeleteUserHandler,
  updateUser as updateUserHandler,
  changeUserRole as changeUserRoleHandler,
  addProducerToUser as addProducerToUserHandler,
  onCreateUser as onCreateUserHandler,
  uploadUserImage as uploadUserImageHandler,
  onUpdateUser as onUpdateUserHandler,
  createFollowRequest as createFollowRequestHandler,
  updateUserPrivacy as updateUserPrivacyHandler,
  onCreateFollowRequest as onCreateFollowRequestHandler,
  onDeleteFollowRequest as onDeleteFollowRequestHandler,
  onUpdateFollowRequest as onUpdateFollowRequestHandler,
  completeUserInfo as completeUserInfoHandler,
  sendPasswordResetEmail as sendPasswordResetEmailHandler,
} from "./users";
import { sendNotificationFunction as sendNotificationFunctionHandler } from "./notifications";
import {
  createEvent as createEventHandler,
  validateTicket as validateTicketHandler,
  expireEvent as expireEventHandler,
  activateTickets as activateTicketsHandler,
  resetEvents as resetEventsHandler,
  resellTicket as resellTicketHandler,
  cancelResellTicket as cancelResellTicketHandler,
  calculateTotal as calculateTotalHandler,
  updateEvent as updateEventHandler,
  onUpdateResellOrder as onUpdateResellOrderHandler,
  setEventStatus as setEventStatusHandler,
  updateEventValidators as updateEventValidatorsHandler,
  joinEventWaitingList as joinEventWaitingListHandler,
  onDeleteEvent as onDeleteEventHandler,
  addSchedule as addScheduleHandler,
  externalRedirected as externalRedirectedHandler,
  convertProducersToArray as convertProducersToArrayHandler,
  generateTicketFunction as generateTicketFunctionHandler,
  deleteEvent as deleteEventHandler,
  duplicateEvent as duplicateEventHandler,
  sendEventMessage as sendEventMessageHandler,
  generateTicketsFromCSV as generateTicketsFromCSVHandler,
  editScheduleFunction as editScheduleFunctionHandler,
  editRequiredMetadata as editRequiredMetadataHandler,
  editBlockedPaymentMethods as editBlockedPaymentMethodsHandler,
  fixTickets as fixTicketsHandler,
} from "./events";
import { sendContactMail as sendContactMailHandler } from "./mails";
import {
  createBlog as createBlogHandler,
  blogClickedFunction as blogClickedFunctionHandler,
} from "./blogs";
import { corsProxy as corsProxyHandler } from "./utils/corsProxy";
import {
  onUpdateOrder as onUpdateOrderHandler,
  expireOrder as expireOrderHandler,
  approveFreeOrder as approveFreeOrderHandler,
  createPresencialOrder as createPresencialOrderHandler,
  updateOrderMetadata as updateOrderMetadataHandler,
} from "./orders";
import { uploadImage as uploadImageHandler } from "./storage";
import {
  createProducer as createProducerHandler,
  updateProducer as updateProducerHandler,
  subscribeToProducer as subscribeToProducerHandler,
  onUpdateProducer as onUpdateProducerHandler,
  createProducerReview as createProducerReviewHandler,
  onCreateProducerReview as onCreateProducerReviewHandler,
} from "./producer";
import {
  floidPaymentsWebhook as floidPaymentsWebhookHandler,
  confirmWebPayNewCard as confirmWebPayNewCardHandler,
  webPayCreatePayment as webPayCreatePaymentHandler,
  getWebPayTransaction as getWebPayTransactionHandler,
  getEventsTicketsFromBigQuery as getEventsTicketsFromBigQueryHandler,
  createKhipuPayment as createKhipuPaymentHandler,
  khipuPaymentsWebhook as khipuPaymentsWebhookHandler,
  createFloidPayment as createFloidPaymentHandler,
  deleteWebPayTransaction as deleteWebPayTransactionHandler,
  getEventsOrdersFromBigQuery as getEventsOrdersFromBigQueryHandler,
  /* createMercadoPagoPaymentFromSavedCard as createMercadoPagoPaymentFromSavedCardHandler,
  createMercadoPagoPaymentFromNewCard as createMercadoPagoPaymentFromNewCardHandler, */
} from "./services";

// import {
//   createNeoDB as createNeoDBHandler,
//   queryNeoUsers as queryNeoUsersHandler,
//   getNeoFollowRecommendations as getNeoFollowRecommendationsHandler,
//   createNeoFollowRelation as createNeoFollowRelationsHandler,
//   getNeoFollowers as getNeoFollowersHandler,
//   getNeoFollowing as getNeoFollowingHandler,
//   deleteNeoFollowRelation as deleteNeoFollowRelationHandler,
//   getNeoFollowRequests as getNeoFollowRequestsHandler,
//   acceptNeoFollowRequest as acceptNeoFollowRequestHandler,
//   createNeoUser as createNeoUserHandler,
//   updateNeoUser as updateNeoUserHandler,
//   deleteNeoUser as deleteNeoUserHandler,
//   createNeoEvent as createNeoEventHandler,
//   updateNeoEvent as updateNeoEventHandler,
//   deleteNeoEvent as deleteNeoEventHandler,
//   createNeoAssistRelation as createNeoAssistRelationHandler,
//   checkNeoFollowingAssistants as checkNeoFollowingAssistantsHandler,
//   deleteNeoAssistRelation as deleteNeoAssistRelationHandler,
// } from "./neo4j";
//import { getCurrentEnv } from "./utils/getCurrentEnv";

//const { isDev } = getCurrentEnv();

// let neoDriver = null;
// if (isDev) {
//   neoDriver = neo4j.driver(
//     "neo4j+s://d0608abd.databases.neo4j.io",
//     neo4j.auth.basic("neo4j", "Z3Al1ZFtlWvOvtCzPJ3vp4z2L6jiMg1SIN-E6bs-s2Y")
//   );
// } else {
//   neoDriver = neo4j.driver(
//     "neo4j+s://a395218d.databases.neo4j.io",
//     neo4j.auth.basic("neo4j", "OD9fqiywkjpi6LCESEonMhZeNNdDUesJ77izBL-0AxMY")
//   );
// }

// User
export const createUser = createUserHandler(db);
export const onDeleteUser = onDeleteUserHandler(db);
export const updateUser = updateUserHandler(db);
export const changeUserRole = changeUserRoleHandler(db);
export const addProducerToUser = addProducerToUserHandler(db);
export const onCreateUser = onCreateUserHandler(db);
export const uploadUserImage = uploadUserImageHandler(db, storage);
export const onUpdateUser = onUpdateUserHandler();
export const createFollowRequest = createFollowRequestHandler(db);
export const updateUserPrivacy = updateUserPrivacyHandler(db);
export const completeUserInfo = completeUserInfoHandler(db);
export const sendPasswordResetEmail = sendPasswordResetEmailHandler();

// Follow Request
export const onCreateFollowRequest = onCreateFollowRequestHandler(db);
export const onDeleteFollowRequest = onDeleteFollowRequestHandler(db);
export const onUpdateFollowRequest = onUpdateFollowRequestHandler(db);

// Event
export const createEvent = createEventHandler(db, storage);
export const calculateTotal = calculateTotalHandler(db, auth);
export const expireEvent = expireEventHandler(db);
export const resetEvents = resetEventsHandler(db);
export const updateEvent = updateEventHandler(db, storage);
export const setEventStatus = setEventStatusHandler(db);
export const updateEventValidators = updateEventValidatorsHandler(db);
export const onDeleteEvent = onDeleteEventHandler();
export const addSchedule = addScheduleHandler(db);
export const convertProducersToArray = convertProducersToArrayHandler(db);
export const deleteEvent = deleteEventHandler(db);
export const duplicateEvent = duplicateEventHandler(db);
export const sendEventMessage = sendEventMessageHandler(db);
export const editScheduleFunction = editScheduleFunctionHandler(db);
export const editRequiredMetadata = editRequiredMetadataHandler(db);
export const editBlockedPaymentMethods = editBlockedPaymentMethodsHandler(db);
export const fixTickets = fixTicketsHandler(db);

// Ticket
export const resellTicket = resellTicketHandler(db);
export const cancelResellTicket = cancelResellTicketHandler(db);
export const activateTickets = activateTicketsHandler(db);
export const validateTicket = validateTicketHandler(db);
export const generateTicketFunction = generateTicketFunctionHandler(db);
export const generateTicketsFromCSV = generateTicketsFromCSVHandler(db);

// Waiting List
export const joinEventWaitingList = joinEventWaitingListHandler(db);

// Resell Order
export const onUpdateResellOrder = onUpdateResellOrderHandler(db);

// Stats
export const externalRedirected = externalRedirectedHandler(db);

// Order
export const onUpdateOrder = onUpdateOrderHandler(db);
export const expireOrder = expireOrderHandler(db);
export const approveFreeOrder = approveFreeOrderHandler(db);
export const createPresencialOrder = createPresencialOrderHandler(db);
export const updateOrderMetadata = updateOrderMetadataHandler(db);

// Producer
export const createProducer = createProducerHandler(db, storage);
export const updateProducer = updateProducerHandler(db, storage);
export const subscribeToProducer = subscribeToProducerHandler(db);
export const onUpdateProducer = onUpdateProducerHandler(db);
export const createProducerReview = createProducerReviewHandler(db);
export const onCreateProducerReview = onCreateProducerReviewHandler(db);

// Storage
export const uploadImage = uploadImageHandler(storage);

// Mail
export const sendContactMail = sendContactMailHandler(db);

// Blog
export const createBlog = createBlogHandler(db);
export const blogClickedFunction = blogClickedFunctionHandler(db);

// Notifications
export const sendNotificationFunction = sendNotificationFunctionHandler(db);

// Services
export const floidPaymentsWebhook = floidPaymentsWebhookHandler(db);
export const createFloidPayment = createFloidPaymentHandler(db);
export const confirmWebPayNewCard = confirmWebPayNewCardHandler(db);
export const webPayCreatePayments = webPayCreatePaymentHandler(db);
export const getWebPayTransaction = getWebPayTransactionHandler();
export const getEventsTicketsFromBigQuery =
  getEventsTicketsFromBigQueryHandler();
export const createKhipuPayment = createKhipuPaymentHandler(db);
export const khipuPaymentsWebhook = khipuPaymentsWebhookHandler(db);
export const deleteWebPayTransaction = deleteWebPayTransactionHandler(db);
export const getEventsOrdersFromBigQuery = getEventsOrdersFromBigQueryHandler();
/* export const createMercadoPagoPaymentFromSavedCard =
  createMercadoPagoPaymentFromSavedCardHandler(db);
export const createMercadoPagoPaymentFromNewCard =
  createMercadoPagoPaymentFromNewCardHandler(db); */

// Neo4j
// export const getNeoFollowers = getNeoFollowersHandler(neoDriver)(db);
// export const deleteNeoAssistRelation =
//   deleteNeoAssistRelationHandler(neoDriver)(db);
// export const createNeoDB = createNeoDBHandler(neoDriver)(db);
// export const queryNeoUsers = queryNeoUsersHandler(neoDriver)();
// export const getNeoFollowRecommendations =
//   getNeoFollowRecommendationsHandler(neoDriver)();
// export const createNeoFollowRelations =
//   createNeoFollowRelationsHandler(neoDriver)(db);
// export const getNeoFollowing = getNeoFollowingHandler(neoDriver)(db);
// export const deleteNeoFollowRelation =
//   deleteNeoFollowRelationHandler(neoDriver)(db);
// export const getNeoFollowRequests = getNeoFollowRequestsHandler(neoDriver);
// export const acceptNeoFollowRequest =
//   acceptNeoFollowRequestHandler(neoDriver)(db);

// export const createNeoAssistRelation =
//   createNeoAssistRelationHandler(neoDriver)(db);
// export const checkNeoFollowingAssistants =
//   checkNeoFollowingAssistantsHandler(neoDriver)();
// // Neo4j Handlers
// export const createNeoUser = createNeoUserHandler(neoDriver);
// export const updateNeoUser = updateNeoUserHandler(neoDriver);
// export const deleteNeoUser = deleteNeoUserHandler(neoDriver);
// export const createNeoEvent = createNeoEventHandler(neoDriver);
// export const updateNeoEvent = updateNeoEventHandler(neoDriver);
// export const deleteNeoEvent = deleteNeoEventHandler(neoDriver);

// Utils
export const corsProxy = corsProxyHandler;
