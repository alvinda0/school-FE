// services/audit-log.service.ts
import { apiClient } from "@/lib/axios";
import { AuditLogFilters, AuditLogsResponse } from "@/types/audit-log";

export const auditLogService = {
  // Get all audit logs
  getAuditLogs: async (filters?: AuditLogFilters): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.method) params.append("method", filters.method);
    if (filters?.role_id) params.append("role_id", filters.role_id);
    if (filters?.user_id) params.append("user_id", filters.user_id);

    const query = params.toString();
    const response = await apiClient.get<AuditLogsResponse>(
      `/api/v1/audit-logs${query ? `?${query}` : ""}`
    );
    return response.data;
  },
};