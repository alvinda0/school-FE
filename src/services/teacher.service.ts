// services/teacher.service.ts
import { apiClient } from "@/lib/axios";
import { TeachersResponse, TeacherDetailResponse, TeacherFilters, CreateTeacherPayload, UpdateTeacherPayload } from "@/types/teacher";

export const teacherService = {
  // Get all teachers
  getTeachers: async (filters?: TeacherFilters): Promise<TeachersResponse> => {
    const response = await apiClient.get<TeachersResponse>("/api/v1/teachers");
    return response.data;
  },

  // Get teacher by ID
  getTeacherById: async (id: string): Promise<TeacherDetailResponse> => {
    const response = await apiClient.get<TeacherDetailResponse>(`/api/v1/teachers/${id}`);
    return response.data;
  },

  // Create new teacher
  createTeacher: async (data: CreateTeacherPayload) => {
    const response = await apiClient.post("/api/v1/teachers", data);
    return response.data;
  },

  // Update teacher
  updateTeacher: async (id: string, data: UpdateTeacherPayload) => {
    const response = await apiClient.put(`/api/v1/teachers/${id}`, data);
    return response.data;
  },

  // Delete teacher
  deleteTeacher: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/teachers/${id}`);
    return response.data;
  },
};
