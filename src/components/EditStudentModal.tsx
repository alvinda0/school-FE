// components/EditStudentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Student, UpdateStudentPayload } from "@/types/student";
import { SelectInput } from "@/components/SelectInput";
import { toast } from "sonner";

interface EditStudentModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditStudentModal = ({
  student,
  open,
  onOpenChange,
}: EditStudentModalProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateStudentPayload>({
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
    status: "ACTIVE",
  });

  // Populate form when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        nis: student.nis,
        nisn: student.nisn,
        gender: student.gender,
        birth_place: student.birth_place,
        birth_date: student.birth_date.split("T")[0],
        religion: student.religion,
        phone_number: student.phone_number,
        address: student.address,
        previous_school: student.previous_school,
        father_name: student.father_name,
        mother_name: student.mother_name,
        parent_phone: student.parent_phone,
        photo_url: student.photo_url || "",
        status: student.status,
      });
    }
  }, [student]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateStudentPayload) =>
      studentService.updateStudent(student!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", student?.id] });
      toast.success("Siswa berhasil diperbarui!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui siswa");
    },
  });

  const handleChange = (field: keyof UpdateStudentPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nis || !formData.nisn) return toast.error("NIS dan NISN wajib diisi");
    if (!formData.birth_place || !formData.birth_date) return toast.error("Tempat dan tanggal lahir wajib diisi");
    if (!formData.phone_number) return toast.error("Nomor telepon wajib diisi");
    if (!formData.address) return toast.error("Alamat wajib diisi");
    if (!formData.father_name || !formData.mother_name) return toast.error("Nama orang tua wajib diisi");
    if (!formData.parent_phone) return toast.error("Nomor telepon orang tua wajib diisi");

    const payload = { ...formData };
    if (!payload.photo_url) delete payload.photo_url;

    updateMutation.mutate(payload);
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Siswa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Info (Read-only) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Siswa</p>
            <p className="font-semibold text-gray-900">{student.full_name || student.name}</p>
            <p className="text-sm text-gray-600">{student.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NIS */}
            <div className="space-y-2">
              <Label htmlFor="edit-nis">
                NIS <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-nis"
                value={formData.nis}
                onChange={(e) => handleChange("nis", e.target.value)}
                placeholder="Masukkan NIS"
              />
            </div>

            {/* NISN */}
            <div className="space-y-2">
              <Label htmlFor="edit-nisn">
                NISN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-nisn"
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

            {/* Status */}
            <div className="space-y-2">
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <SelectInput
                data={[
                  { value: "ACTIVE", label: "Aktif" },
                  { value: "INACTIVE", label: "Tidak Aktif" },
                  { value: "GRADUATED", label: "Lulus" },
                  { value: "DROPPED_OUT", label: "Keluar" },
                ]}
                value={formData.status}
                onChange={(value) => handleChange("status", value)}
                valueKey="value"
                labelKey="label"
                placeholder="Pilih status"
              />
            </div>

            {/* Birth Place */}
            <div className="space-y-2">
              <Label htmlFor="edit-birth_place">
                Tempat Lahir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-birth_place"
                value={formData.birth_place}
                onChange={(e) => handleChange("birth_place", e.target.value)}
                placeholder="Masukkan tempat lahir"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-birth_date">
                Tanggal Lahir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange("birth_date", e.target.value)}
              />
            </div>

            {/* Religion */}
            <div className="space-y-2">
              <Label htmlFor="edit-religion">
                Agama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-religion"
                value={formData.religion}
                onChange={(e) => handleChange("religion", e.target.value)}
                placeholder="Masukkan agama"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone_number">
                Nomor Telepon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-phone_number"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="Masukkan nomor telepon"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="edit-address">
              Alamat <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>

          {/* Education & Parent Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-previous_school">
                Sekolah Asal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-previous_school"
                value={formData.previous_school}
                onChange={(e) => handleChange("previous_school", e.target.value)}
                placeholder="Masukkan nama sekolah asal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo_url">URL Foto (Opsional)</Label>
              <Input
                id="edit-photo_url"
                value={formData.photo_url}
                onChange={(e) => handleChange("photo_url", e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-father_name">
                Nama Ayah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-father_name"
                value={formData.father_name}
                onChange={(e) => handleChange("father_name", e.target.value)}
                placeholder="Masukkan nama ayah"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mother_name">
                Nama Ibu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-mother_name"
                value={formData.mother_name}
                onChange={(e) => handleChange("mother_name", e.target.value)}
                placeholder="Masukkan nama ibu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parent_phone">
                Nomor Telepon Orang Tua <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-parent_phone"
                value={formData.parent_phone}
                onChange={(e) => handleChange("parent_phone", e.target.value)}
                placeholder="Masukkan nomor telepon orang tua"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
                  Perbarui
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
