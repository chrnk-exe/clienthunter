import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginBody,
  MeResponse,
  PayloadCreateBody,
  PayloadCreateResponse,
  PayloadListResponse,
  RegisterBody,
  UpdateUserBody,
} from "./types";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api",
  credentials: "include",
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => "/users/me",
    }),
    register: builder.mutation<MeResponse, RegisterBody>({
      query: (body) => ({
        url: "/users/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<MeResponse, LoginBody>({
      query: (body) => ({
        url: "/users/login",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
    }),
    updateUser: builder.mutation<MeResponse, UpdateUserBody>({
      query: ({ nickname, ...body }) => ({
        url: `/users/${nickname}`,
        method: "PATCH",
        body,
      }),
    }),
    listCsrfPayloads: builder.query<PayloadListResponse, void>({
      query: () => "/csrf-payloads",
    }),
    createCsrfPayload: builder.mutation<
      PayloadCreateResponse,
      PayloadCreateBody
    >({
      query: (body) => ({
        url: "/csrf-payloads",
        method: "POST",
        body,
      }),
    }),
    listXssPayloads: builder.query<PayloadListResponse, void>({
      query: () => "/xss-payloads",
    }),
    createXssPayload: builder.mutation<
      PayloadCreateResponse,
      PayloadCreateBody
    >({
      query: (body) => ({
        url: "/xss-payloads",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateUserMutation,
  useListCsrfPayloadsQuery,
  useCreateCsrfPayloadMutation,
  useListXssPayloadsQuery,
  useCreateXssPayloadMutation,
} = api;
