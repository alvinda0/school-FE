// app/(dashboard)/students/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, Calendar, School, Users, Mail } from "lucide-react";
import { studentService } from "@/services/student.service";
import { Student } from "@/types/student";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DeleteStudentModal } from "@/components/DeleteStudentModal";

const StudentDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch student detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.getStudentById(studentId),
  });

  const student = data?.data;

  // Status badge component
  const StatusBadge = ({ status }: { status: Student["status"] }) => {
    const variants: Record<Student["status"], { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      INACTIVE: { variant: "secondary", label: "Inactive" },
      GRADUATED: { variant: "outline", label: "Graduated" },
      DROPPED_OUT: { variant: "destructive", label: "Dropped Out" },
    };

    const config = variants[status] || variants.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <LoadingState message="Loading student details..." />;
  }

  if (error || !student) {
    return (
      <ErrorState
        code={404}
        title="Student Not Found"
        description="The student you're looking for doesn't exist or has been removed."
        onAction={() => router.push("/students")}
        actionLabel="Back to Students"
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
            onClick={() => router.push("/students")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
            <p className="text-gray-500 mt-1">View complete student information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/students/${studentId}/edit`)}
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

      {/* Student Info Cards */}
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
                <p className="text-base font-semibold">{student.full_name || student.name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base">{student.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">NIS</label>
                <p className="text-base font-semibold">{student.nis}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">NISN</label>
                <p className="text-base font-semibold">{student.nisn}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-base">{student.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Religion</label>
                <p className="text-base">{student.religion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Birth Place</label>
                <p className="text-base">{student.birth_place}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Birth Date</label>
                <p className="text-base">
                  {format(new Date(student.birth_date), "dd MMMM yyyy")}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={student.status} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base">{student.email || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-base">{student.phone_number}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-base">{student.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <School className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <label className="text-sm font-medium text-gray-500">Previous School</label>
                <p className="text-base">{student.previous_school}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Parent Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Father Name</label>
              <p className="text-base font-semibold">{student.father_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mother Name</label>
              <p className="text-base font-semibold">{student.mother_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Parent Phone</label>
              <p className="text-base">{student.parent_phone}</p>
            </div>
          </div>
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
                {format(new Date(student.created_at), "dd MMMM yyyy, HH:mm")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-base">
                {format(new Date(student.updated_at), "dd MMMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Student Modal */}
      <DeleteStudentModal
        student={student}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDeleteSuccess={() => router.push("/students")}
      />
    </div>
  );
};

export default StudentDetailPage;
