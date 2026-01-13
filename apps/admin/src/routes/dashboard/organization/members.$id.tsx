import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { apiClient } from "@/lib/rpc";
import { authClient } from "@/lib/auth/auth-client";
import {
  ArrowLeft,
  Mail,
  Shield,
  MapPin,
  Calendar,
  Activity,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Settings2
} from "lucide-react";
import { Separator } from "@repo/ui/components/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@repo/ui/components/select";

export const Route = createFileRoute('/dashboard/organization/members/$id')({
  loader: async ({ params: { id } }) => {
    try {
      const res = await apiClient.api.admin.organization.members[":memberId"].$get({
        param: { memberId: id }
      });
      if (!res.ok) throw new Error("Failed to fetch member details");
      return await res.json();
    } catch (error) {
      console.error("Member Loader Error:", error);
      return null;
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const member = Route.useLoaderData();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const currentRole = session?.member?.role;
  const isOwner = currentRole === "owner";

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-10 h-10 text-muted-foreground/50" />
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold tracking-tight ">Access Denied</p>
          <p className="text-sm text-muted-foreground">You do not have permission to view this member.</p>
        </div>
        <Link to="/dashboard/organization/members">
          <Button variant="outline" size="sm">Back to Members</Button>
        </Link>
      </div>
    );
  }

  const handleRemoveMember = async () => {
    if (!confirm("Are you sure you want to remove this member? This action cannot be undone.")) return;

    try {
      const res = await apiClient.api.admin.organization.members[":memberId"].$delete({
        param: { memberId: member.id }
      });
      if (res.ok) {
        toast.success("Member removed successfully");
        navigate({ to: "/dashboard/organization/members" });
      } else {
        toast.error("Failed to remove member");
      }
    } catch (error) {
      toast.error("An error occurred while removing the member");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 hover:bg-violet-500/15 border-transparent font-bold uppercase tracking-wider text-[10px]">Owner</Badge>;
      case "admin":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-transparent font-bold uppercase tracking-wider text-[10px]">Admin</Badge>;
      default:
        return <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px]">Member</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* SUBTLE HEADER */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link to="/dashboard/organization/members">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 rounded-full border shadow-sm">
                  <AvatarImage src={member.user.image || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {member.user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight">
                      {member.user.name}
                    </h1>
                    {getRoleBadge(member.role)}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    <Mail className="w-3 h-3 opacity-70" />
                    {member.user.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-destructive hover:bg-destructive/5 hover:text-destructive border-border shadow-none"
                  onClick={handleRemoveMember}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* MAIN SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl border shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30 py-4 px-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Access & Permissions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Organizational Role */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Organizational Role</p>
                      <p className="text-xs text-muted-foreground">Higher level roles grant more administrative access.</p>
                    </div>
                    <Select defaultValue={member.role} disabled={!isOwner}>
                      <SelectTrigger className="w-[120px] h-9 rounded-lg text-xs font-bold bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg shadow-lg">
                        <SelectItem value="owner" className="text-xs font-medium">Owner</SelectItem>
                        <SelectItem value="admin" className="text-xs font-medium">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary mt-0.5" />
                    <span>
                      {member.role === 'owner'
                        ? "Complete administrative control over the organization, user management, and sensitive settings."
                        : "Partial administrative control. Can view most data but restricted from high-level management."}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Jurisdiction Scope */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Jurisdiction Scope</p>
                    {isOwner && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-bold text-primary hover:bg-primary/5">
                        <Settings2 className="w-3 h-3 mr-1.5" />
                        Configure
                      </Button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/10 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">State Access</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-sm font-semibold">{member.jurisdiction?.state || "All Access"}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/10 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Primary Region</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <span className="text-sm font-semibold text-foreground/80">{member.jurisdiction?.district || "Global Area"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed text-xs text-muted-foreground bg-muted/5">
                    <Activity className="w-4 h-4 opacity-50" />
                    <p>Current depth monitoring: <span className="font-bold text-foreground">{member.jurisdiction?.taluka || "Full Sub-hierarchy"}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR SECTION */}
          <div className="space-y-6">
            <Card className="rounded-xl border shadow-sm">
              <CardHeader className="py-4 px-6 border-b bg-muted/30">
                <CardTitle className="text-sm font-bold">Member Information</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Status</p>
                    <p className="text-sm font-bold text-emerald-600">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Joined On</p>
                    <p className="text-sm font-bold">
                      {new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-900/50 p-5 space-y-2">
              <h3 className="text-xs font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Administrative Note
              </h3>
              <p className="text-xs text-orange-700/80 dark:text-orange-400/80 font-medium leading-relaxed">
                Role and scope changes take effect immediately. The member may need to re-log to see full permission updates.
              </p>
            </Card>

            <Link to="/dashboard/organization/members" className="block">
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground font-semibold px-0 text-xs">
                <ArrowLeft className="w-3 h-3 mr-2" />
                Return to member directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
