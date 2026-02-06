export type User = {
  nickname: string;
  token: string;
  createdAt: string;
};

export type MeResponse = {
  ok: boolean;
  user: User | null;
};

export type RegisterBody = {
  nickname: string;
};

export type LoginBody = {
  nickname: string;
  token: string;
};
