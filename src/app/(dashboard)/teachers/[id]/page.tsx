// app/(dashboard)/teachers/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, Calendar, Mail, BookOpen, Plus, X } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { Teacher } from "@/types/teacher";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DeleteTeacherModal } from "@/components/DeleteTeacherModal";
import { AddTeacherSubjectsModal } from "@/components/AddTeacherSubjectsModal";
import { RemoveTeacherSubjectsModal } from "@/components/RemoveTeacherSubjectsModal";
import { Checkbox } from "@/components/ui/checkbox";

const TeacherDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubjectsModalOpen, setIsAddSubjectsModalOpen] = useState(false);
  const [isRemoveSubjectsModalOpen, setIsRemoveSubjectsModalOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Fetch teacher detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => teacherService.getTeacherById(teacherId),
  });

  const teacher = data?.data;
  const teacherSubjects = teacher?.subjects || [];

  // Handle subject selection
  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjectIds.length === teacherSubjects.length) {
      setSelectedSubjectIds([]);
    } else {
      setSelectedSubjectIds(teacherSubjects.map((s: any) => s.id));
    }
  };

  const handleRemoveSelected = () => {
    setIsRemoveSubjectsModalOpen(true);
  };

  const selectedSubjects = teacherSubjects.filter((s: any) =>
    selectedSubjectIds.includes(s.id)
  );

  // Status badge component
  const StatusBadge = ({ status }: { status: Teacher["status"] }) => {
    const variants: Record<Teacher["status"], { variant: any; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      INACTIVE: { variant: "secondary", label: "Inactive" },
    };

    const config = variants[status] || variants.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <LoadingState message="Loading teacher details..." />;
  }

  if (error || !teacher) {
    return (
      <ErrorState
        code={404}
        title="Teacher Not Found"
        description="The teacher you're looking for doesn't exist or has been removed."
        onAction={() => router.push("/teachers")}
        actionLabel="Back to Teachers"
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
            onClick={() => router.push("/teachers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Details</h1>
            <p className="text-gray-500 mt-1">View complete teacher information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsAddSubjectsModalOpen(true)}
          >
            <BookOpen className="h-4 w-4" />
            Tambah Mata Pelajaran
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => router.push(`/teachers/${teacherId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="gap-2" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Teacher Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-base font-semibold">{teacher.user.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">NIP</label>
                <p className="text-base font-semibold">{teacher.nip}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base">{teacher.user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-base">{teacher.gender}</p>
              </div>
              {teacher.religion && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Religion</label>
                  <p className="text-base">{teacher.religion}</p>
                </div>
              )}
              {teacher.birth_place && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Birth Place</label>
                  <p className="text-base">{teacher.birth_place}</p>
                </div>
              )}
              {teacher.birth_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Birth Date</label>
                  <p className="text-base">
                    {format(new Date(teacher.birth_date), "dd MMMM yyyy")}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={teacher.status} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base">{teacher.user.email}</p>
              </div>
            </div>
            {teacher.phone_number && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-base">{teacher.phone_number}</p>
                </div>
              </div>
            )}
            {teacher.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-base">{teacher.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mata Pelajaran yang Diajarkan
            </CardTitle>
            <div className="flex gap-2">
              {teacherSubjects.length > 0 && selectedSubjectIds.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={handleRemoveSelected}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus ({selectedSubjectIds.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                  >
                    Batal Pilih Semua
                  </Button>
                </>
              )}
              {teacherSubjects.length > 0 && selectedSubjectIds.length === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  Pilih Semua
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingState message="Memuat mata pelajaran..." />
            </div>
          ) : teacherSubjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Belum ada mata pelajaran</p>
              <p className="text-sm mt-1">
                Klik tombol "Tambah Mata Pelajaran" untuk menambahkan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherSubjects.map((subject: any) => (
                <div
                  key={subject.id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedSubjectIds.includes(subject.id)
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={selectedSubjectIds.includes(subject.id)}
                      onCheckedChange={() => handleToggleSubject(subject.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`subject-${subject.id}`}
                        className="cursor-pointer"
                      >
                        <p className="font-semibold text-gray-900">
                          {subject.code}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {subject.name}
                        </p>
                        {subject.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {subject.description}
                          </p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="text-base">
                {format(new Date(teacher.created_at), "dd MMMM yyyy, HH:mm")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-base">
                {format(new Date(teacher.updated_at), "dd MMMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Teacher Modal */}
      <DeleteTeacherModal
        teacher={teacher}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDeleteSuccess={() => router.push("/teachers")}
      />

      {/* Add Subjects Modal */}
      <AddTeacherSubjectsModal
        teacherId={teacherId}
        teacherName={teacher?.user.full_name || ""}
        open={isAddSubjectsModalOpen}
        onOpenChange={setIsAddSubjectsModalOpen}
      />

      {/* Remove Subjects Modal */}
      <RemoveTeacherSubjectsModal
        teacherId={teacherId}
        subjects={selectedSubjects}
        open={isRemoveSubjectsModalOpen}
        onOpenChange={(open) => {
          setIsRemoveSubjectsModalOpen(open);
          if (!open) {
            setSelectedSubjectIds([]);
          }
        }}
      />
    </div>
  );
};

export default TeacherDetailPage;
