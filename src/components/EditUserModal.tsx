// components/EditUserModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { userService } from "@/services/user.service";
import { UserData } from "@/types/user";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface EditUserModalProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserModal = ({
  user,
  open,
  onOpenChange,
}: EditUserModalProps) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(true);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setStatus(user.status);
    }
  }, [user]);

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: { email: string; status: boolean }) =>
      userService.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      toast.success("User updated successfully!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    updateMutation.mutate({ email, status });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Update user information for {user.full_name}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full"
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-gray-500">
              The email address for this user account
            </p>
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              Account Status
            </Label>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {status ? "Active" : "Inactive"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {status
                    ? "User can access the system"
                    : "User cannot access the system"}
                </p>
              </div>
              <Switch
                id="status"
                checked={status}
                onCheckedChange={setStatus}
                disabled={updateMutation.isPending}
              />
            </div>
          </div>

          {/* Read-only Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Read-only Information
            </p>
            <div className="space-y-1 text-xs text-blue-800">
              <p>
                <span className="font-medium">Full Name:</span> {user.full_name}
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                {user.role_name.replace("_", " ").toUpperCase()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
