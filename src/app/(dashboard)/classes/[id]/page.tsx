// app/(dashboard)/classes/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Edit, Trash2, School, Calendar, Users,
  User, Phone, MapPin, BookOpen,
} from "lucide-react";
import { classService } from "@/services/class.service";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DeleteClassModal } from "@/components/DeleteClassModal";

const ClassDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch class with homeroom teacher
  const { data, isLoading, error } = useQuery({
    queryKey: ["class-with-teacher", classId],
    queryFn: () => classService.getClassWithTeacher(classId),
  });

  const classData = data?.data;
  const teacher = classData?.homeroom_teacher;

  if (isLoading) {
    return <LoadingState message="Memuat detail kelas..." />;
  }

  if (error || !classData) {
    return (
      <ErrorState
        code={404}
        title="Kelas Tidak Ditemukan"
        description="Kelas yang Anda cari tidak ada atau telah dihapus."
        onAction={() => router.push("/classes")}
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
            onClick={() => router.push("/classes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Kelas</h1>
            <p className="text-gray-500 mt-1">Lihat informasi lengkap kelas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/classes/${classId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Informasi Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Kelas</label>
                <p className="text-lg font-semibold">{classData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tingkat Kelas</label>
                <p className="text-lg font-semibold">Kelas {classData.grade_level}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tahun Ajaran</label>
                <p className="text-lg font-semibold">{classData.academic_year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kapasitas Maksimal</label>
                <p className="text-lg font-semibold">{classData.max_students} siswa</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={classData.status === "ACTIVE" ? "default" : "secondary"}
                    className={
                      classData.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {classData.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Siswa</p>
                  <p className="text-2xl font-bold">{classData.student_count ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mata Pelajaran</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Homeroom Teacher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Wali Kelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teacher ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">NIP</label>
                <p className="text-base font-semibold">{teacher.nip}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Jenis Kelamin</label>
                <p className="text-base">{teacher.gender || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={teacher.status === "ACTIVE" ? "default" : "secondary"}
                    className={
                      teacher.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {teacher.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
              {teacher.phone_number && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telepon</label>
                    <p className="text-base">{teacher.phone_number}</p>
                  </div>
                </div>
              )}
              {teacher.address && (
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Alamat</label>
                    <p className="text-base">{teacher.address}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4 text-gray-500">
              <Users className="h-5 w-5" />
              <p className="text-sm">Belum ada wali kelas yang ditugaskan</p>
            </div>
          )}
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
                {format(new Date(classData.created_at), "dd MMMM yyyy, HH:mm")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</label>
              <p className="text-base">
                {format(new Date(classData.updated_at), "dd MMMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Class Modal */}
      <DeleteClassModal
        classData={classData}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDeleteSuccess={() => router.push("/classes")}
      />
    </div>
  );
};

export default ClassDetailPage;
