import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { apiClient } from "@/lib/rpc";
import { Button } from "@repo/ui/components/button";
import { ConfirmationDialog } from "@repo/ui/components/confirmation-dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { toast } from "@repo/ui/components/sonner";
import { Loader2, Camera, Save } from "lucide-react";
import { SettingsLoader } from "@/components/settings/loader";

export const Route = createFileRoute("/dashboard/settings/account")({
  component: AccountSettings,
  pendingMs: 0,
  pendingComponent: SettingsLoader,
  loader: async () => {
    const result = await authClient.getSession();
    return result;
  },
});

function AccountSettings() {
  const { data: session } = Route.useLoaderData();
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [name, setName] = useState(session?.user?.name || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        // @ts-ignore - Dynamic route might not be typed yet
        const res = await apiClient.api.settings["upload-image"].$post({
          json: { image: base64 },
        });
        const data = await res.json();

        if (data.success && data.url) {
          toast.success("Profile image updated");
          await authClient.updateUser({ image: data.url });
          window.location.reload();
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred during upload");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) return toast.error("Name cannot be empty");

    setConfirmConfig({
      open: true,
      title: "Update Profile",
      description: "Are you sure you want to update your profile information?",
      onConfirm: executeUpdateProfile,
    });
  };

  const executeUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    setConfirmConfig((prev) => ({ ...prev, open: false }));
    try {
      const { error } = await authClient.updateUser({ name });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill all password fields");
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setConfirmConfig({
      open: true,
      title: "Change Password",
      description:
        "Are you sure you want to change your password? You will be logged out of other sessions.",
      onConfirm: executeChangePassword,
    });
  };

  const executeChangePassword = async () => {
    setIsChangingPassword(true);
    setConfirmConfig((prev) => ({ ...prev, open: false }));
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-8 h-[calc(100vh-12rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row gap-8 border-b pb-8 ">
        <div className="lg:w-1/3 space-y-2">
          <h3 className="text-lg font-medium">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your photo and personal details.
          </p>
        </div>
        <div className="lg:w-2/3">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={handleImageClick}
              >
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-sm transition-opacity group-hover:opacity-80">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your User Name"
                    />
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      size="icon"
                      className="shrink-0"
                    >
                      {isUpdatingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your name will be visible to other users in the platform.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email addresses cannot be changed once registered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-2">
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            Change your password to keep your account secure.
          </p>
        </div>
        <div className="lg:w-2/3">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmConfig.open}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, open }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        isLoading={isUpdatingProfile || isChangingPassword}
      />
    </div>
  );
}
