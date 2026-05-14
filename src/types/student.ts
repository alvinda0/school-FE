// types/student.ts

export interface Student {
  id: string;
  user_id: string;
  name?: string;
  full_name?: string;
  email?: string;
  nis: string;
  nisn: string;
  gender: "Laki-laki" | "Perempuan";
  birth_place: string;
  birth_date: string;
  religion: string;
  phone_number: string;
  address: string;
  previous_school: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED_OUT";
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentPayload {
  user_id: string;
  nis: string;
  nisn: string;
  gender: "Laki-laki" | "Perempuan";
  birth_place: string;
  birth_date: string;
  religion: string;
  phone_number: string;
  address: string;
  previous_school: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  photo_url?: string;
}

export interface UpdateStudentPayload {
  nis: string;
  nisn: string;
  gender: "Laki-laki" | "Perempuan";
  birth_place: string;
  birth_date: string;
  religion: string;
  phone_number: string;
  address: string;
  previous_school: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  photo_url?: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED_OUT";
}

export interface StudentsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Student[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface StudentDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Student;
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  gender?: string;
}
