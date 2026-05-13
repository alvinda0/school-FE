// app/(dashboard)/teachers/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { UpdateTeacherPayload } from "@/types/teacher";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const EditTeacherPage = () => {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<UpdateTeacherPayload>({
    nip: "",
    gender: "Laki-laki",
    birth_place: "",
    birth_date: "",
    religion: "",
    phone_number: "",
    address: "",
    photo_url: "",
    status: "ACTIVE",
  });

  // Fetch teacher detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => teacherService.getTeacherById(teacherId),
  });

  const teacher = data?.data;

  // Populate form when data is loaded
  useEffect(() => {
    if (teacher) {
      setFormData({
        nip: teacher.nip,
        gender: teacher.gender,
        birth_place: teacher.birth_place || "",
        birth_date: teacher.birth_date ? teacher.birth_date.split("T")[0] : "", // Extract date only
        religion: teacher.religion || "",
        phone_number: teacher.phone_number || "",
        address: teacher.address || "",
        photo_url: teacher.photo_url || "",
        status: teacher.status,
      });
    }
  }, [teacher]);

  // Update teacher mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTeacherPayload) =>
      teacherService.updateTeacher(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
      toast.success("Teacher updated successfully!");
      router.push("/teachers");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update teacher");
    },
  });

  const handleChange = (field: keyof UpdateTeacherPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nip) {
      toast.error("NIP is required");
      return;
    }

    // Remove empty optional fields
    const payload = { ...formData };
    if (!payload.birth_place) delete payload.birth_place;
    if (!payload.birth_date) delete payload.birth_date;
    if (!payload.religion) delete payload.religion;
    if (!payload.phone_number) delete payload.phone_number;
    if (!payload.address) delete payload.address;
    if (!payload.photo_url) delete payload.photo_url;

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <LoadingState message="Loading teacher data..." />;
  }

  if (error || !teacher) {
    return (
      <ErrorState
        code={404}
        title="Teacher Not Found"
        description="The teacher you're trying to edit doesn't exist or has been removed."
        onAction={() => router.push("/teachers")}
        actionLabel="Back to Teachers"
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
          onClick={() => router.push("/teachers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Guru</h1>
          <p className="text-gray-500 mt-1">Perbarui informasi guru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIP */}
              <div className="space-y-2">
                <Label htmlFor="nip">
                  NIP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  placeholder="Masukkan NIP"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    handleChange("gender", value as "Laki-laki" | "Perempuan")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value as "ACTIVE" | "INACTIVE")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Place */}
              <div className="space-y-2">
                <Label htmlFor="birth_place">Tempat Lahir</Label>
                <Input
                  id="birth_place"
                  value={formData.birth_place}
                  onChange={(e) => handleChange("birth_place", e.target.value)}
                  placeholder="Masukkan tempat lahir"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birth_date">Tanggal Lahir</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange("birth_date", e.target.value)}
                />
              </div>

              {/* Religion */}
              <div className="space-y-2">
                <Label htmlFor="religion">Agama</Label>
                <Input
                  id="religion"
                  value={formData.religion}
                  onChange={(e) => handleChange("religion", e.target.value)}
                  placeholder="Masukkan agama"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">Nomor Telepon</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <Label htmlFor="photo_url">URL Foto (Opsional)</Label>
              <Input
                id="photo_url"
                value={formData.photo_url}
                onChange={(e) => handleChange("photo_url", e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/teachers")}
            disabled={updateMutation.isPending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memperbarui...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Perbarui Guru
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacherPage;
