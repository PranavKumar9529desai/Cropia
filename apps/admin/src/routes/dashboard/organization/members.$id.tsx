import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { apiClient } from "@/lib/rpc";
import {
  ArrowLeft,
  Mail,
  Shield,
  MapPin,
  Calendar,
  Activity,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
        <p className="text-lg font-bold">Member not found</p>
        <Link to="/dashboard/organization/members">
          <Button variant="outline">Back to Members</Button>
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
        return <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 font-bold uppercase tracking-wider text-[10px]">Owner</Badge>;
      case "admin":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-wider text-[10px]">Admin</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-transparent font-bold uppercase tracking-wider text-[10px]">Viewer</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-muted/5">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-8 py-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard/organization/members">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-2xl border-2 border-primary/10 shadow-sm">
                <AvatarImage src={member.user.image || ""} />
                <AvatarFallback className="text-xl font-bold rounded-2xl bg-primary/5 text-primary">
                  {member.user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight font-brand text-foreground">
                  {member.user.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  {member.user.email}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-xl text-sm font-bold border-destructive/20 text-destructive hover:bg-destructive/5" onClick={handleRemoveMember}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Member
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar scroll-smooth">
        <div className="max-w-5xl mx-auto p-4 md:p-8 grid gap-8 pb-16">

          <div className="grid md:grid-cols-3 gap-8">
            {/* PROFILE CARD */}
            <Card className="md:col-span-2 rounded-3xl border-border/50 shadow-none overflow-hidden bg-background">
              <CardHeader className="bg-muted/5 border-b border-border/30 px-8 py-6">
                <CardTitle className="text-lg font-bold font-brand flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Access & Permissions
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  Manage the role and geographical scope for this member.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organizational Role</label>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/5">
                    <div className="flex items-center gap-3">
                      {getRoleBadge(member.role)}
                      <p className="text-sm font-medium">Determines administrative capabilities.</p>
                    </div>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-[120px] h-9 rounded-xl text-xs font-bold border-border/50 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-medium">
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Jurisdiction Scope</label>
                  <div className="space-y-3">
                    {/* Simplified Display for now */}
                    <div className="p-5 rounded-2xl border border-border/50 bg-background space-y-4">
                      <div className="flex items-center justify-between border-b border-border/30 pb-3">
                        <span className="text-xs font-bold text-muted-foreground">Current Jurisdiction</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                          <MapPin className="w-4 h-4" />
                          {member.jurisdiction?.state || "All Access"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                        <div className="space-y-1">
                          <p className="text-muted-foreground opacity-70">District</p>
                          <p className="font-bold">{member.jurisdiction?.district || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground opacity-70">Taluka</p>
                          <p className="font-bold">{member.jurisdiction?.taluka || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-bold gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Modify Jurisdiction
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SIDE STATS */}
            <div className="space-y-6">
              <Card className="rounded-3xl border-border/50 shadow-none bg-background overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-border/30 bg-muted/5">
                  <CardTitle className="text-sm font-bold font-brand flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Joined On</p>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      {new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-4 border-t border-border/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      Active Member
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-primary/10 bg-primary/5 shadow-none p-6 space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Security Note
                </h3>
                <p className="text-xs text-primary/70 font-medium leading-relaxed">
                  Changing a member's role or jurisdiction takes effect immediately. Ensure you have the necessary authority before making these changes.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .subtle-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .subtle-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .subtle-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(var(--primary) / 0.1);
          border-radius: 10px;
          background-clip: padding-box;
        }
        .subtle-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(var(--primary) / 0.3);
        }
      `}</style>
    </div>
  )
}
