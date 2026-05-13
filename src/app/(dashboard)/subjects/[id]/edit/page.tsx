// app/(dashboard)/subjects/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, BookOpen } from "lucide-react";
import { subjectService } from "@/services/subject.service";
import { UpdateSubjectPayload } from "@/types/subject";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const EditSubjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<UpdateSubjectPayload>({
    name: "",
    code: "",
    description: "",
  });

  // Fetch subject detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => subjectService.getSubjectById(subjectId),
  });

  const subject = data?.data;

  // Populate form when data is loaded
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
      subjectService.updateSubject(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", subjectId] });
      toast.success("Mata pelajaran berhasil diperbarui!");
      router.push("/subjects");
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

  if (isLoading) {
    return <LoadingState message="Memuat data mata pelajaran..." />;
  }

  if (error || !subject) {
    return (
      <ErrorState
        code={404}
        title="Mata Pelajaran Tidak Ditemukan"
        description="Mata pelajaran yang ingin Anda edit tidak ada atau telah dihapus."
        onAction={() => router.push("/subjects")}
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
          onClick={() => router.push("/subjects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Mata Pelajaran</h1>
          <p className="text-gray-500 mt-1">Perbarui informasi mata pelajaran</p>
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
                Perbarui Mata Pelajaran
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSubjectPage;
