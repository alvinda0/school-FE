// app/(dashboard)/teachers/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, Calendar, Mail } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import { Teacher } from "@/types/teacher";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const TeacherDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  // Fetch teacher detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => teacherService.getTeacherById(teacherId),
  });

  const teacher = data?.data;

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
            onClick={() => router.push(`/teachers/${teacherId}/edit`)}
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
    </div>
  );
};

export default TeacherDetailPage;
