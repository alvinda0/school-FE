// app/(dashboard)/subjects/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar } from "lucide-react";
import { subjectService } from "@/services/subject.service";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const SubjectDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;

  // Fetch subject detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => subjectService.getSubjectById(subjectId),
  });

  const subject = data?.data;

  if (isLoading) {
    return <LoadingState message="Loading subject details..." />;
  }

  if (error || !subject) {
    return (
      <ErrorState
        code={404}
        title="Mata Pelajaran Tidak Ditemukan"
        description="Mata pelajaran yang Anda cari tidak ada atau telah dihapus."
        onAction={() => router.push("/subjects")}
        actionLabel="Kembali ke Daftar"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/subjects")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Mata Pelajaran</h1>
            <p className="text-gray-500 mt-1">Lihat informasi lengkap mata pelajaran</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => router.push(`/subjects/${subjectId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Subject Info Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Subject Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informasi Mata Pelajaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Kode Mata Pelajaran</label>
                <p className="text-lg font-semibold">{subject.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Mata Pelajaran</label>
                <p className="text-lg font-semibold">{subject.name}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                <p className="text-base text-gray-700">
                  {subject.description || "Tidak ada deskripsi"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Rekaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Dibuat Pada</label>
                <p className="text-base">
                  {format(new Date(subject.created_at), "dd MMMM yyyy, HH:mm")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</label>
                <p className="text-base">
                  {format(new Date(subject.updated_at), "dd MMMM yyyy, HH:mm")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectDetailPage;
