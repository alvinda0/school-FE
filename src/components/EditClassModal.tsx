// components/EditClassModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { classService } from "@/services/class.service";
import { teacherService } from "@/services/teacher.service";
import { Class, UpdateClassPayload } from "@/types/class";
import { SelectInput } from "@/components/SelectInput";
import { toast } from "sonner";

interface EditClassModalProps {
  classData: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate academic years dynamically
const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  
  // If current month is July (6) or later, academic year starts this year
  // Otherwise, it started last year
  const startYear = currentMonth >= 6 ? currentYear : currentYear - 1;
  
  const years = [];
  // Generate 5 years: 2 past, current, 2 future
  for (let i = -2; i <= 2; i++) {
    const year = startYear + i;
    years.push(`${year}/${year + 1}`);
  }
  
  return years;
};

// Get current academic year
const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  if (currentMonth >= 6) {
    return `${currentYear}/${currentYear + 1}`;
  } else {
    return `${currentYear - 1}/${currentYear}`;
  }
};

export function EditClassModal({
  classData,
  open,
  onOpenChange,
}: EditClassModalProps) {
  const queryClient = useQueryClient();
  const academicYears = generateAcademicYears();
  const currentAcademicYear = getCurrentAcademicYear();

  const [formData, setFormData] = useState<UpdateClassPayload>({
    name: "",
    grade_level: 10,
    academic_year: currentAcademicYear,
    max_students: 40,
    homeroom_teacher_id: undefined,
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch teachers for homeroom teacher selection
  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teacherService.getTeachers(),
    enabled: open,
  });

  // Transform teachers data for SelectInput
  const teachersOptions = (teachersData?.data || []).map((teacher) => ({
    id: teacher.id,
    name: teacher.user.full_name,
    nip: teacher.nip,
  }));

  // Populate form when classData changes
  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        grade_level: classData.grade_level,
        academic_year: classData.academic_year,
        max_students: classData.max_students,
        homeroom_teacher_id: (classData as any).homeroom_teacher_id || undefined,
        status: classData.status,
      });
    }
  }, [classData]);

  // Update class mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateClassPayload) =>
      classService.updateClass(classData!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", classData?.id] });
      toast.success("Kelas berhasil diperbarui");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui kelas"
      );
    },
  });

  const handleChange = (field: keyof UpdateClassPayload, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama kelas harus diisi";
    }

    if (
      !formData.grade_level ||
      formData.grade_level < 10 ||
      formData.grade_level > 12
    ) {
      newErrors.grade_level = "Tingkat kelas harus antara 10-12";
    }

    if (!formData.academic_year.trim()) {
      newErrors.academic_year = "Tahun ajaran harus diisi";
    }

    if (!formData.max_students || formData.max_students < 1) {
      newErrors.max_students = "Kapasitas maksimal harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Kelas <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: X IPA 1"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade_level">
                Tingkat Kelas <span className="text-red-500">*</span>
              </Label>
              <select
                id="grade_level"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.grade_level ? "border-red-500" : ""
                }`}
                value={formData.grade_level.toString()}
                onChange={(e) =>
                  handleChange("grade_level", parseInt(e.target.value))
                }
              >
                <option value="10">Kelas 10</option>
                <option value="11">Kelas 11</option>
                <option value="12">Kelas 12</option>
              </select>
              {errors.grade_level && (
                <p className="text-sm text-red-500">{errors.grade_level}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_year">
                Tahun Ajaran <span className="text-red-500">*</span>
              </Label>
              <select
                id="academic_year"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.academic_year ? "border-red-500" : ""
                }`}
                value={formData.academic_year}
                onChange={(e) => handleChange("academic_year", e.target.value)}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.academic_year && (
                <p className="text-sm text-red-500">{errors.academic_year}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_students">
                Kapasitas Maksimal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="max_students"
                type="number"
                placeholder="40"
                value={formData.max_students}
                onChange={(e) =>
                  handleChange("max_students", parseInt(e.target.value))
                }
                className={errors.max_students ? "border-red-500" : ""}
              />
              {errors.max_students && (
                <p className="text-sm text-red-500">{errors.max_students}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeroom_teacher_id">Wali Kelas</Label>
              <SelectInput
                data={teachersOptions}
                value={formData.homeroom_teacher_id || ""}
                onChange={(value) => handleChange("homeroom_teacher_id", value || undefined)}
                valueKey="id"
                labelKey="name"
                secondaryLabelKey="nip"
                placeholder="Pilih Wali Kelas (Opsional)"
                searchPlaceholder="Cari guru..."
                emptyText="Tidak ada guru tersedia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={updateMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
