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
import { School, Calendar, Users, User, Phone, MapPin } from "lucide-react";
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
    queryKey: ["class-with-teacher", classId],
    queryFn: () => classService.getClassWithTeacher(classId!),
    enabled: !!classId && open,
  });

  const classData = data?.data;
  const teacher = classData?.homeroom_teacher;

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
          <LoadingState message="Memuat detail kelas..." />
        ) : classData ? (
          <div className="space-y-6">
            {/* Class Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <School className="h-4 w-4" />
                Informasi Kelas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Kelas</label>
                  <p className="text-base font-semibold">{classData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tingkat Kelas</label>
                  <p className="text-base font-semibold">Kelas {classData.grade_level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tahun Ajaran</label>
                  <p className="text-base font-semibold">{classData.academic_year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kapasitas Maksimal</label>
                  <p className="text-base font-semibold">{classData.max_students} siswa</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={classData.status === "ACTIVE" ? "default" : "secondary"}
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

            {/* Homeroom Teacher */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Wali Kelas
              </h3>
              {teacher ? (
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">NIP</label>
                    <p className="text-base font-semibold">{teacher.nip}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Jenis Kelamin</label>
                    <p className="text-base">{teacher.gender || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge
                        variant={teacher.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          teacher.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {teacher.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                  {teacher.phone_number && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telepon</label>
                        <p className="text-base">{teacher.phone_number}</p>
                      </div>
                    </div>
                  )}
                  {teacher.address && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Alamat</label>
                        <p className="text-base">{teacher.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg text-gray-500">
                  <Users className="h-5 w-5" />
                  <p className="text-sm">Belum ada wali kelas yang ditugaskan</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informasi Rekaman
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Dibuat Pada</label>
                  <p className="text-base">
                    {format(new Date(classData.created_at), "dd MMMM yyyy, HH:mm")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</label>
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
