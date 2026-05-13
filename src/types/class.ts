// types/class.ts

export interface Teacher {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  academic_year: string;
  max_students: number;
  status: "ACTIVE" | "INACTIVE";
  homeroom_teacher_id?: string;
  homeroom_teacher_name?: string;
  homeroom_teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

export interface CreateClassPayload {
  name: string;
  grade_level: number;
  academic_year: string;
  max_students: number;
  homeroom_teacher_id?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateClassPayload {
  name: string;
  grade_level: number;
  academic_year: string;
  max_students: number;
  homeroom_teacher_id?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ClassesResponse {
  status: number;
  success: boolean;
  message: string;
  data: Class[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ClassDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Class;
}

export interface ClassFilters {
  page?: number;
  limit?: number;
  grade_level?: number;
  academic_year?: string;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
}
