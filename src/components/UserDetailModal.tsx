// components/UserDetailModal.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Calendar, Clock, Edit, X } from "lucide-react";
import { userService } from "@/services/user.service";
import { format } from "date-fns";
import LoadingState from "@/components/LoadingState";

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export const UserDetailModal = ({
  userId,
  open,
  onOpenChange,
  onEdit,
}: UserDetailModalProps) => {
  // Fetch user detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId && open,
  });

  const user = data?.data;

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    const roleConfig: Record<string, { bg: string; text: string; icon: string }> = {
      super_admin: { bg: "bg-gradient-to-r from-purple-500 to-purple-600", text: "text-white", icon: "👑" },
      admin: { bg: "bg-gradient-to-r from-blue-500 to-blue-600", text: "text-white", icon: "🛡️" },
      teacher: { bg: "bg-gradient-to-r from-green-500 to-green-600", text: "text-white", icon: "👨‍🏫" },
      student: { bg: "bg-gradient-to-r from-yellow-500 to-yellow-600", text: "text-white", icon: "🎓" },
      candidate: { bg: "bg-gradient-to-r from-gray-500 to-gray-600", text: "text-white", icon: "📝" },
    };

    const config = roleConfig[role] || roleConfig.candidate;

    return (
      <div className={`${config.bg} ${config.text} px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 shadow-md`}>
        <span className="text-lg">{config.icon}</span>
        {role.replace("_", " ").toUpperCase()}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {isLoading && (
          <div className="p-8">
            <LoadingState
              message="Loading user details..."
              submessage="Please wait"
              fullScreen={false}
            />
          </div>
        )}

        {error && (
          <div className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-semibold">Failed to load user details</p>
            <p className="text-gray-500 text-sm mt-2">Please try again later</p>
          </div>
        )}

        {user && (
          <>
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">{user.full_name}</h2>
                      <p className="text-blue-100 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mt-6">
                  <RoleBadge role={user.role_name} />
                  <Badge 
                    variant={user.status ? "default" : "secondary"}
                    className={`${user.status ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'} text-white px-3 py-1`}
                  >
                    <div className={`w-2 h-2 rounded-full ${user.status ? 'bg-white' : 'bg-gray-200'} mr-2 animate-pulse`}></div>
                    {user.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Activity Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  Activity Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Last Login</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {user.last_login ? (
                        <>
                          <div>{format(new Date(user.last_login), "dd MMM yyyy")}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {format(new Date(user.last_login), "HH:mm:ss")}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">Never</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Created</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      <div>{format(new Date(user.created_at), "dd MMM yyyy")}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {format(new Date(user.created_at), "HH:mm:ss")}
                      </div>
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Updated</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      <div>{format(new Date(user.updated_at), "dd MMM yyyy")}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {format(new Date(user.updated_at), "HH:mm:ss")}
                      </div>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-gray-600" />
                  </div>
                  System Information
                </h3>
                
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        User ID
                      </label>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-900 font-mono break-all">{user.id}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Role ID
                      </label>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-900 font-mono break-all">{user.role_id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {onEdit && (
                  <Button 
                    onClick={onEdit}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
