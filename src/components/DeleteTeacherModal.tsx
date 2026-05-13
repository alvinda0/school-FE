// components/DeleteTeacherModal.tsx
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
import { teacherService } from "@/services/teacher.service";
import { Teacher } from "@/types/teacher";
import { toast } from "sonner";

interface DeleteTeacherModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export const DeleteTeacherModal = ({
  teacher,
  open,
  onOpenChange,
  onDeleteSuccess,
}: DeleteTeacherModalProps) => {
  const queryClient = useQueryClient();

  // Delete teacher mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => teacherService.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success("Teacher successfully deleted!");
      onOpenChange(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete teacher");
    },
  });

  const handleDelete = () => {
    if (teacher) {
      deleteMutation.mutate(teacher.id);
    }
  };

  if (!teacher) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this teacher?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mt-2">
              <p className="font-semibold text-gray-900">
                {teacher.nip} - {teacher.user.full_name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {teacher.user.email}
              </p>
              {teacher.phone_number && (
                <p className="text-sm text-gray-600">
                  {teacher.phone_number}
                </p>
              )}
            </div>
            <p className="text-red-600 font-medium mt-2">
              This action cannot be undone!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
