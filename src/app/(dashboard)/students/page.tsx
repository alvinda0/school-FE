// app/(dashboard)/students/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDataTable from "@/components/CustomDataTable";
import { studentService } from "@/services/student.service";
import { Student } from "@/types/student";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ActionDropdown } from "@/components/ActionDropdown";

const StudentsPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch students data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getStudents(),
  });

  // Client-side pagination
  const paginatedData = (data?.data || []).slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Student["status"] }) => {
    const variants: Record<Student["status"], { variant: any; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      INACTIVE: { variant: "secondary", label: "Inactive" },
      GRADUATED: { variant: "outline", label: "Graduated" },
      DROPPED_OUT: { variant: "destructive", label: "Dropped Out" },
    };

    const config = variants[status] || variants.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Table columns
  const columns = [
    {
      name: "NIS",
      selector: (row: Student) => row.nis,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
    },
    {
      name: "NISN",
      selector: (row: Student) => row.nisn,
      sortable: true,
      grow: 1,
      minWidth: "120px",
    },
    {
      name: "Gender",
      selector: (row: Student) => row.gender,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
    },
    {
      name: "Birth Place",
      selector: (row: Student) => row.birth_place,
      sortable: true,
      grow: 1,
      minWidth: "120px",
    },
    {
      name: "Birth Date",
      selector: (row: Student) => row.birth_date,
      sortable: true,
      grow: 1,
      minWidth: "120px",
      cell: (row: Student) => {
        try {
          return format(new Date(row.birth_date), "dd MMM yyyy");
        } catch {
          return row.birth_date;
        }
      },
    },
    {
      name: "Phone",
      selector: (row: Student) => row.phone_number,
      sortable: true,
      grow: 1.2,
      minWidth: "130px",
    },
    {
      name: "Status",
      selector: (row: Student) => row.status,
      sortable: true,
      grow: 0.7,
      minWidth: "100px",
      center: true,
      cell: (row: Student) => <StatusBadge status={row.status} />,
    },
    {
      name: "Actions",
      center: true,
      grow: 0.5,
      minWidth: "80px",
      cell: (row: Student) => (
        <ActionDropdown
          actions={[
            {
              label: "View",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => router.push(`/students/${row.id}`),
            },
            {
              label: "Edit",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => router.push(`/students/${row.id}/edit`),
            },
            {
              label: "Delete",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => console.log("Delete", row.id),
              className: "text-red-600 hover:bg-red-50",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Students Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all students in the school
          </p>
        </div>
        <Button className="gap-2" onClick={() => router.push("/students/create")}>
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Students Table */}
      <CustomDataTable
        columns={columns}
        data={paginatedData}
        progressPending={isLoading}
        pagination
        paginationServer={false}
        paginationTotalRows={data?.data?.length || 0}
        paginationDefaultPage={page}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      />
    </div>
  );
};

export default StudentsPage;
