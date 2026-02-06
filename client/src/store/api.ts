import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginBody, MeResponse, RegisterBody } from "./types";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers) => {
    const nickname = localStorage.getItem("nickname");
    const token = localStorage.getItem("token");
    if (nickname) {
      headers.set("x-nickname", nickname);
    }
    if (token) {
      headers.set("x-token", token);
    }
    return headers;
  },
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
  }),
});

export const { useGetMeQuery, useRegisterMutation, useLoginMutation } = api;
