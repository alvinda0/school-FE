// components/ViewTeacherSubjectsModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, User } from "lucide-react";
import { Teacher } from "@/types/teacher";
import { Badge } from "@/components/ui/badge";

interface ViewTeacherSubjectsModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewTeacherSubjectsModal = ({
  teacher,
  open,
  onOpenChange,
}: ViewTeacherSubjectsModalProps) => {
  if (!teacher) return null;

  const subjects = teacher.subjects || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mata Pelajaran yang Diajarkan
          </DialogTitle>
          <DialogDescription>
            Daftar mata pelajaran yang diajarkan oleh guru ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Teacher Info */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {teacher.user.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  NIP: {teacher.nip} | Email: {teacher.user.email}
                </p>
              </div>
              <Badge variant={teacher.status === "ACTIVE" ? "default" : "secondary"}>
                {teacher.status}
              </Badge>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Mata Pelajaran ({subjects.length})
              </h3>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Belum ada mata pelajaran</p>
                <p className="text-sm mt-1">
                  Guru ini belum mengajar mata pelajaran apapun
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                {subjects.map((subject, index) => (
                  <div
                    key={subject.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {subject.code}
                          </Badge>
                          <h4 className="font-semibold text-gray-900">
                            {subject.name}
                          </h4>
                        </div>
                        {subject.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
