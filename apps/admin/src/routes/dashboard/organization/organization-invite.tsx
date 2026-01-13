import { apiClient } from "@/lib/rpc";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  UserPlus,
  Mail,
  Shield,
  MapPin,
  Clock,
  X,
  Send,
  Building2,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@repo/ui/components/select";

export const Route = createFileRoute(
  '/dashboard/organization/organization-invite',
)({
  loader: async () => {
    try {
      const res = await apiClient.api.admin.organization.invitations.$get();
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return await res.json();
    } catch (error) {
      console.error("Invitations Loader Error:", error);
      return [];
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const pendingInvites = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { data: session } = authClient.useSession();
  const activeMember = session?.member;
  const inviterJurisdiction = activeMember?.jurisdiction as any;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    role: "admin",
    level: inviterJurisdiction?.district && inviterJurisdiction.district !== "All" ? "district" :
      inviterJurisdiction?.taluka && inviterJurisdiction.taluka !== "All" ? "taluka" :
        inviterJurisdiction?.village && inviterJurisdiction.village !== "All" ? "village" : "state",
    jurisdiction: {
      state: inviterJurisdiction?.state || "Maharashtra",
      district: inviterJurisdiction?.district || "All",
      taluka: inviterJurisdiction?.taluka || "All",
      village: inviterJurisdiction?.village || "All"
    }
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiClient.api.admin.organization.invite.$post({
        json: {
          email: formData.email,
          role: formData.role as any,
          jurisdiction: formData.jurisdiction
        }
      });

      if (res.ok) {
        toast.success("Invitation sent successfully!");
        setFormData({ ...formData, email: "" });
        navigate({ search: (prev: any) => ({ ...prev }) }); // Refresh loader
      } else {
        const error = await res.json() as any;
        toast.error(error.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("An error occurred while sending the invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const res = await apiClient.api.admin.organization.invitations[":invitationId"].$delete({
        param: { invitationId: inviteId }
      });
      if (res.ok) {
        toast.success("Invitation cancelled");
        navigate({ search: (prev: any) => ({ ...prev }) }); // Refresh loader
      } else {
        toast.error("Failed to cancel invitation");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling the invitation");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-muted/5">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-8 py-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight font-brand flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-primary" />
              Invite New Members
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              Expand your organization by adding specialized personnel.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/organization/members">
              <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-xl text-xs font-bold">
                View All Members
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar scroll-smooth">
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-10 pb-16">

          {/* INVITE FORM AREA */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="rounded-3xl border-border/50 shadow-none overflow-hidden bg-background">
              <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-8">
                <CardTitle className="text-xl font-bold font-brand flex items-center gap-3 text-primary">
                  <Send className="w-5 h-5" />
                  Send Invitation
                </CardTitle>
                <CardDescription className="font-medium">
                  New members will receive an email to join your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleInvite} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. officer@maharashtra.gov.in"
                        type="email"
                        required
                        className="pl-12 h-12 rounded-2xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Assign Role</label>
                      <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary/60" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl font-medium">
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Jurisdiction Level</label>
                      <Select
                        value={formData.level}
                        onValueChange={(val: any) => setFormData({ ...formData, level: val })}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary/60" />
                            <SelectValue placeholder="Select Level" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl font-medium">
                          {(!inviterJurisdiction?.district || inviterJurisdiction.district === "All") && (
                            <SelectItem value="state">State Level</SelectItem>
                          )}
                          {(!inviterJurisdiction?.taluka || inviterJurisdiction.taluka === "All") && (
                            <SelectItem value="district">District Level</SelectItem>
                          )}
                          {(!inviterJurisdiction?.village || inviterJurisdiction.village === "All") && (
                            <SelectItem value="taluka">Taluka Level</SelectItem>
                          )}
                          <SelectItem value="village">Village Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Specific Jurisdiction Selection */}
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    {formData.level !== "state" && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">State</label>
                        <Select
                          value={formData.jurisdiction.state}
                          onValueChange={(val) => setFormData({
                            ...formData,
                            jurisdiction: { ...formData.jurisdiction, state: val, district: "All", taluka: "All", village: "All" }
                          })}
                          disabled={inviterJurisdiction?.state && inviterJurisdiction.state !== "All"}
                        >
                          <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-medium">
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(formData.level === "district" || formData.level === "taluka" || formData.level === "village") && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">District</label>
                        <Select
                          value={formData.jurisdiction.district}
                          onValueChange={(val) => setFormData({
                            ...formData,
                            jurisdiction: { ...formData.jurisdiction, district: val, taluka: "All", village: "All" }
                          })}
                          disabled={inviterJurisdiction?.district && inviterJurisdiction.district !== "All"}
                        >
                          <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-medium">
                            <SelectItem value="All">All Districts</SelectItem>
                            <SelectItem value="Satara">Satara</SelectItem>
                            <SelectItem value="Sangli">Sangli</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(formData.level === "taluka" || formData.level === "village") && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Taluka</label>
                        <Select
                          value={formData.jurisdiction.taluka}
                          onValueChange={(val) => setFormData({
                            ...formData,
                            jurisdiction: { ...formData.jurisdiction, taluka: val, village: "All" }
                          })}
                          disabled={inviterJurisdiction?.taluka && inviterJurisdiction.taluka !== "All"}
                        >
                          <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-medium">
                            <SelectItem value="All">All Talukas</SelectItem>
                            <SelectItem value="Karad">Karad</SelectItem>
                            <SelectItem value="Patan">Patan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.level === "village" && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Village</label>
                        <Select
                          value={formData.jurisdiction.village}
                          onValueChange={(val) => setFormData({
                            ...formData,
                            jurisdiction: { ...formData.jurisdiction, village: val }
                          })}
                          disabled={inviterJurisdiction?.village && inviterJurisdiction.village !== "All"}
                        >
                          <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-medium">
                            <SelectItem value="All">All Villages</SelectItem>
                            <SelectItem value="Vasantgad">Vasantgad</SelectItem>
                            <SelectItem value="Kole">Kole</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/5 border border-dashed border-border/50 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold">Scope Definition</h4>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          This member will have access to data and analysis for the selected jurisdiction. You can refine specific areas in the member details later.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-2xl text-sm font-bold gap-2 shadow-lg shadow-primary/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Invitation Request"}
                    {!isSubmitting && <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* PENDING INVITES LIST */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-brand px-1">Pending Invitations</h3>
              {pendingInvites.length > 0 ? (
                <div className="space-y-3">
                  {pendingInvites.map((invite: any) => (
                    <Card key={invite.id} className="rounded-2xl border-border/50 shadow-none hover:border-primary/20 transition-all bg-background group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold truncate max-w-[180px]">{invite.email}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-4 px-1">{invite.role}</Badge>
                              <span className="text-[10px] text-muted-foreground font-medium italic">Pending</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl border-dashed border-border/50 shadow-none bg-muted/5">
                  <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Queue is empty</p>
                      <p className="text-[10px] font-medium leading-relaxed max-w-[200px]">No pending invitations at the moment.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Onboarding Tip</h4>
              </div>
              <p className="text-xs text-emerald-700/70 font-medium leading-relaxed">
                Inviting members as 'Analysts' is recommended for those who only need to monitor crop health without administrative overhead.
              </p>
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
