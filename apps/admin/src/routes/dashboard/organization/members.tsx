import { createFileRoute, Link } from '@tanstack/react-router'
import { apiClient } from "@/lib/rpc";
import { useState } from "react";
import {
  Users,
  Search,
  MapPin,
  ChevronRight,
  UserPlus,
  Filter,
  MoreVertical,
  Shield,
  Eye,
  Settings2
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
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
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@repo/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

export const Route = createFileRoute('/dashboard/organization/members')({
  loader: async () => {
    try {
      const res = await apiClient.api.admin.organization.members.$get();
      if (!res.ok) throw new Error("Failed to fetch members");
      return await res.json();
    } catch (error) {
      console.error("Members Loader Error:", error);
      return [];
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const members = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return <Badge variant="secondary" className="bg-violet-500/10 text-violet-500 border-violet-500/20 font-bold uppercase tracking-wider text-[10px]">Owner</Badge>;
      case "admin":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-wider text-[10px]">Admin</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-transparent font-bold uppercase tracking-wider text-[10px]">Viewer</Badge>;
    }
  };

  const getJurisdictionLabel = (j: any) => {
    if (!j) return "No Access";
    if (j.village && j.village !== "All") return `Village: ${j.village}`;
    if (j.taluka && j.taluka !== "All") return `Taluka: ${j.taluka}`;
    if (j.district && j.district !== "All") return `District: ${j.district}`;
    if (j.state && j.state !== "All") return `State: ${j.state}`;
    return "All Access";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-8 py-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight font-brand flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Organization Members
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              Manage permissions and jurisdictions for {members.length} personnel.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/organization/organization-invite">
              <Button className="h-10 px-4 gap-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="px-4 md:px-8 py-4 border-b border-border/30 bg-muted/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 h-10 rounded-xl bg-background border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background border-border/50 font-medium">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="All Roles" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Card className="rounded-2xl border-border/50 overflow-hidden shadow-none bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Jurisdiction</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member: any) => (
                      <tr key={member.id} className="group hover:bg-muted/5 transition-colors cursor-pointer" onClick={() => { }}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10 rounded-xl border border-border/50 shadow-sm">
                              <AvatarImage src={member.user.image || ""} />
                              <AvatarFallback className="rounded-xl bg-primary/5 text-primary font-bold">
                                {member.user.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{member.user.name}</p>
                              <p className="text-xs text-muted-foreground font-medium">{member.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            {getJurisdictionLabel(member.jurisdiction)}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to="/dashboard/organization/members/$id" params={{ id: member.id }}>
                              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold gap-1.5 hover:bg-primary/5 hover:text-primary">
                                Profile
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl w-48">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-3 px-3">Quick Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium text-sm">
                                  <Eye className="w-4 h-4 text-muted-foreground" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium text-sm">
                                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                                  Edit Permissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium text-sm text-destructive focus:bg-destructive/5 focus:text-destructive">
                                  <Shield className="w-4 h-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                          <Users className="w-12 h-12 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-bold">No members found</p>
                            <p className="text-xs text-muted-foreground">Try adjusting your filters or invite new team members.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
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
