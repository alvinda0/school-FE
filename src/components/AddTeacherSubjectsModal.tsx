// components/AddTeacherSubjectsModal.tsx
"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, BookOpen } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { subjectService } from "@/services/subject.service";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddTeacherSubjectsModalProps {
  teacherId: string;
  teacherName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSubjects?: Array<{ id: string; code: string; name: string; description?: string }>;
}

export const AddTeacherSubjectsModal = ({
  teacherId,
  teacherName,
  open,
  onOpenChange,
  existingSubjects = [],
}: AddTeacherSubjectsModalProps) => {
  const queryClient = useQueryClient();
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Auto-select existing subjects when modal opens
  React.useEffect(() => {
    if (open && existingSubjects.length > 0) {
      setSelectedSubjectIds(existingSubjects.map((s) => s.id));
    }
  }, [open, existingSubjects]);

  // Fetch all subjects
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getSubjects(),
    enabled: open,
  });

  // Add subjects mutation
  const addSubjectsMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      teacherService.addSubjectsToTeacher(teacherId, subjectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Mata pelajaran berhasil ditambahkan!");
      setSelectedSubjectIds([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Gagal menambahkan mata pelajaran"
      );
    },
  });

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = () => {
    if (selectedSubjectIds.length === 0) {
      toast.error("Pilih minimal satu mata pelajaran");
      return;
    }
    addSubjectsMutation.mutate(selectedSubjectIds);
  };

  const handleClose = () => {
    setSelectedSubjectIds([]);
    onOpenChange(false);
  };

  const subjects = subjectsData?.data || [];
  const teacherSubjectIds = existingSubjects.map((s) => s.id);
  const isLoading = isLoadingSubjects;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tambah Mata Pelajaran
          </DialogTitle>
          <DialogDescription>
            Pilih mata pelajaran yang akan diajarkan oleh <strong>{teacherName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Tidak ada mata pelajaran</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600">
                Pilih mata pelajaran ({selectedSubjectIds.length} dipilih)
              </div>
              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const isExisting = teacherSubjectIds.includes(subject.id);
                    return (
                      <div
                        key={subject.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                          isExisting
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          id={subject.id}
                          checked={selectedSubjectIds.includes(subject.id)}
                          onCheckedChange={() => handleToggleSubject(subject.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor={subject.id}
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                          >
                            {subject.code} - {subject.name}
                            {isExisting && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Sudah ada
                              </span>
                            )}
                          </label>
                          {subject.description && (
                            <p className="text-sm text-gray-500">
                              {subject.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={addSubjectsMutation.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              addSubjectsMutation.isPending ||
              selectedSubjectIds.length === 0 ||
              subjects.length === 0
            }
          >
            {addSubjectsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menambahkan...
              </>
            ) : (
              `Tambah ${selectedSubjectIds.length > 0 ? `(${selectedSubjectIds.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
