// app/(dashboard)/classes/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { classService } from "@/services/class.service";
import { UpdateClassPayload } from "@/types/class";
import { useToast } from "@/hooks/use-toast";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const EditClassPage = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UpdateClassPayload>({
    name: "",
    grade_level: 10,
    academic_year: "2024/2025",
    max_students: 40,
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch class detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => classService.getClassById(classId),
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (data?.data) {
      setFormData({
        name: data.data.name,
        grade_level: data.data.grade_level,
        academic_year: data.data.academic_year,
        max_students: data.data.max_students,
        status: data.data.status,
      });
    }
  }, [data]);

  // Update class mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateClassPayload) => classService.updateClass(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
      toast({
        title: "Berhasil",
        description: "Kelas berhasil diperbarui",
      });
      router.push(`/classes/${classId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal memperbarui kelas",
        variant: "destructive",
      });
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

    if (!formData.grade_level || formData.grade_level < 10 || formData.grade_level > 12) {
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

  if (isLoading) {
    return <LoadingState message="Loading class data..." />;
  }

  if (error || !data?.data) {
    return (
      <ErrorState
        code={404}
        title="Kelas Tidak Ditemukan"
        description="Kelas yang Anda cari tidak ada atau telah dihapus."
        onAction={() => router.push("/classes")}
        actionLabel="Kembali ke Daftar"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/classes/${classId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Kelas</h1>
          <p className="text-gray-500 mt-1">Perbarui informasi kelas</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kelas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  className={`w-full px-3 py-2 border rounded-md ${errors.grade_level ? "border-red-500" : ""}`}
                  value={formData.grade_level.toString()}
                  onChange={(e) => handleChange("grade_level", parseInt(e.target.value))}
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
                  className={`w-full px-3 py-2 border rounded-md ${errors.academic_year ? "border-red-500" : ""}`}
                  value={formData.academic_year}
                  onChange={(e) => handleChange("academic_year", e.target.value)}
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2023/2024">2023/2024</option>
                  <option value="2022/2023">2022/2023</option>
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
                  onChange={(e) => handleChange("max_students", parseInt(e.target.value))}
                  className={errors.max_students ? "border-red-500" : ""}
                />
                {errors.max_students && (
                  <p className="text-sm text-red-500">{errors.max_students}</p>
                )}
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
                onClick={() => router.push(`/classes/${classId}`)}
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditClassPage;
