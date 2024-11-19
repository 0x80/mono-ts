import { getFunctions } from "firebase/functions";
import firebase_app from "../config";

const functions = getFunctions(firebase_app, "southamerica-east1");
export default functions;
