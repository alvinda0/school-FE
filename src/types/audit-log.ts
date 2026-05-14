// types/audit-log.ts

export type AuditAction = "create" | "update" | "partial_update" | "delete";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface AuditChanges {
  [field: string]: {
    old: string | number | boolean | null;
    new: string | number | boolean | null;
  };
}

export interface AuditLogData {
  id: string;
  full_name: string;
  role_id: string;
  role_name: string;
  method: HttpMethod;
  endpoint: string;
  status_code: number;
  ip_address: string;
  user_agent: string;
  duration_ms: number;
  action: AuditAction;
  entity_id: string;
  entity_type: string;
  // Only present on create
  new_data?: Record<string, unknown>;
  // Only present on delete
  deleted_data?: Record<string, unknown>;
  // Only present on update / partial_update
  changes?: AuditChanges;
  created_at: string;
}

export interface AuditLogsResponse {
  status: number;
  success: boolean;
  message: string;
  data: AuditLogData[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  method?: HttpMethod;
  role_id?: string;
  user_id?: string;
}