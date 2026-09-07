export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export type Post = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: Date;
};
