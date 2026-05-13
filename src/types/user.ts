// types/user.ts

export interface UserData {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
  role_name: string;
  status: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  status: number;
  success: boolean;
  message: string;
  data: UserData[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface UserDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: UserData;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: boolean;
}
