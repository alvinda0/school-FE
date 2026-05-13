// components/RemoveTeacherSubjectsModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { toast } from "sonner";

interface RemoveTeacherSubjectsModalProps {
  teacherId: string;
  subjects: Array<{ id: string; code: string; name: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RemoveTeacherSubjectsModal = ({
  teacherId,
  subjects,
  open,
  onOpenChange,
}: RemoveTeacherSubjectsModalProps) => {
  const queryClient = useQueryClient();

  // Remove subjects mutation
  const removeMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      teacherService.removeSubjectsFromTeacher(teacherId, subjectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
      toast.success("Mata pelajaran berhasil dihapus!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Gagal menghapus mata pelajaran"
      );
    },
  });

  const handleRemove = () => {
    const subjectIds = subjects.map((s) => s.id);
    removeMutation.mutate(subjectIds);
  };

  if (!subjects || subjects.length === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Apakah Anda yakin ingin menghapus mata pelajaran berikut dari guru ini?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mt-2 space-y-2">
              {subjects.map((subject) => (
                <div key={subject.id} className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {subject.code} - {subject.name}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-red-600 font-medium mt-2">
              Tindakan ini tidak dapat dibatalkan!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeMutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={removeMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {removeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
