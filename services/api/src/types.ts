import type { Request } from "express";

export interface PostRequest<T> extends Request {
  body: T;
}
