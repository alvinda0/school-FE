// app/(dashboard)/subjects/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDataTable from "@/components/CustomDataTable";
import { subjectService } from "@/services/subject.service";
import { Subject } from "@/types/subject";
import { format } from "date-fns";
import { ActionDropdown } from "@/components/ActionDropdown";
import { SubjectDetailModal } from "@/components/SubjectDetailModal";
import { EditSubjectModal } from "@/components/EditSubjectModal";
import { CreateSubjectModal } from "@/components/CreateSubjectModal";
import { DeleteSubjectModal } from "@/components/DeleteSubjectModal";

const SubjectsPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState<Subject | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubjectForDelete, setSelectedSubjectForDelete] = useState<Subject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch subjects data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getSubjects(),
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

  // Handle view subject
  const handleViewSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setIsModalOpen(true);
  };

  // Handle edit subject
  const handleEditSubject = (subject: Subject) => {
    setSelectedSubjectForEdit(subject);
    setIsEditModalOpen(true);
  };

  // Handle delete subject
  const handleDeleteSubject = (subject: Subject) => {
    setSelectedSubjectForDelete(subject);
    setIsDeleteModalOpen(true);
  };

  // Table columns
  const columns = [
    {
      name: "Kode",
      selector: (row: Subject) => row.code,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
    },
    {
      name: "Nama Mata Pelajaran",
      selector: (row: Subject) => row.name,
      sortable: true,
      grow: 2,
      minWidth: "200px",
    },
    {
      name: "Deskripsi",
      selector: (row: Subject) => row.description || "-",
      sortable: true,
      grow: 2.5,
      minWidth: "250px",
      cell: (row: Subject) => (
        <span className="text-sm text-gray-600">
          {row.description || "-"}
        </span>
      ),
    },
    {
      name: "Dibuat Pada",
      selector: (row: Subject) => row.created_at,
      sortable: true,
      grow: 1.2,
      minWidth: "150px",
      cell: (row: Subject) => {
        try {
          return format(new Date(row.created_at), "dd MMM yyyy");
        } catch {
          return row.created_at;
        }
      },
    },
    {
      name: "Aksi",
      center: true,
      grow: 0.5,
      minWidth: "80px",
      cell: (row: Subject) => (
        <ActionDropdown
          actions={[
            {
              label: "Lihat",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleViewSubject(row.id),
            },
            {
              label: "Edit",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEditSubject(row),
            },
            {
              label: "Hapus",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDeleteSubject(row),
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
            Manajemen Mata Pelajaran
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola semua mata pelajaran di sekolah
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      {/* Subjects Table */}
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

      {/* Create Subject Modal */}
      <CreateSubjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Subject Detail Modal */}
      <SubjectDetailModal
        subjectId={selectedSubjectId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {/* Edit Subject Modal */}
      <EditSubjectModal
        subject={selectedSubjectForEdit}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Delete Subject Modal */}
      <DeleteSubjectModal
        subject={selectedSubjectForDelete}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
};

export default SubjectsPage;
