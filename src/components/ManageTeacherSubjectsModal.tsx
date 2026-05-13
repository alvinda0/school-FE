// components/ManageTeacherSubjectsModal.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, User } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { Teacher } from "@/types/teacher";
import LoadingState from "@/components/LoadingState";
import { Checkbox } from "@/components/ui/checkbox";
import { AddTeacherSubjectsModal } from "./AddTeacherSubjectsModal";
import { RemoveTeacherSubjectsModal } from "./RemoveTeacherSubjectsModal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageTeacherSubjectsModalProps {
  teachers: Teacher[];
  selectedTeacher?: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageTeacherSubjectsModal = ({
  teachers,
  selectedTeacher: initialTeacher,
  open,
  onOpenChange,
}: ManageTeacherSubjectsModalProps) => {
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Update selected teacher when modal opens or initialTeacher changes
  React.useEffect(() => {
    if (open && initialTeacher) {
      setSelectedTeacherId(initialTeacher.id);
    }
  }, [open, initialTeacher]);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Fetch teacher subjects only if not available in teacher data
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["teacher-subjects", selectedTeacherId],
    queryFn: () => teacherService.getTeacherSubjects(selectedTeacherId),
    enabled: open && !!selectedTeacherId && !selectedTeacher?.subjects,
  });

  // Use subjects from teacher data if available, otherwise use fetched data
  const teacherSubjects = selectedTeacher?.subjects || subjectsData?.data || [];

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjectIds.length === teacherSubjects.length) {
      setSelectedSubjectIds([]);
    } else {
      setSelectedSubjectIds(teacherSubjects.map((s: any) => s.id));
    }
  };

  const selectedSubjects = teacherSubjects.filter((s: any) =>
    selectedSubjectIds.includes(s.id)
  );

  const handleClose = () => {
    setSelectedSubjectIds([]);
    setSelectedTeacherId("");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Kelola Mata Pelajaran Guru
            </DialogTitle>
            <DialogDescription>
              Pilih guru dan kelola mata pelajaran yang diajarkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Teacher Info */}
            {selectedTeacher && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {selectedTeacher.user.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      NIP: {selectedTeacher.nip} | Email:{" "}
                      {selectedTeacher.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedTeacherId && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex gap-2">
                  {teacherSubjects.length > 0 && (
                    <>
                      {selectedSubjectIds.length > 0 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => setIsRemoveModalOpen(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus ({selectedSubjectIds.length})
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAll}
                      >
                        {selectedSubjectIds.length === teacherSubjects.length
                          ? "Batal Pilih Semua"
                          : "Pilih Semua"}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Mata Pelajaran
                </Button>
              </div>
            )}

            {/* Subjects List */}
            {selectedTeacherId && (
              <div className="border rounded-md">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm font-medium">
                    Mata Pelajaran yang Diajarkan
                  </p>
                </div>
                <div className="p-4">
                  {!selectedTeacher?.subjects && isLoadingSubjects ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingState message="Memuat mata pelajaran..." />
                    </div>
                  ) : teacherSubjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Belum ada mata pelajaran</p>
                      <p className="text-sm mt-1">
                        Klik "Tambah Mata Pelajaran" untuk menambahkan
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {teacherSubjects.map((subject: any) => (
                          <div
                            key={subject.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              selectedSubjectIds.includes(subject.id)
                                ? "border-primary bg-primary/5"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <Checkbox
                              id={`subject-${subject.id}`}
                              checked={selectedSubjectIds.includes(subject.id)}
                              onCheckedChange={() =>
                                handleToggleSubject(subject.id)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`subject-${subject.id}`}
                                className="cursor-pointer"
                              >
                                <p className="font-semibold text-gray-900">
                                  {subject.code}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {subject.name}
                                </p>
                                {subject.description && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {subject.description}
                                  </p>
                                )}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subjects Modal */}
      {selectedTeacher && (
        <AddTeacherSubjectsModal
          teacherId={selectedTeacher.id}
          teacherName={selectedTeacher.user.full_name}
          existingSubjects={teacherSubjects}
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
              // Refresh teacher subjects after adding
              queryClient.invalidateQueries({ queryKey: ["teachers"] });
            }
          }}
        />
      )}

      {/* Remove Subjects Modal */}
      {selectedTeacher && (
        <RemoveTeacherSubjectsModal
          teacherId={selectedTeacher.id}
          subjects={selectedSubjects}
          open={isRemoveModalOpen}
          onOpenChange={(open) => {
            setIsRemoveModalOpen(open);
            if (!open) {
              setSelectedSubjectIds([]);
              // Refresh teacher subjects after removing
              queryClient.invalidateQueries({ queryKey: ["teachers"] });
            }
          }}
        />
      )}
    </>
  );
};
