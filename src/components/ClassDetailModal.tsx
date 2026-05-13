// components/ClassDetailModal.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { School, Calendar, Users, BookOpen } from "lucide-react";
import { classService } from "@/services/class.service";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";

interface ClassDetailModalProps {
  classId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassDetailModal({
  classId,
  open,
  onOpenChange,
}: ClassDetailModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => classService.getClassById(classId!),
    enabled: !!classId && open,
  });

  const classData = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Detail Kelas
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="Loading class details..." />
        ) : classData ? (
          <div className="space-y-6">
            {/* Class Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <School className="h-5 w-5" />
                Informasi Kelas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Kelas
                  </label>
                  <p className="text-base font-semibold">{classData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tingkat Kelas
                  </label>
                  <p className="text-base font-semibold">
                    Kelas {classData.grade_level}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tahun Ajaran
                  </label>
                  <p className="text-base font-semibold">
                    {classData.academic_year}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kapasitas Maksimal
                  </label>
                  <p className="text-base font-semibold">
                    {classData.max_students} siswa
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Wali Kelas
                  </label>
                  <p className="text-base font-semibold">
                    {classData.homeroom_teacher_name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        classData.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={
                        classData.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {classData.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Siswa</p>
                    <p className="text-xl font-bold">0</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mata Pelajaran</p>
                    <p className="text-xl font-bold">0</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wali Kelas</p>
                    <p className="text-xl font-bold">
                      {classData.homeroom_teacher_name || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Rekaman
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dibuat Pada
                  </label>
                  <p className="text-base">
                    {format(new Date(classData.created_at), "dd MMMM yyyy, HH:mm")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Terakhir Diperbarui
                  </label>
                  <p className="text-base">
                    {format(new Date(classData.updated_at), "dd MMMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Data tidak ditemukan</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
