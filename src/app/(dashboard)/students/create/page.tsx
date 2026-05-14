// app/(dashboard)/students/create/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save, Loader2, User, GraduationCap, Users, MapPin } from "lucide-react";
import { studentService } from "@/services/student.service";
import { userService } from "@/services/user.service";
import { CreateStudentPayload } from "@/types/student";
import { toast } from "sonner";

const CreateStudentPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateStudentPayload>({
    user_id: "",
    nis: "",
    nisn: "",
    gender: "Laki-laki",
    birth_place: "",
    birth_date: "",
    religion: "",
    phone_number: "",
    address: "",
    previous_school: "",
    father_name: "",
    mother_name: "",
    parent_phone: "",
    photo_url: "",
  });

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
  });

  // Create student mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStudentPayload) => studentService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student created successfully!");
      router.push("/students");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create student");
    },
  });

  const handleChange = (field: keyof CreateStudentPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.user_id) {
      toast.error("Please select a user");
      return;
    }
    if (!formData.nis || !formData.nisn) {
      toast.error("NIS and NISN are required");
      return;
    }
    if (!formData.birth_place || !formData.birth_date) {
      toast.error("Birth place and date are required");
      return;
    }
    if (!formData.phone_number) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.address) {
      toast.error("Address is required");
      return;
    }
    if (!formData.father_name || !formData.mother_name) {
      toast.error("Parent names are required");
      return;
    }
    if (!formData.parent_phone) {
      toast.error("Parent phone is required");
      return;
    }

    // Remove photo_url if empty
    const payload = { ...formData };
    if (!payload.photo_url) {
      delete payload.photo_url;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Siswa Baru</h1>
          <p className="text-gray-500 mt-1">Isi informasi siswa</p>
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
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="user_id">
                  Akun Pengguna <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => handleChange("user_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.data
                      ?.filter((user) => user.role_name === "student")
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* NIS */}
              <div className="space-y-2">
                <Label htmlFor="nis">
                  NIS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => handleChange("nis", e.target.value)}
                  placeholder="Masukkan NIS"
                />
              </div>

              {/* NISN */}
              <div className="space-y-2">
                <Label htmlFor="nisn">
                  NISN <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nisn"
                  value={formData.nisn}
                  onChange={(e) => handleChange("nisn", e.target.value)}
                  placeholder="Masukkan NISN"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value as "Laki-laki" | "Perempuan")}
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

              {/* Birth Place */}
              <div className="space-y-2">
                <Label htmlFor="birth_place">
                  Tempat Lahir <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth_place"
                  value={formData.birth_place}
                  onChange={(e) => handleChange("birth_place", e.target.value)}
                  placeholder="Masukkan tempat lahir"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birth_date">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange("birth_date", e.target.value)}
                />
              </div>

              {/* Religion */}
              <div className="space-y-2">
                <Label htmlFor="religion">
                  Agama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="religion"
                  value={formData.religion}
                  onChange={(e) => handleChange("religion", e.target.value)}
                  placeholder="Masukkan agama"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  Nomor Telepon <span className="text-red-500">*</span>
                </Label>
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
              <Label htmlFor="address">
                Alamat <span className="text-red-500">*</span>
              </Label>
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

        {/* Education Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informasi Pendidikan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="previous_school">
                Sekolah Asal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="previous_school"
                value={formData.previous_school}
                onChange={(e) => handleChange("previous_school", e.target.value)}
                placeholder="Masukkan nama sekolah asal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informasi Orang Tua
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father Name */}
              <div className="space-y-2">
                <Label htmlFor="father_name">
                  Nama Ayah <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => handleChange("father_name", e.target.value)}
                  placeholder="Masukkan nama ayah"
                />
              </div>

              {/* Mother Name */}
              <div className="space-y-2">
                <Label htmlFor="mother_name">
                  Nama Ibu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => handleChange("mother_name", e.target.value)}
                  placeholder="Masukkan nama ibu"
                />
              </div>

              {/* Parent Phone */}
              <div className="space-y-2">
                <Label htmlFor="parent_phone">
                  Nomor Telepon Orang Tua <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => handleChange("parent_phone", e.target.value)}
                  placeholder="Masukkan nomor telepon orang tua"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/students")}
            disabled={createMutation.isPending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Siswa
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudentPage;
