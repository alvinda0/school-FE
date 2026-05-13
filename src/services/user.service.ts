// services/user.service.ts
import { apiClient } from "@/lib/axios";
import { UsersResponse, UserDetailResponse, UserFilters } from "@/types/user";

export const userService = {
  // Get all users
  getUsers: async (filters?: UserFilters): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>("/api/v1/users");
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<UserDetailResponse> => {
    const response = await apiClient.get<UserDetailResponse>(`/api/v1/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: any) => {
    const response = await apiClient.post("/api/v1/users", data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/users/${id}`);
    return response.data;
  },
};
