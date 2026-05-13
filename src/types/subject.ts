// types/subject.ts

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectPayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubjectPayload {
  name: string;
  code: string;
  description?: string;
}

export interface SubjectsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Subject[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SubjectDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Subject;
}

export interface SubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
}
