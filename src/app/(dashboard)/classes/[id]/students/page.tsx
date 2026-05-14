// app/(dashboard)/classes/[id]/students/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Users, UserPlus, School, X, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import CustomDataTable from "@/components/CustomDataTable";
import { classService } from "@/services/class.service";
import { studentService } from "@/services/student.service";
import { ClassStudent } from "@/types/class";
import { Student } from "@/types/student";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ClassStudentsPage = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  // Fetch class + students
  const { data, isLoading, error } = useQuery({
    queryKey: ["class-students", classId],
    queryFn: () => classService.getStudentsByClass(classId),
    enabled: !!classId,
  });

  // Fetch all students (for add modal)
  const { data: allStudentsData, isLoading: isLoadingAllStudents } = useQuery({
    queryKey: ["students-all"],
    queryFn: () => studentService.getStudents({ limit: 1000 }),
    enabled: isAddModalOpen,
  });

  const classData = data?.data;
  const classStudents: ClassStudent[] = Array.isArray(classData?.students)
    ? classData.students
    : [];

  const allStudents: Student[] = Array.isArray(allStudentsData?.data)
    ? allStudentsData.data
    : [];

  // Exclude students already in class
  const classStudentIds = new Set(classStudents.map((s) => s.id));
  const availableStudents = allStudents.filter((s) => {
    if (classStudentIds.has(s.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.nis?.toLowerCase().includes(q) ||
      s.full_name?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.nisn?.toLowerCase().includes(q)
    );
  });

  // Add students mutation
  const addMutation = useMutation({
    mutationFn: () => classService.addStudentsToClass(classId, selectedIds),
    onSuccess: () => {
      toast.success("Siswa berhasil ditambahkan ke kelas");
      queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      setSelectedIds([]);
      setSelectedStudents([]);
      setSearch("");
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast.error("Gagal menambahkan siswa");
    },
  });

  // Remove student mutation
  const removeMutation = useMutation({
    mutationFn: (studentId: string) =>
      classService.removeStudentFromClass(classId, studentId),
    onSuccess: () => {
      toast.success("Siswa berhasil dihapus dari kelas");
      queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
    },
    onError: () => {
      toast.error("Gagal menghapus siswa dari kelas");
    },
  });

  const toggleSelect = (student: Student) => {
    const id = student.id;
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((s) => s !== id));
      setSelectedStudents((prev) => prev.filter((s) => s.id !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
      setSelectedStudents((prev) => [...prev, student]);
    }
  };

  const removeSelected = (id: string) => {
    setSelectedIds((prev) => prev.filter((s) => s !== id));
    setSelectedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCloseAddModal = (val: boolean) => {
    if (!val) {
      setSelectedIds([]);
      setSelectedStudents([]);
      setSearch("");
      setComboOpen(false);
    }
    setIsAddModalOpen(val);
  };

  // Table columns
  const columns = [
    {
      name: "Nama Lengkap",
      selector: (row: ClassStudent) => row.full_name || row.name || "-",
      sortable: true,
      grow: 1.5,
      minWidth: "160px",
      cell: (row: ClassStudent) => (
        <span className="font-medium text-gray-900">{row.full_name || row.name || "-"}</span>
      ),
    },
    {
      name: "Email",
      selector: (row: ClassStudent) => row.email || "-",
      sortable: true,
      grow: 1.5,
      minWidth: "180px",
      cell: (row: ClassStudent) => (
        <span className="text-sm text-gray-600">{row.email || "-"}</span>
      ),
    },
    {
      name: "NIS",
      selector: (row: ClassStudent) => row.nis,
      sortable: true,
      grow: 0.8,
      minWidth: "100px",
      cell: (row: ClassStudent) => (
        <span className="font-medium text-gray-900">{row.nis}</span>
      ),
    },
    {
      name: "NISN",
      selector: (row: ClassStudent) => row.nisn,
      sortable: true,
      grow: 1,
      minWidth: "120px",
    },
    {
      name: "Jenis Kelamin",
      selector: (row: ClassStudent) => row.gender,
      sortable: true,
      grow: 0.8,
      minWidth: "120px",
    },
    {
      name: "Tempat Lahir",
      selector: (row: ClassStudent) => row.birth_place,
      sortable: true,
      grow: 1,
      minWidth: "130px",
    },
    {
      name: "Tanggal Lahir",
      selector: (row: ClassStudent) => row.birth_date,
      sortable: true,
      grow: 1,
      minWidth: "130px",
      cell: (row: ClassStudent) => {
        try {
          return format(new Date(row.birth_date), "dd MMM yyyy");
        } catch {
          return row.birth_date;
        }
      },
    },
    {
      name: "No. HP",
      selector: (row: ClassStudent) => row.phone_number,
      sortable: false,
      grow: 1,
      minWidth: "130px",
    },
    {
      name: "Status",
      selector: (row: ClassStudent) => row.status,
      sortable: true,
      grow: 0.7,
      minWidth: "100px",
      cell: (row: ClassStudent) => (
        <Badge
          className={
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
          }
        >
          {row.status === "ACTIVE" ? "Aktif" : row.status}
        </Badge>
      ),
    },
  ];

  if (isLoading) return <LoadingState message="Memuat data siswa kelas..." />;

  if (error || !classData) {
    return (
      <ErrorState
        code={404}
        title="Data Tidak Ditemukan"
        description="Kelas yang Anda cari tidak ada atau telah dihapus."
        onAction={() => router.push("/classes")}
        actionLabel="Kembali ke Daftar Kelas"
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
            <h1 className="text-3xl font-bold text-gray-900">
              Siswa Kelas {classData.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {classData.academic_year} · Tingkat {classData.grade_level}
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jumlah Siswa</p>
                <p className="text-2xl font-bold">{classData.current_students ?? classStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <School className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kapasitas</p>
                <p className="text-2xl font-bold">{classData.max_students}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sisa Kapasitas</p>
                <p className="text-2xl font-bold">
                  {classData.max_students - (classData.current_students ?? classStudents.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <CustomDataTable
        columns={columns}
        data={classStudents}
        progressPending={isLoading}
        pagination
        paginationServer={false}
        paginationTotalRows={classStudents.length}
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 30, 50]}
      />

      {/* Add Students Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={handleCloseAddModal}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Tambah Siswa ke Kelas {classData.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Combobox select siswa */}
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className="text-gray-500">Pilih siswa...</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari nama atau NIS..." />
                  <CommandList>
                    {isLoadingAllStudents ? (
                      <div className="py-4 text-center text-sm text-gray-400">
                        Memuat data siswa...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>Siswa tidak ditemukan</CommandEmpty>
                        <CommandGroup>
                          {availableStudents.map((student) => {
                            const isSelected = selectedIds.includes(student.id);
                            return (
                              <CommandItem
                                key={student.id}
                                value={`${student.full_name || student.name || ""} ${student.nis}`}
                                onSelect={() => {
                                  toggleSelect(student);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 flex-shrink-0 ${
                                    isSelected ? "opacity-100 text-blue-600" : "opacity-0"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {student.full_name || student.name || "-"}
                                  </p>
                                  <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected students tags */}
            {selectedStudents.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Dipilih ({selectedStudents.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800"
                    >
                      <span className="max-w-[160px] truncate">
                        {student.full_name || student.name || student.nis}
                      </span>
                      <button
                        onClick={() => removeSelected(student.id)}
                        className="text-blue-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button
              onClick={() => addMutation.mutate()}
              disabled={selectedIds.length === 0 || addMutation.isPending}
              className="flex-1"
            >
              {addMutation.isPending
                ? "Menyimpan..."
                : `Simpan${selectedIds.length > 0 ? ` (${selectedIds.length} siswa)` : ""}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCloseAddModal(false)}
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassStudentsPage;
