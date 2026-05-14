// services/class.service.ts
import { apiClient } from "@/lib/axios";
import { ClassesResponse, ClassDetailResponse, ClassFilters, CreateClassPayload, UpdateClassPayload, ClassStudentsResponse, ClassWithTeacherResponse } from "@/types/class";

export const classService = {
  // Get all classes
  getClasses: async (filters?: ClassFilters): Promise<ClassesResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.grade_level) params.append("grade_level", filters.grade_level.toString());
    if (filters?.academic_year) params.append("academic_year", filters.academic_year);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const url = queryString ? `/api/v1/classes?${queryString}` : "/api/v1/classes";
    
    const response = await apiClient.get<ClassesResponse>(url);
    return response.data;
  },

  // Get class by ID
  getClassById: async (id: string): Promise<ClassDetailResponse> => {
    const response = await apiClient.get<ClassDetailResponse>(`/api/v1/classes/${id}`);
    return response.data;
  },

  // Get class with homeroom teacher details
  getClassWithTeacher: async (id: string): Promise<ClassWithTeacherResponse> => {
    const response = await apiClient.get<ClassWithTeacherResponse>(`/api/v1/classes/${id}/teacher`);
    return response.data;
  },

  // Create new class
  createClass: async (data: CreateClassPayload) => {
    const response = await apiClient.post("/api/v1/classes", data);
    return response.data;
  },

  // Update class
  updateClass: async (id: string, data: UpdateClassPayload) => {
    const response = await apiClient.put(`/api/v1/classes/${id}`, data);
    return response.data;
  },

  // Delete class
  deleteClass: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/classes/${id}`);
    return response.data;
  },

  // Get students in a class
  getStudentsByClass: async (classId: string): Promise<ClassStudentsResponse> => {
    const response = await apiClient.get<ClassStudentsResponse>(`/api/v1/classes/${classId}/students`);
    return response.data;
  },

  // Add students to a class
  addStudentsToClass: async (classId: string, studentIds: string[]) => {
    const response = await apiClient.post(`/api/v1/classes/${classId}/students`, {
      student_ids: studentIds,
    });
    return response.data;
  },

  // Remove student from a class
  removeStudentFromClass: async (classId: string, studentId: string) => {
    const response = await apiClient.delete(`/api/v1/classes/${classId}/students/${studentId}`);
    return response.data;
  },
};
