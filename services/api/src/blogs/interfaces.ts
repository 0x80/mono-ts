import type { Timestamp } from "firebase-admin/firestore";

type Content = {
  type: string;
  image: string;
  text: string;
};

export type Blog = {
  title: string;
  authorImage: string;
  authorName: string;
  createdAt?: Timestamp;
  minutesToRead: number;
  headerImage: string;
  headerImageText: string;
  content: Content[];
};
