// app/(dashboard)/subjects/create/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, BookOpen } from "lucide-react";
import { subjectService } from "@/services/subject.service";
import { CreateSubjectPayload } from "@/types/subject";
import { toast } from "sonner";

const CreateSubjectPage = () => {
  const router = useRouter();
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
      router.push("/subjects");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/subjects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Mata Pelajaran Baru</h1>
          <p className="text-gray-500 mt-1">Isi informasi mata pelajaran</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informasi Mata Pelajaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/subjects")}
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
                Simpan Mata Pelajaran
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubjectPage;
