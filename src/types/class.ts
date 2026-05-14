// types/class.ts

export interface HomeroomTeacher {
  id: string;
  user_id: string;
  nip: string;
  gender: string;
  birth_place?: string;
  religion?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface ClassStudent {
  id: string;
  user_id: string;
  class_id: string;
  full_name?: string;
  email?: string;
  name?: string;
  nis: string;
  nisn: string;
  gender: string;
  birth_place: string;
  birth_date: string;
  religion: string;
  phone_number: string;
  address: string;
  previous_school: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
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
  homeroom_teacher?: HomeroomTeacher;
  students?: ClassStudent[];
  student_count?: number;
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

export interface ClassStudentsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Class & {
    students: ClassStudent[];
    current_students: number;
  };
}

export interface ClassWithTeacherResponse {
  status: number;
  success: boolean;
  message: string;
  data: Class;
}
