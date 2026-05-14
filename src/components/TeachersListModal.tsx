// components/TeachersListModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { Teacher } from "@/types/subject";

interface TeachersListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  teachers: Teacher[];
}

export const TeachersListModal = ({
  open,
  onOpenChange,
  subjectName,
  teachers,
}: TeachersListModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Guru Pengajar — {subjectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {teachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <span className="text-sm font-medium text-gray-800">
                {teacher.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-2 text-right">
          Total: {teachers.length} guru
        </p>
      </DialogContent>
    </Dialog>
  );
};
