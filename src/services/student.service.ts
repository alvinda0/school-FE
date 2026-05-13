// services/student.service.ts
import { apiClient } from "@/lib/axios";
import { StudentsResponse, StudentDetailResponse, StudentFilters } from "@/types/student";

export const studentService = {
  // Get all students
  getStudents: async (filters?: StudentFilters): Promise<StudentsResponse> => {
    const response = await apiClient.get<StudentsResponse>("/api/v1/students");
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id: string): Promise<StudentDetailResponse> => {
    const response = await apiClient.get<StudentDetailResponse>(`/api/v1/students/${id}`);
    return response.data;
  },

  // Create new student
  createStudent: async (data: any) => {
    const response = await apiClient.post("/api/v1/students", data);
    return response.data;
  },

  // Update student
  updateStudent: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/v1/students/${id}`, data);
    return response.data;
  },

  // Delete student
  deleteStudent: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/students/${id}`);
    return response.data;
  },
};
