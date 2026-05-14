// app/(dashboard)/classes/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomDataTable from "@/components/CustomDataTable";
import { classService } from "@/services/class.service";
import { Class, ClassFilters } from "@/types/class";
import { format } from "date-fns";
import { ActionDropdown } from "@/components/ActionDropdown";
import { ClassDetailModal } from "@/components/ClassDetailModal";
import { CreateClassModal } from "@/components/CreateClassModal";
import { EditClassModal } from "@/components/EditClassModal";
import { DeleteClassModal } from "@/components/DeleteClassModal";

// Generate academic years dynamically
const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  
  // If current month is July (6) or later, academic year starts this year
  // Otherwise, it started last year
  const startYear = currentMonth >= 6 ? currentYear : currentYear - 1;
  
  const years = [];
  // Generate 5 years: 2 past, current, 2 future
  for (let i = -2; i <= 2; i++) {
    const year = startYear + i;
    years.push(`${year}/${year + 1}`);
  }
  
  return years;
};

const ClassesPage = () => {
  const router = useRouter();
  const academicYears = generateAcademicYears();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState<ClassFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<Class | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClassForDelete, setSelectedClassForDelete] = useState<Class | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch classes data
  const { data, isLoading } = useQuery({
    queryKey: ["classes", filters],
    queryFn: () => classService.getClasses(filters),
  });

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setFilters({ ...filters, page: newPage });
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
    setFilters({ ...filters, limit: newPerPage, page: 1 });
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ClassFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: perPage });
    setPage(1);
  };

  // Handle view class
  const handleViewClass = (classId: string) => {
    setSelectedClassId(classId);
    setIsDetailModalOpen(true);
  };

  // Handle edit class
  const handleEditClass = (classItem: Class) => {
    setSelectedClassForEdit(classItem);
    setIsEditModalOpen(true);
  };

  // Handle delete class
  const handleDeleteClass = (classItem: Class) => {
    setSelectedClassForDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  // Handle view students
  const handleViewStudents = (classItem: Class) => {
    router.push(`/classes/${classItem.id}/students`);
  };

  // Table columns
  const columns = [
    {
      name: "Nama Kelas",
      selector: (row: Class) => row.name,
      sortable: true,
      grow: 1.5,
      minWidth: "150px",
      cell: (row: Class) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
    },
    {
      name: "Tingkat",
      selector: (row: Class) => row.grade_level,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
      cell: (row: Class) => (
        <span className="text-sm text-gray-700">Kelas {row.grade_level}</span>
      ),
    },
    {
      name: "Tahun Ajaran",
      selector: (row: Class) => row.academic_year,
      sortable: true,
      grow: 1,
      minWidth: "130px",
      cell: (row: Class) => (
        <span className="text-sm text-gray-700">{row.academic_year}</span>
      ),
    },
    {
      name: "Wali Kelas",
      selector: (row: Class) => row.homeroom_teacher_name || "",
      sortable: true,
      grow: 1.2,
      minWidth: "150px",
      cell: (row: Class) => (
        <span className="text-sm text-gray-700">
          {row.homeroom_teacher_name || "-"}
        </span>
      ),
    },
    {
      name: "Kapasitas",
      selector: (row: Class) => row.max_students,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
      cell: (row: Class) => (
        <span className="text-sm text-gray-700">{row.max_students} siswa</span>
      ),
    },
    {
      name: "Status",
      selector: (row: Class) => row.status,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
      cell: (row: Class) => (
        <Badge
          variant={row.status === "ACTIVE" ? "default" : "secondary"}
          className={
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
          }
        >
          {row.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    },
    {
      name: "Dibuat Pada",
      selector: (row: Class) => row.created_at,
      sortable: true,
      grow: 1.2,
      minWidth: "150px",
      cell: (row: Class) => {
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
      cell: (row: Class) => (
        <ActionDropdown
          actions={[
            {
              label: "Lihat",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleViewClass(row.id),
            },
            {
              label: "Kelola Siswa",
              icon: <Users className="w-4 h-4" />,
              onClick: () => handleViewStudents(row),
            },
            {
              label: "Edit",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEditClass(row),
            },
            {
              label: "Hapus",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDeleteClass(row),
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
            Manajemen Kelas
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola semua kelas di sekolah
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Kelas
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tingkat Kelas</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={filters.grade_level?.toString() || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "grade_level",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              >
                <option value="">Semua Tingkat</option>
                <option value="10">Kelas 10</option>
                <option value="11">Kelas 11</option>
                <option value="12">Kelas 12</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun Ajaran</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={filters.academic_year || ""}
                onChange={(e) =>
                  handleFilterChange("academic_year", e.target.value || undefined)
                }
              >
                <option value="">Semua Tahun</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Classes Table */}
      <CustomDataTable
        columns={columns}
        data={data?.data || []}
        progressPending={isLoading}
        pagination
        paginationServer
        paginationTotalRows={data?.metadata?.total || 0}
        paginationDefaultPage={page}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      />

      {/* Create Class Modal */}
      <CreateClassModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Class Detail Modal */}
      <ClassDetailModal
        classId={selectedClassId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        classData={selectedClassForEdit}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Delete Class Modal */}
      <DeleteClassModal
        classData={selectedClassForDelete}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  );
};

export default ClassesPage;
