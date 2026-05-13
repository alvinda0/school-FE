// components/EditTeacherModal.tsx
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
import { Save, Loader2, Upload, X } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { Teacher } from "@/types/teacher";
import { SelectInput } from "@/components/SelectInput";
import { toast } from "sonner";

interface EditTeacherModalProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTeacherModal = ({
  teacher,
  open,
  onOpenChange,
}: EditTeacherModalProps) => {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    nip: "",
    gender: "Laki-laki",
    birth_place: "",
    birth_date: "",
    religion: "",
    phone_number: "",
    address: "",
    status: "ACTIVE",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Populate form when teacher changes
  useEffect(() => {
    if (teacher) {
      setFormData({
        nip: teacher.nip,
        gender: teacher.gender,
        birth_place: teacher.birth_place || "",
        birth_date: teacher.birth_date ? teacher.birth_date.split("T")[0] : "",
        religion: teacher.religion || "",
        phone_number: teacher.phone_number || "",
        address: teacher.address || "",
        status: teacher.status,
      });
      // Set existing photo preview if available
      if (teacher.photo_url) {
        setPhotoPreview(teacher.photo_url);
      }
    }
  }, [teacher]);

  // Update teacher mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await teacherService.updateTeacher(teacher!.id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacher?.id] });
      toast.success("Guru berhasil diperbarui!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui guru");
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nip) {
      toast.error("NIP wajib diisi");
      return;
    }

    // Create FormData
    const submitData = new FormData();
    submitData.append("nip", formData.nip);
    submitData.append("gender", formData.gender);
    submitData.append("status", formData.status);
    
    if (formData.birth_place) submitData.append("birth_place", formData.birth_place);
    if (formData.birth_date) {
      // Convert to ISO 8601 format
      const isoDate = new Date(formData.birth_date).toISOString();
      submitData.append("birth_date", isoDate);
    }
    if (formData.religion) submitData.append("religion", formData.religion);
    if (formData.phone_number) submitData.append("phone_number", formData.phone_number);
    if (formData.address) submitData.append("address", formData.address);
    if (photoFile) submitData.append("photo", photoFile);

    updateMutation.mutate(submitData);
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Guru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teacher Info (Read-only) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Guru</p>
            <p className="font-semibold text-gray-900">{teacher.user.full_name}</p>
            <p className="text-sm text-gray-600">{teacher.user.email}</p>
          </div>

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
              <SelectInput
                data={[
                  { value: "Laki-laki", label: "Laki-laki" },
                  { value: "Perempuan", label: "Perempuan" },
                ]}
                value={formData.gender}
                onChange={(value) => handleChange("gender", value)}
                valueKey="value"
                labelKey="label"
                placeholder="Pilih jenis kelamin"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <SelectInput
                data={[
                  { value: "ACTIVE", label: "Aktif" },
                  { value: "INACTIVE", label: "Tidak Aktif" },
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

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Foto (Opsional)</Label>
            {photoPreview ? (
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {photoFile ? photoFile.name : "Foto saat ini"}
                  </p>
                  {photoFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {`${(photoFile.size / 1024).toFixed(2)} KB`}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus Foto
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("photo")?.click()}
              >
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Klik untuk upload
                    </span>
                    <span className="text-sm text-gray-500"> atau drag & drop</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, JPEG hingga 5MB
                  </p>
                </div>
              </div>
            )}
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
