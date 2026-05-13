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
  createTeacher: async (data: FormData) => {
    const response = await apiClient.post("/api/v1/teachers", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update teacher
  updateTeacher: async (id: string, data: FormData) => {
    const response = await apiClient.patch(`/api/v1/teachers/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete teacher
  deleteTeacher: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/teachers/${id}`);
    return response.data;
  },

  // Add subjects to teacher
  addSubjectsToTeacher: async (teacherId: string, subjectIds: string[]) => {
    const response = await apiClient.post(`/api/v1/teachers/${teacherId}/subjects`, {
      subject_ids: subjectIds,
    });
    return response.data;
  },

  // Get teacher subjects
  getTeacherSubjects: async (teacherId: string) => {
    const response = await apiClient.get(`/api/v1/teachers/${teacherId}/subjects`);
    return response.data;
  },

  // Remove subjects from teacher
  removeSubjectsFromTeacher: async (teacherId: string, subjectIds: string[]) => {
    const response = await apiClient.delete(`/api/v1/teachers/${teacherId}/subjects`, {
      data: {
        subject_ids: subjectIds,
      },
    });
    return response.data;
  },
};
