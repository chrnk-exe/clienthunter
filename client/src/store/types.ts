export type User = {
  id: string;
  nickname: string;
  xssPath: string;
  csrfPath: string;
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
  password: string;
};

export type UpdateUserBody = {
  nickname: string;
  password?: string;
  oldPassword?: string;
  xssPath?: string;
  csrfPath?: string;
};

export type PayloadType = "csrf" | "xss";

export type PayloadRecord = {
  id: string;
  type: PayloadType;
  payload: string;
  tag: string | null;
  userId: string | null;
  createdAt: string;
};

export type PayloadListResponse = {
  ok: boolean;
  items: PayloadRecord[];
};

export type PayloadCreateResponse = {
  ok: boolean;
  item: PayloadRecord;
};

export type PayloadCreateBody = {
  payload: string;
  tag?: string;
};

export type CallbackRecord = {
  id: number;
  userId: string;
  type: "xss" | "csrf";
  path: string;
  method: string;
  ip: string | null;
  userAgent: string | null;
  headers?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: string | null;
  createdAt: string;
};

export type CallbackListResponse = {
  ok: boolean;
  items: CallbackRecord[];
};

export type CallbackDetailResponse = {
  ok: boolean;
  item: CallbackRecord;
};
