"use client";

import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingState from "@/components/LoadingState";
import { User, Mail, Shield, Hash, CheckCircle2, XCircle } from "lucide-react";

const ProfilePage = () => {
  const { data: user, isLoading } = useAuthMe();
  const { primaryColor } = useTheme();

  if (isLoading || !user) {
    return <LoadingState message="Loading profile..." />;
  }

  const infoItems = [
    {
      icon: <User className="w-5 h-5 text-blue-500" />,
      label: "Full Name",
      value: user.full_name,
    },
    {
      icon: <Mail className="w-5 h-5 text-green-500" />,
      label: "Email",
      value: user.email,
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      label: "Role",
      value: (
        <Badge variant="secondary" className="capitalize text-sm font-semibold">
          {user.role_name.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      icon: <Hash className="w-5 h-5 text-orange-500" />,
      label: "User ID",
      value: (
        <span className="font-mono text-sm text-gray-500 break-all">
          {user.user_id}
        </span>
      ),
    },
    {
      icon: user.status ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      ),
      label: "Status",
      value: user.status ? (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Active
        </Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top section: banner + info side by side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar + Name Banner */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 text-white lg:col-span-1 flex flex-col justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor || "#6366f1"} 0%, ${primaryColor || "#6366f1"}cc 100%)`,
            minHeight: "200px",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left sm:items-center lg:flex-col lg:text-center lg:items-center">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{user.full_name}</h2>
              <p className="text-white/80 capitalize mt-1 text-sm">
                {user.role_name.replace(/_/g, " ")}
              </p>
              <div className="mt-2">
                {user.status ? (
                  <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                    Active
                  </span>
                ) : (
                  <span className="inline-block px-3 py-0.5 rounded-full bg-red-400/40 text-white text-xs font-semibold">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {infoItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    {item.label}
                  </p>
                  <div className="text-sm font-semibold text-gray-800 break-words">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
