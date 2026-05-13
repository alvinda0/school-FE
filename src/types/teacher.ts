// types/teacher.ts

export interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  nip: string;
  gender: "Laki-laki" | "Perempuan";
  birth_place?: string;
  birth_date?: string;
  religion?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
  user: User;
}

export interface CreateTeacherPayload {
  user_id: string;
  nip: string;
  gender: "Laki-laki" | "Perempuan";
  birth_place?: string;
  birth_date?: string;
  religion?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
}

export interface UpdateTeacherPayload {
  nip: string;
  gender: "Laki-laki" | "Perempuan";
  birth_place?: string;
  birth_date?: string;
  religion?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface TeachersResponse {
  status: number;
  success: boolean;
  message: string;
  data: Teacher[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TeacherDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Teacher;
}

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  gender?: string;
}
