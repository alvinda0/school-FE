// components/DeleteSubjectModal.tsx
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
import { subjectService } from "@/services/subject.service";
import { Subject } from "@/types/subject";
import { toast } from "sonner";

interface DeleteSubjectModalProps {
  subject: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteSubjectModal = ({
  subject,
  open,
  onOpenChange,
}: DeleteSubjectModalProps) => {
  const queryClient = useQueryClient();

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectService.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Mata pelajaran berhasil dihapus!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus mata pelajaran");
    },
  });

  const handleDelete = () => {
    if (subject) {
      deleteMutation.mutate(subject.id);
    }
  };

  if (!subject) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Apakah Anda yakin ingin menghapus mata pelajaran ini?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mt-2">
              <p className="font-semibold text-gray-900">
                {subject.code} - {subject.name}
              </p>
              {subject.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {subject.description}
                </p>
              )}
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
