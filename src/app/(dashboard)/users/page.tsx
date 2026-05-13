// app/(dashboard)/users/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDataTable from "@/components/CustomDataTable";
import { userService } from "@/services/user.service";
import { UserData } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ActionDropdown } from "@/components/ActionDropdown";
import { UserDetailModal } from "@/components/UserDetailModal";
import { EditUserModal } from "@/components/EditUserModal";

const UsersPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch users data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
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

  // Handle view user
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: UserData) => {
    setSelectedUserForEdit(user);
    setIsEditModalOpen(true);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: boolean }) => {
    return (
      <Badge variant={status ? "default" : "secondary"}>
        {status ? "Active" : "Inactive"}
      </Badge>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    const roleColors: Record<string, string> = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      student: "bg-yellow-100 text-yellow-800",
      candidate: "bg-gray-100 text-gray-800",
    };

    const colorClass = roleColors[role] || "bg-gray-100 text-gray-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {role.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  // Table columns
  const columns = [
    {
      name: "Full Name",
      selector: (row: UserData) => row.full_name,
      sortable: true,
      grow: 1.5,
      minWidth: "150px",
    },
    {
      name: "Email",
      selector: (row: UserData) => row.email,
      sortable: true,
      grow: 1.5,
      minWidth: "180px",
    },
    {
      name: "Role",
      selector: (row: UserData) => row.role_name,
      sortable: true,
      grow: 1,
      minWidth: "130px",
      cell: (row: UserData) => <RoleBadge role={row.role_name} />,
    },
    {
      name: "Status",
      selector: (row: UserData) => row.status,
      sortable: true,
      grow: 0.7,
      minWidth: "100px",
      center: true,
      cell: (row: UserData) => <StatusBadge status={row.status} />,
    },
    {
      name: "Last Login",
      selector: (row: UserData) => row.last_login || "",
      sortable: true,
      grow: 1.2,
      minWidth: "150px",
      cell: (row: UserData) => {
        if (!row.last_login) return <span className="text-gray-400">Never</span>;
        try {
          return format(new Date(row.last_login), "dd MMM yyyy, HH:mm");
        } catch {
          return row.last_login;
        }
      },
    },
    {
      name: "Actions",
      center: true,
      grow: 0.5,
      minWidth: "80px",
      cell: (row: UserData) => (
        <ActionDropdown
          actions={[
            {
              label: "View",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleViewUser(row.id),
            },
            {
              label: "Edit",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEditUser(row),
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
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">Manage all users in the system</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
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

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onEdit={() => {
          const user = data?.data?.find(u => u.id === selectedUserId);
          if (user) {
            setIsModalOpen(false);
            handleEditUser(user);
          }
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUserForEdit}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
};

export default UsersPage;
