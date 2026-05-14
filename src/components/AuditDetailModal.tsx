// components/AuditDetailModal.tsx
"use client";

import { format } from "date-fns";
import { Shield, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuditLogData, AuditAction, HttpMethod } from "@/types/audit-log";

// ─── Config ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, { label: string; className: string }> = {
  create:         { label: "Create",         className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  update:         { label: "Update",         className: "bg-blue-100 text-blue-700 border-blue-200"         },
  partial_update: { label: "Partial Update", className: "bg-sky-100 text-sky-700 border-sky-200"            },
  delete:         { label: "Delete",         className: "bg-red-100 text-red-700 border-red-200"            },
};

const METHOD_CONFIG: Record<HttpMethod, string> = {
  GET:    "bg-gray-100 text-gray-700",
  POST:   "bg-emerald-100 text-emerald-700",
  PUT:    "bg-blue-100 text-blue-700",
  PATCH:  "bg-sky-100 text-sky-700",
  DELETE: "bg-red-100 text-red-700",
};

const STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  "2": { className: "bg-emerald-100 text-emerald-700", label: "Success"      },
  "3": { className: "bg-yellow-100 text-yellow-700",   label: "Redirect"     },
  "4": { className: "bg-orange-100 text-orange-700",   label: "Client Error" },
  "5": { className: "bg-red-100 text-red-700",         label: "Server Error" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd MMM yyyy, HH:mm:ss");
  } catch {
    return dateStr;
  }
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: AuditAction }) {
  const cfg = ACTION_CONFIG[action] ?? { label: action, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${METHOD_CONFIG[method] ?? "bg-gray-100 text-gray-700"}`}>
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const cfg = STATUS_CONFIG[String(code)[0]] ?? { className: "bg-gray-100 text-gray-700", label: "" };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${cfg.className}`}>
      {code} {cfg.label && <span className="font-sans font-normal opacity-60 text-[11px]">· {cfg.label}</span>}
    </span>
  );
}

// ─── Data Diff ────────────────────────────────────────────────────────────────

function DataDiff({ log }: { log: AuditLogData }) {
  if (log.action === "create" && log.new_data) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created Data</p>
        <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {Object.entries(log.new_data).map(([k, v]) => (
            <div key={k} className="flex gap-3 px-3 py-2 text-sm">
              <span className="w-32 shrink-0 text-xs text-gray-400">{k}</span>
              <span className="text-gray-700 font-mono text-xs break-all">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (log.action === "delete" && log.deleted_data) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Deleted Data</p>
        <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {Object.entries(log.deleted_data).map(([k, v]) => (
            <div key={k} className="flex gap-3 px-3 py-2 text-sm">
              <span className="w-32 shrink-0 text-xs text-gray-400">{k}</span>
              <span className="text-red-500 font-mono text-xs line-through break-all">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if ((log.action === "update" || log.action === "partial_update") && log.changes) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Changes</p>
        <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {Object.entries(log.changes).map(([field, diff]) => (
            <div key={field} className="px-3 py-2.5">
              <p className="text-xs text-gray-500 mb-1.5">{field}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-red-500 line-through">{String(diff.old)}</span>
                <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="font-mono text-xs text-emerald-600">{String(diff.new)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export interface AuditDetailModalProps {
  log: AuditLogData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AuditDetailModal({ log, open, onOpenChange }: AuditDetailModalProps) {
  if (!log) return null;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Actor",       value: <span className="font-medium">{log.full_name}</span> },
    { label: "Role",        value: <span className="capitalize">{log.role_name}</span> },
    { label: "Method",      value: <MethodBadge method={log.method} /> },
    { label: "Endpoint",    value: <span className="font-mono text-xs break-all">{log.endpoint}</span> },
    { label: "Status",      value: <StatusBadge code={log.status_code} /> },
    { label: "Duration",    value: <span className="font-mono text-xs">{log.duration_ms} ms</span> },
    { label: "IP Address",  value: <span className="font-mono text-xs">{log.ip_address}</span> },
    { label: "User Agent",  value: <span className="text-xs text-gray-500 break-all">{log.user_agent}</span> },
    { label: "Entity Type", value: <span className="capitalize">{log.entity_type}</span> },
    { label: "Entity ID",   value: <span className="font-mono text-xs text-gray-500">{log.entity_id ?? "—"}</span> },
    { label: "Log ID",      value: <span className="font-mono text-xs text-gray-400">{log.id}</span> },
    { label: "Timestamp",   value: formatDateTime(log.created_at) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Shield className="w-4 h-4 text-gray-400" />
            Audit Log Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Action + entity */}
          <div className="flex items-center gap-2">
            <ActionBadge action={log.action} />
            <span className="text-sm text-gray-400">
              on <span className="text-gray-600 capitalize">{log.entity_type}</span>
            </span>
          </div>

          {/* Key-value table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100 text-sm">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex gap-3 px-3 py-2">
                <span className="w-28 shrink-0 text-xs text-gray-400 pt-0.5">{label}</span>
                <span className="flex-1 text-gray-700">{value}</span>
              </div>
            ))}
          </div>

          {/* Data snapshot */}
          <DataDiff log={log} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
