// app/(dashboard)/teachers/create/page.tsx
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
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { userService } from "@/services/user.service";
import { CreateTeacherPayload } from "@/types/teacher";
import { toast } from "sonner";

const CreateTeacherPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateTeacherPayload>({
    user_id: "",
    nip: "",
    gender: "Laki-laki",
    birth_place: "",
    birth_date: "",
    religion: "",
    phone_number: "",
    address: "",
    photo_url: "",
  });

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
  });

  // Create teacher mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTeacherPayload) => teacherService.createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher created successfully!");
      router.push("/teachers");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create teacher");
    },
  });

  const handleChange = (field: keyof CreateTeacherPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.user_id) {
      toast.error("Please select a user");
      return;
    }
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

    createMutation.mutate(payload);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tambah Guru Baru</h1>
          <p className="text-gray-500 mt-1">Isi informasi guru</p>
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
                      ?.filter((user) => user.role_name === "teacher")
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

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
                Simpan Guru
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeacherPage;
