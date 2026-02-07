import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginBody,
  MeResponse,
  PayloadCreateBody,
  PayloadCreateResponse,
  PayloadListResponse,
  CallbackListResponse,
  CallbackDetailResponse,
  RegisterBody,
  UpdateUserBody,
} from "./types";

const baseUrl = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Callbacks"],
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
    listCallbacks: builder.query<CallbackListResponse, void>({
      query: () => "/callbacks",
      providesTags: ["Callbacks"],
    }),
    getCallback: builder.query<CallbackDetailResponse, number>({
      query: (id) => `/callbacks/${id}`,
    }),
    deleteCallback: builder.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `/callbacks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Callbacks"],
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
  useListCallbacksQuery,
  useGetCallbackQuery,
  useLazyGetCallbackQuery,
  useDeleteCallbackMutation,
} = api;
