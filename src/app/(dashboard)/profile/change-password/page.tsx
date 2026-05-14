"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface FormErrors {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const ChangePasswordPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authService.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setFormData({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => router.push("/profile"), 1500);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to change password"
      );
    },
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.new_password)) {
      newErrors.new_password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.new_password)) {
      newErrors.new_password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.new_password)) {
      newErrors.new_password = "Password must contain at least one number";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    changePasswordMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Responsive grid: single col on mobile, 2-col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <KeyRound className="w-5 h-5 text-purple-600" />
              Password Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={formData.current_password}
                    onChange={(e) => handleChange("current_password", e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    className={errors.current_password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="text-sm text-red-500">{errors.current_password}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.new_password}
                    onChange={(e) => handleChange("new_password", e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    className={errors.new_password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-sm text-red-500">{errors.new_password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirm_password}
                    onChange={(e) => handleChange("confirm_password", e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    className={errors.confirm_password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">{errors.confirm_password}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  disabled={changePasswordMutation.isPending}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Requirements Card */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              Password Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {passwordRequirements.map((req, idx) => {
              const met = req.test(formData.new_password);
              return (
                <div key={idx} className="flex items-center gap-3">
                  {met ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${met ? "text-green-700 font-medium" : "text-gray-500"}`}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
