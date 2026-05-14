// app/(dashboard)/audit-logs/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Shield, Eye, Search, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/SelectInput";
import CustomDataTable from "@/components/CustomDataTable";
import { AuditDetailModal } from "@/components/AuditDetailModal";
import { auditLogService } from "@/services/audit-log.service";
import { userService } from "@/services/user.service";
import { AuditLogData, AuditAction, HttpMethod, AuditLogFilters } from "@/types/audit-log";

// ─── Config ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, { label: string; className: string }> = {
  create:         { label: "Create",         className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  update:         { label: "Update",         className: "bg-blue-100 text-blue-800 border-blue-200"         },
  partial_update: { label: "Partial Update", className: "bg-sky-100 text-sky-800 border-sky-200"            },
  delete:         { label: "Delete",         className: "bg-red-100 text-red-800 border-red-200"            },
};

const METHOD_CONFIG: Record<HttpMethod, { className: string }> = {
  GET:    { className: "bg-gray-100 text-gray-700"     },
  POST:   { className: "bg-emerald-100 text-emerald-700" },
  PUT:    { className: "bg-blue-100 text-blue-700"     },
  PATCH:  { className: "bg-sky-100 text-sky-700"       },
  DELETE: { className: "bg-red-100 text-red-700"       },
};

const STATUS_CONFIG: Record<string, { className: string }> = {
  "2": { className: "bg-emerald-100 text-emerald-700" },
  "3": { className: "bg-yellow-100 text-yellow-700"   },
  "4": { className: "bg-orange-100 text-orange-700"   },
  "5": { className: "bg-red-100 text-red-700"         },
};

const METHOD_OPTIONS = [
  { value: "all",    label: "All Methods" },
  { value: "GET",    label: "GET"         },
  { value: "POST",   label: "POST"        },
  { value: "PUT",    label: "PUT"         },
  { value: "PATCH",  label: "PATCH"       },
  { value: "DELETE", label: "DELETE"      },
];

const ROLE_OPTIONS = [
  { value: "all",         label: "All Roles"   },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin",       label: "Admin"       },
  { value: "teacher",     label: "Teacher"     },
  { value: "student",     label: "Student"     },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusClass(code: number) {
  const prefix = String(code)[0];
  return STATUS_CONFIG[prefix]?.className ?? "bg-gray-100 text-gray-700";
}

function formatDateTime(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd MMM yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: AuditAction }) {
  const cfg = ACTION_CONFIG[action] ?? { label: action, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  const cfg = METHOD_CONFIG[method] ?? { className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${cfg.className}`}>
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${getStatusClass(code)}`}>
      {code}
    </span>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  search: string;
  method: string;
  roleName: string;
  userId: string;
  onSearchChange: (v: string) => void;
  onMethodChange: (v: string) => void;
  onRoleNameChange: (v: string) => void;
  onUserIdChange: (v: string) => void;
  onReset: () => void;
  users: { id: string; full_name: string }[];
  activeFilterCount: number;
}

function FilterBar({
  search,
  method,
  roleName,
  userId,
  onSearchChange,
  onMethodChange,
  onRoleNameChange,
  onUserIdChange,
  onReset,
  users,
  activeFilterCount,
}: FilterBarProps) {
  const userOptions = [{ id: "all", full_name: "All Users" }, ...users];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-gray-500 hover:text-red-600"
          >
            <X className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search actor, endpoint..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Method */}
        <SelectInput
          data={METHOD_OPTIONS}
          value={method}
          onChange={onMethodChange}
          valueKey="value"
          labelKey="label"
          placeholder="HTTP Method"
          searchPlaceholder="Search method..."
        />

        {/* Role */}
        <SelectInput
          data={ROLE_OPTIONS}
          value={roleName}
          onChange={onRoleNameChange}
          valueKey="value"
          labelKey="label"
          placeholder="Role"
          searchPlaceholder="Search role..."
        />

        {/* User */}
        <SelectInput
          data={userOptions}
          value={userId}
          onChange={onUserIdChange}
          valueKey="id"
          labelKey="full_name"
          placeholder="User"
          searchPlaceholder="Search user..."
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [roleName, setRoleName] = useState("all");
  const [userId, setUserId] = useState("all");

  const filters: AuditLogFilters = {
    page,
    limit: perPage,
    ...(search.trim() && { search: search.trim() }),
    ...(method !== "all" && { method: method as HttpMethod }),
    ...(userId !== "all" && { user_id: userId }),
  };

  const activeFilterCount = [
    search.trim(),
    method !== "all" ? method : "",
    roleName !== "all" ? roleName : "",
    userId !== "all" ? userId : "",
  ].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditLogService.getAuditLogs(filters),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-for-filter"],
    queryFn: () => userService.getUsers(),
    staleTime: 5 * 60 * 1000,
  });

  const users = usersData?.data ?? [];

  // role_name filter applied client-side (API uses role_id, not role_name)
  const filteredData =
    roleName !== "all"
      ? (data?.data ?? []).filter((log) => log.role_name === roleName)
      : (data?.data ?? []);

  const handleView = (log: AuditLogData) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleReset = useCallback(() => {
    setSearch("");
    setMethod("all");
    setRoleName("all");
    setUserId("all");
    setPage(1);
  }, []);

  const columns = [
    {
      name: "Actor",
      selector: (row: AuditLogData) => row.full_name,
      sortable: true,
      grow: 1.2,
      minWidth: "140px",
      cell: (row: AuditLogData) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{row.full_name}</p>
          <p className="text-xs text-gray-400 capitalize">{row.role_name}</p>
        </div>
      ),
    },
    {
      name: "Action",
      selector: (row: AuditLogData) => row.action,
      sortable: true,
      grow: 1,
      minWidth: "140px",
      cell: (row: AuditLogData) => <ActionBadge action={row.action} />,
    },
    {
      name: "Entity",
      selector: (row: AuditLogData) => row.entity_type,
      sortable: true,
      grow: 0.8,
      minWidth: "110px",
      cell: (row: AuditLogData) => (
        <span className="capitalize text-sm">{row.entity_type}</span>
      ),
    },
    {
      name: "Method",
      selector: (row: AuditLogData) => row.method,
      sortable: true,
      grow: 0.6,
      minWidth: "90px",
      center: true,
      cell: (row: AuditLogData) => <MethodBadge method={row.method} />,
    },
    {
      name: "Endpoint",
      selector: (row: AuditLogData) => row.endpoint,
      grow: 2,
      minWidth: "200px",
      cell: (row: AuditLogData) => (
        <span className="font-mono text-xs text-gray-600 truncate">{row.endpoint}</span>
      ),
    },
    {
      name: "Status",
      selector: (row: AuditLogData) => row.status_code,
      sortable: true,
      grow: 0.5,
      minWidth: "80px",
      center: true,
      cell: (row: AuditLogData) => <StatusBadge code={row.status_code} />,
    },
    {
      name: "Duration",
      selector: (row: AuditLogData) => row.duration_ms,
      sortable: true,
      grow: 0.6,
      minWidth: "90px",
      center: true,
      cell: (row: AuditLogData) => (
        <span className="text-xs text-gray-500">{row.duration_ms} ms</span>
      ),
    },
    {
      name: "Timestamp",
      selector: (row: AuditLogData) => row.created_at,
      sortable: true,
      grow: 1.2,
      minWidth: "160px",
      cell: (row: AuditLogData) => (
        <span className="text-sm text-gray-600">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      name: "Actions",
      center: true,
      grow: 0.4,
      minWidth: "70px",
      cell: (row: AuditLogData) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 cursor-pointer"
          onClick={() => handleView(row)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activity and user actions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm">
          <Shield className="w-4 h-4" />
          <span>{data?.metadata?.total ?? 0} records</span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        method={method}
        roleName={roleName}
        userId={userId}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onMethodChange={(v) => { setMethod(v); setPage(1); }}
        onRoleNameChange={(v) => { setRoleName(v); setPage(1); }}
        onUserIdChange={(v) => { setUserId(v); setPage(1); }}
        onReset={handleReset}
        users={users}
        activeFilterCount={activeFilterCount}
      />

      {/* Table */}
      <CustomDataTable
        columns={columns}
        data={filteredData}
        progressPending={isLoading}
        pagination
        paginationServer
        paginationTotalRows={data?.metadata?.total ?? 0}
        paginationDefaultPage={page}
        onChangePage={(newPage) => setPage(newPage)}
        onChangeRowsPerPage={(newPerPage) => { setPerPage(newPerPage); setPage(1); }}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      />

      {/* Detail Modal */}
      <AuditDetailModal
        log={selectedLog}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default AuditLogsPage;
