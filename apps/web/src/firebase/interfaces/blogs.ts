import type { Timestamp } from "@firebase/firestore";

export type Blog = {
  authorImage: string;
  authorName: number;
  createdAt: Timestamp;
  headerImage: string;
  headerImageText: string;
  title: string;
  minutesToRead: number;
  clicked?: number;
};

export type BlogWithId = Blog & {
  id: string;
};
