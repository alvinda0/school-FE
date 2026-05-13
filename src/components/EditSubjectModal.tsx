// components/EditSubjectModal.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { subjectService } from "@/services/subject.service";
import { Subject, UpdateSubjectPayload } from "@/types/subject";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";

interface EditSubjectModalProps {
  subject: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditSubjectModal = ({
  subject,
  open,
  onOpenChange,
}: EditSubjectModalProps) => {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<UpdateSubjectPayload>({
    name: "",
    code: "",
    description: "",
  });

  // Populate form when subject changes
  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description || "",
      });
    }
  }, [subject]);

  // Update subject mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateSubjectPayload) =>
      subjectService.updateSubject(subject!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", subject?.id] });
      toast.success("Mata pelajaran berhasil diperbarui!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui mata pelajaran");
    },
  });

  const handleChange = (field: keyof UpdateSubjectPayload, value: string) => {
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

    updateMutation.mutate(payload);
  };

  if (!subject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mata Pelajaran</DialogTitle>
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
