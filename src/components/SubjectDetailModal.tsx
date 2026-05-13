// components/SubjectDetailModal.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, BookOpen } from "lucide-react";
import { subjectService } from "@/services/subject.service";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";

interface SubjectDetailModalProps {
  subjectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubjectDetailModal = ({
  subjectId,
  open,
  onOpenChange,
}: SubjectDetailModalProps) => {
  // Fetch subject detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => subjectService.getSubjectById(subjectId!),
    enabled: !!subjectId && open,
  });

  const subject = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Mata Pelajaran</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="py-8">
            <LoadingState message="Memuat data mata pelajaran..." fullScreen={false} />
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p className="text-red-600">Gagal memuat data mata pelajaran</p>
          </div>
        )}

        {subject && (
          <div className="space-y-6">
            {/* Subject Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-5 w-5" />
                <span>Informasi Mata Pelajaran</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kode Mata Pelajaran
                  </label>
                  <p className="text-base font-semibold mt-1">{subject.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Mata Pelajaran
                  </label>
                  <p className="text-base font-semibold mt-1">{subject.name}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Deskripsi
                  </label>
                  <p className="text-base text-gray-700 mt-1">
                    {subject.description || "Tidak ada deskripsi"}
                  </p>
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                <span>Informasi Rekaman</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dibuat Pada
                  </label>
                  <p className="text-base mt-1">
                    {format(new Date(subject.created_at), "dd MMMM yyyy, HH:mm")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Terakhir Diperbarui
                  </label>
                  <p className="text-base mt-1">
                    {format(new Date(subject.updated_at), "dd MMMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
