// components/CreateStudentModal.tsx
"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { studentService } from "@/services/student.service";
import { userService } from "@/services/user.service";
import { CreateStudentPayload } from "@/types/student";
import { SelectInput } from "@/components/SelectInput";
import { toast } from "sonner";

interface CreateStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultForm: CreateStudentPayload = {
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
};

export const CreateStudentModal = ({
  open,
  onOpenChange,
}: CreateStudentModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateStudentPayload>(defaultForm);

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStudentPayload) => studentService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Siswa berhasil ditambahkan!");
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menambahkan siswa");
    },
  });

  const handleChange = (field: keyof CreateStudentPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id) return toast.error("Silakan pilih pengguna");
    if (!formData.nis || !formData.nisn) return toast.error("NIS dan NISN wajib diisi");
    if (!formData.birth_place || !formData.birth_date) return toast.error("Tempat dan tanggal lahir wajib diisi");
    if (!formData.phone_number) return toast.error("Nomor telepon wajib diisi");
    if (!formData.address) return toast.error("Alamat wajib diisi");
    if (!formData.father_name || !formData.mother_name) return toast.error("Nama orang tua wajib diisi");
    if (!formData.parent_phone) return toast.error("Nomor telepon orang tua wajib diisi");

    const payload = { ...formData };
    if (!payload.photo_url) delete payload.photo_url;

    createMutation.mutate(payload);
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false);
      setFormData(defaultForm);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Siswa Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>
              Akun Pengguna <span className="text-red-500">*</span>
            </Label>
            <SelectInput
              data={usersData?.data?.filter((u) => u.role_name === "student") || []}
              value={formData.user_id}
              onChange={(value) => handleChange("user_id", value)}
              valueKey="id"
              labelKey="full_name"
              secondaryLabelKey="email"
              placeholder="Pilih pengguna"
              searchPlaceholder="Cari pengguna..."
              emptyText="Tidak ada pengguna ditemukan"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label>
                Jenis Kelamin <span className="text-red-500">*</span>
              </Label>
              <SelectInput
                data={[
                  { value: "Laki-laki", label: "Laki-laki" },
                  { value: "Perempuan", label: "Perempuan" },
                ]}
                value={formData.gender}
                onChange={(value) => handleChange("gender", value as "Laki-laki" | "Perempuan")}
                valueKey="value"
                labelKey="label"
                placeholder="Pilih jenis kelamin"
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

            {/* Previous School */}
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

          {/* Parent Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="photo_url">URL Foto (Opsional)</Label>
              <Input
                id="photo_url"
                value={formData.photo_url}
                onChange={(e) => handleChange("photo_url", e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                  Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
