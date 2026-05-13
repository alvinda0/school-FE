// components/CreateSubjectModal.tsx
"use client";

import { useState } from "react";
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
import { subjectService } from "@/services/subject.service";
import { CreateSubjectPayload } from "@/types/subject";
import { toast } from "sonner";

interface CreateSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSubjectModal = ({
  open,
  onOpenChange,
}: CreateSubjectModalProps) => {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateSubjectPayload>({
    name: "",
    code: "",
    description: "",
  });

  // Create subject mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSubjectPayload) => subjectService.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Mata pelajaran berhasil ditambahkan!");
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        code: "",
        description: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menambahkan mata pelajaran");
    },
  });

  const handleChange = (field: keyof CreateSubjectPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast.error("Nama mata pelajaran wajib diisi");
      return;
    }
    if (!formData.code) {
      toast.error("Kode mata pelajaran wajib diisi");
      return;
    }

    // Remove empty optional fields
    const payload = { ...formData };
    if (!payload.description) {
      delete payload.description;
    }

    createMutation.mutate(payload);
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false);
      // Reset form when closing
      setFormData({
        name: "",
        code: "",
        description: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Mata Pelajaran Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Kode Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                placeholder="Contoh: MTK, IPA, BING"
                maxLength={10}
              />
            </div>

            {/* Subject Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Contoh: Matematika"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Masukkan deskripsi mata pelajaran"
              rows={4}
            />
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
