// components/DeleteStudentModal.tsx
"use client";

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
import { studentService } from "@/services/student.service";
import { Student } from "@/types/student";
import { toast } from "sonner";

interface DeleteStudentModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export const DeleteStudentModal = ({
  student,
  open,
  onOpenChange,
  onDeleteSuccess,
}: DeleteStudentModalProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
      toast.success("Siswa berhasil dihapus!");
      onOpenChange(false);
      onDeleteSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus siswa");
    },
  });

  const handleDelete = () => {
    if (student) {
      deleteMutation.mutate(student.id);
    }
  };

  if (!student) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Siswa</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Apakah Anda yakin ingin menghapus siswa ini?</p>
            <div className="bg-gray-50 p-3 rounded-md mt-2">
              <p className="font-semibold text-gray-900">
                {student.nis} — {student.full_name || student.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">{student.email}</p>
              <p className="text-sm text-gray-600">
                {student.birth_place} · {student.phone_number}
              </p>
            </div>
            <p className="text-red-600 font-medium mt-2">
              Tindakan ini tidak dapat dibatalkan!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? (
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
