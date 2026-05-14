// components/ClassStudentsModal.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trash2, Search } from "lucide-react";
import { classService } from "@/services/class.service";
import { studentService } from "@/services/student.service";
import { ClassStudent } from "@/types/class";
import { Student } from "@/types/student";
import LoadingState from "@/components/LoadingState";
import { toast } from "sonner";

interface ClassStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
}

export const ClassStudentsModal = ({
  open,
  onOpenChange,
  classId,
  className,
}: ClassStudentsModalProps) => {
  const queryClient = useQueryClient();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch students already in this class
  const { data: classStudentsData, isLoading: isLoadingClassStudents } = useQuery({
    queryKey: ["class-students", classId],
    queryFn: () => classService.getStudentsByClass(classId),
    enabled: !!classId && open,
  });

  // Fetch all students when add panel is open
  const { data: allStudentsData, isLoading: isLoadingAllStudents } = useQuery({
    queryKey: ["students-all"],
    queryFn: () => studentService.getStudents(),
    enabled: showAddPanel,
  });

  const classStudents: ClassStudent[] = Array.isArray(classStudentsData?.data?.students)
    ? classStudentsData.data.students
    : [];

  const allStudents: Student[] = Array.isArray(allStudentsData?.data)
    ? allStudentsData.data
    : [];

  // Exclude students already in class
  const classStudentIds = new Set(classStudents.map((s) => s.id));
  const availableStudents = allStudents.filter((s) => {
    if (classStudentIds.has(s.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.nis?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.nisn?.toLowerCase().includes(q)
    );
  });

  // POST /api/v1/classes/:id/students
  const addMutation = useMutation({
    mutationFn: () => classService.addStudentsToClass(classId, selectedIds),
    onSuccess: () => {
      toast.success("Siswa berhasil ditambahkan ke kelas");
      queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setSelectedIds([]);
      setSearch("");
      setShowAddPanel(false);
    },
    onError: () => {
      toast.error("Gagal menambahkan siswa");
    },
  });

  // DELETE /api/v1/classes/:id/students/:studentId
  const removeMutation = useMutation({
    mutationFn: (studentId: string) =>
      classService.removeStudentFromClass(classId, studentId),
    onSuccess: () => {
      toast.success("Siswa berhasil dihapus dari kelas");
      queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: () => {
      toast.error("Gagal menghapus siswa dari kelas");
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setShowAddPanel(false);
      setSelectedIds([]);
      setSearch("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Daftar Siswa — {className}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {/* ── Current students in class ── */}
          {isLoadingClassStudents ? (
            <div className="py-6">
              <LoadingState message="Memuat data siswa..." fullScreen={false} />
            </div>
          ) : classStudents.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">
              Belum ada siswa di kelas ini
            </p>
          ) : (
            <div className="space-y-2">
              {classStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {student.name}
                      </p>
                      {student.nis && (
                        <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(student.id)}
                    disabled={removeMutation.isPending}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Hapus dari kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Add students panel ── */}
          {showAddPanel && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Pilih Siswa
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Student list */}
              {isLoadingAllStudents ? (
                <div className="py-4">
                  <LoadingState message="Memuat data siswa..." fullScreen={false} />
                </div>
              ) : availableStudents.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  {search ? "Siswa tidak ditemukan" : "Semua siswa sudah ada di kelas ini"}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {availableStudents.map((student) => {
                    const isSelected = selectedIds.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(student.id)}
                          className="accent-blue-600 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {student.name || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            NIS: {student.nis}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => addMutation.mutate()}
                  disabled={selectedIds.length === 0 || addMutation.isPending}
                  className="flex-1"
                >
                  {addMutation.isPending
                    ? "Menyimpan..."
                    : `Simpan${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddPanel(false);
                    setSelectedIds([]);
                    setSearch("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t mt-2">
          <p className="text-xs text-gray-400">
            Total: {classStudents.length} siswa
          </p>
          {!showAddPanel && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setShowAddPanel(true)}
            >
              <UserPlus className="w-4 h-4" />
              Tambah Siswa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
