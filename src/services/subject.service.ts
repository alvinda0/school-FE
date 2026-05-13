// services/subject.service.ts
import { apiClient } from "@/lib/axios";
import { SubjectsResponse, SubjectDetailResponse, SubjectFilters, CreateSubjectPayload, UpdateSubjectPayload } from "@/types/subject";

export const subjectService = {
  // Get all subjects
  getSubjects: async (filters?: SubjectFilters): Promise<SubjectsResponse> => {
    const response = await apiClient.get<SubjectsResponse>("/api/v1/subjects");
    return response.data;
  },

  // Get subject by ID
  getSubjectById: async (id: string): Promise<SubjectDetailResponse> => {
    const response = await apiClient.get<SubjectDetailResponse>(`/api/v1/subjects/${id}`);
    return response.data;
  },

  // Create new subject
  createSubject: async (data: CreateSubjectPayload) => {
    const response = await apiClient.post("/api/v1/subjects", data);
    return response.data;
  },

  // Update subject
  updateSubject: async (id: string, data: UpdateSubjectPayload) => {
    const response = await apiClient.put(`/api/v1/subjects/${id}`, data);
    return response.data;
  },

  // Delete subject
  deleteSubject: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/subjects/${id}`);
    return response.data;
  },
};
