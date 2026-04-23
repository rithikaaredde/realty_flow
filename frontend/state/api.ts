"use client";

import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { fetchAuthSession } from "aws-amplify/auth";
import "@/src/lib/amplifyConfig";
import { getAuthToken } from "@/src/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// ✅ SAFE base query (handles SSR + auth headers)
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    if (typeof window === "undefined") return headers;

    // Prefer Cognito session claims; fall back to legacy localStorage user.
    try {
      const token = await getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const session = await fetchAuthSession();
      const payload = (session.tokens?.idToken?.payload ?? {}) as Record<
        string,
        unknown
      >;

      const userId = (payload.sub as string | undefined) ?? null;
      const email = (payload.email as string | undefined) ?? null;
      const groups = (payload["cognito:groups"] as string[] | undefined) ?? [];
      const rawRole =
        localStorage.getItem("auth:preferredRole") === "OWNER"
          ? "owner"
          : localStorage.getItem("auth:preferredRole") === "TENANT"
            ? "tenant"
            : groups.includes("admin") || String(email ?? "").toLowerCase().includes("admin")
              ? "owner"
              : "tenant";
      const role = rawRole === "owner" ? "OWNER" : "TENANT";

      if (userId) {
        headers.set("x-user-id", userId);
        headers.set("x-user-role", role);
        headers.set("x-user-role-raw", rawRole);
      }
    } catch {
      const user = readStoredUser();
      const userId = user?.userId ?? user?.cognitoId;
      if (userId) headers.set("x-user-id", userId);
      const normalizedRole = String(
        user?.role ?? localStorage.getItem("auth:preferredRole") ?? "TENANT"
      ).toUpperCase();
      const role =
        normalizedRole === "OWNER" || normalizedRole === "MANAGER"
          ? "OWNER"
          : "TENANT";
      headers.set("x-user-role", role);
      const rawRole = role === "OWNER" ? "owner" : "tenant";
      headers.set("x-user-role-raw", rawRole);
    }

    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Favorites", "Properties", "Applications", "Tenant"],

  endpoints: (builder) => ({
    // 🔥 PROPERTIES
    getProperties: builder.query<any, Record<string, any>>({
      query: (filters) => ({
        url: "/properties",
        params: filters,
      }),
      providesTags: ["Properties"],
    }),

    getProperty: builder.query<any, number>({
      query: (id) => `/properties/${id}`,
    }),

    createProperty: builder.mutation<any, any>({
      query: (body) => ({
        url: "/properties",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Properties"],
    }),

    // ❤️ FAVORITES
    getFavorites: builder.query<any, string>({
      query: (cognitoId) => `/users/${cognitoId}/favorites`,
      providesTags: ["Favorites"],
    }),

    getFavoritesByUser: builder.query<any, string>({
      query: (userId) => `/favorites/user/${userId}`,
      providesTags: ["Favorites"],
    }),

    addFavorite: builder.mutation<
      any,
      { userId?: string; cognitoId?: string; propertyId: number }
    >({
      query: ({ userId, cognitoId, propertyId }) => {
        const id = userId ?? cognitoId;
        if (!id) throw new Error("Missing userId");

        // New endpoint (Airbnb-style upgrade)
        if (userId) {
          return {
            url: "/favorites",
            method: "POST",
            body: { userId, propertyId },
          };
        }

        // Legacy endpoint (keep working)
        return {
          url: `/users/${id}/favorites/${propertyId}`,
          method: "POST",
        };
      },
      invalidatesTags: ["Favorites", "Properties"],
    }),

    removeFavorite: builder.mutation<
      any,
      { userId?: string; cognitoId?: string; propertyId: number }
    >({
      query: ({ userId, cognitoId, propertyId }) => {
        const id = userId ?? cognitoId;
        if (!id) throw new Error("Missing userId");

        // New endpoint (Airbnb-style upgrade)
        if (userId) {
          return {
            url: `/favorites/${userId}/${propertyId}`,
            method: "DELETE",
          };
        }

        // Legacy endpoint (keep working)
        return {
          url: `/users/${id}/favorites/${propertyId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Favorites", "Properties"],
      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        if (!arg.userId) return;

        const patch = dispatch(
          api.util.updateQueryData(
            "getFavoritesByUser",
            arg.userId,
            (draft: any) => {
              const list = Array.isArray(draft?.data)
                ? draft.data
                : Array.isArray(draft)
                  ? draft
                  : null;
              if (!list) return;
              const next = list.filter((p: any) => p?.id !== arg.propertyId);
              if (Array.isArray(draft?.data)) draft.data = next;
              else {
                // If the API returns a raw array
                draft.length = 0;
                draft.push(...next);
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // 📄 APPLICATIONS
    getApplications: builder.query<any, Record<string, any>>({
      query: (filters) => ({
        url: "/applications",
        params: filters,
      }),
      providesTags: ["Applications"],
    }),

    createApplication: builder.mutation<any, any>({
      query: (body) => ({
        url: "/applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),

    createBooking: builder.mutation<any, any>({
      query: (body) => ({
        url: "/applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),

    getBookingsByUser: builder.query<any, string>({
      query: (userId) => `/applications/user/${userId}`,
      providesTags: ["Applications"],
    }),

    updateApplicationStatus: builder.mutation<
      any,
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications"],
    }),

    // 👤 TENANT PROFILE
    getTenantProfile: builder.query<any, string>({
      query: (id) => `/tenants/${id}`,
      providesTags: ["Tenant"],
    }),

    updateTenantProfile: builder.mutation<
      any,
      { cognitoId: string; data: any }
    >({
      query: ({ cognitoId, data }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Tenant"],
    }),

    // 🧑‍💼 MANAGER PROPERTIES (legacy page support)
    getManagerProperties: builder.query<any, string>({
      query: (cognitoId) => `/managers/${cognitoId}/properties`,
      providesTags: ["Properties"],
    }),
  }),
});

// ✅ EXPORT HOOKS
export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,

  useGetFavoritesQuery,
  useGetFavoritesByUserQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,

  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useCreateBookingMutation,
  useGetBookingsByUserQuery,
  useUpdateApplicationStatusMutation,

  useGetTenantProfileQuery,
  useUpdateTenantProfileMutation,

  useGetManagerPropertiesQuery,
} = api;