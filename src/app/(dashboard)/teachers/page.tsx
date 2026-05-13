// app/(dashboard)/teachers/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDataTable from "@/components/CustomDataTable";
import { teacherService } from "@/services/teacher.service";
import { Teacher } from "@/types/teacher";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ActionDropdown } from "@/components/ActionDropdown";
import { CreateTeacherModal } from "@/components/CreateTeacherModal";
import { EditTeacherModal } from "@/components/EditTeacherModal";
import { DeleteTeacherModal } from "@/components/DeleteTeacherModal";
import { ManageTeacherSubjectsModal } from "@/components/ManageTeacherSubjectsModal";
import { ViewTeacherSubjectsModal } from "@/components/ViewTeacherSubjectsModal";

const TeachersPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<Teacher | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacherForDelete, setSelectedTeacherForDelete] = useState<Teacher | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacherForSubjects, setSelectedTeacherForSubjects] = useState<Teacher | null>(null);
  const [isManageSubjectsModalOpen, setIsManageSubjectsModalOpen] = useState(false);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<Teacher | null>(null);
  const [isViewSubjectsModalOpen, setIsViewSubjectsModalOpen] = useState(false);

  // Fetch teachers data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teacherService.getTeachers(),
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

  // Handle edit teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacherForEdit(teacher);
    setIsEditModalOpen(true);
  };

  // Handle delete teacher
  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacherForDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  // Handle manage subjects
  const handleManageSubjects = (teacher: Teacher) => {
    setSelectedTeacherForSubjects(teacher);
    setIsManageSubjectsModalOpen(true);
  };

  // Handle view subjects
  const handleViewSubjects = (teacher: Teacher) => {
    setSelectedTeacherForView(teacher);
    setIsViewSubjectsModalOpen(true);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Teacher["status"] }) => {
    const variants: Record<Teacher["status"], { variant: any; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      INACTIVE: { variant: "secondary", label: "Inactive" },
    };

    const config = variants[status] || variants.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Table columns
  const columns = [
    {
      name: "NIP",
      selector: (row: Teacher) => row.nip,
      sortable: true,
      grow: 1,
      minWidth: "120px",
    },
    {
      name: "Full Name",
      selector: (row: Teacher) => row.user.full_name,
      sortable: true,
      grow: 1.5,
      minWidth: "150px",
    },
    {
      name: "Email",
      selector: (row: Teacher) => row.user.email,
      sortable: true,
      grow: 1.8,
      minWidth: "200px",
    },
    {
      name: "Gender",
      selector: (row: Teacher) => row.gender,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
    },
    {
      name: "Phone",
      selector: (row: Teacher) => row.phone_number || "-",
      sortable: true,
      grow: 1.2,
      minWidth: "130px",
    },
    {
      name: "Birth Date",
      selector: (row: Teacher) => row.birth_date || "-",
      sortable: true,
      grow: 1,
      minWidth: "120px",
      cell: (row: Teacher) => {
        if (!row.birth_date) return "-";
        try {
          return format(new Date(row.birth_date), "dd MMM yyyy");
        } catch {
          return row.birth_date;
        }
      },
    },
    {
      name: "Status",
      selector: (row: Teacher) => row.status,
      sortable: true,
      grow: 0.7,
      minWidth: "100px",
      center: true,
      cell: (row: Teacher) => <StatusBadge status={row.status} />,
    },
    {
      name: "Subjects",
      selector: (row: Teacher) => row.subjects?.length || 0,
      sortable: true,
      grow: 0.8,
      minWidth: "120px",
      center: true,
      cell: (row: Teacher) => {
        const count = row.subjects?.length || 0;
        return (
          <button
            onClick={() => handleViewSubjects(row)}
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/5"
            title="Klik untuk melihat detail mata pelajaran"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">{count}</span>
            {count > 0 && (
              <span className="text-xs">
                {count === 1 ? "mapel" : "mapel"}
              </span>
            )}
          </button>
        );
      },
    },
    {
      name: "Actions",
      center: true,
      grow: 0.5,
      minWidth: "80px",
      cell: (row: Teacher) => (
        <ActionDropdown
          actions={[
            {
              label: "View",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => router.push(`/teachers/${row.id}`),
            },
            {
              label: "Kelola Mata Pelajaran",
              icon: <BookOpen className="w-4 h-4" />,
              onClick: () => handleManageSubjects(row),
            },
            {
              label: "Edit",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEditTeacher(row),
            },
            {
              label: "Delete",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDeleteTeacher(row),
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
            Teachers Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all teachers in the school
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Teachers Table */}
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

      {/* Create Teacher Modal */}
      <CreateTeacherModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        teacher={selectedTeacherForEdit}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Delete Teacher Modal */}
      <DeleteTeacherModal
        teacher={selectedTeacherForDelete}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />

      {/* Manage Teacher Subjects Modal */}
      <ManageTeacherSubjectsModal
        teachers={data?.data || []}
        selectedTeacher={selectedTeacherForSubjects}
        open={isManageSubjectsModalOpen}
        onOpenChange={setIsManageSubjectsModalOpen}
      />

      {/* View Teacher Subjects Modal */}
      <ViewTeacherSubjectsModal
        teacher={selectedTeacherForView}
        open={isViewSubjectsModalOpen}
        onOpenChange={setIsViewSubjectsModalOpen}
      />
    </div>
  );
};

export default TeachersPage;
