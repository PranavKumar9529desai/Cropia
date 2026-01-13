import { apiClient } from "@/lib/rpc";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { ConfirmationDialog } from "@repo/ui/components/confirmation-dialog";
import { createFileRoute, Link } from '@tanstack/react-router';
import { formatDistanceToNow } from "date-fns";
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
  CheckCircle2,
  Loader2
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
      const res = await apiClient.api.admin.organization.invite.$get();
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
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [villages, setVillages] = useState<string[]>([]);

  // Cancel Invite State
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [inviteIdToCancel, setInviteIdToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    role: "admin",
    level: inviterJurisdiction?.district && inviterJurisdiction.district !== "All" ? "district" :
      inviterJurisdiction?.taluka && inviterJurisdiction.taluka !== "All" ? "taluka" :
        inviterJurisdiction?.village && inviterJurisdiction.village !== "All" ? "village" : "state",
    pincode: "",
    jurisdiction: {
      state: inviterJurisdiction?.state || "Maharashtra",
      district: inviterJurisdiction?.district || "All",
      taluka: inviterJurisdiction?.taluka || "All",
      village: inviterJurisdiction?.village || "All"
    }
  });

  const handlePincodeChange = async (pincode: string) => {
    if (pincode.length !== 6) return;

    setIsPincodeLoading(true);
    try {
      const res = await apiClient.api.admin.organization.invite.pincode[":pincode"].$get({
        param: { pincode }
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const { state, district, taluka, villages: villageList } = result.data;

          setFormData(prev => ({
            ...prev,
            jurisdiction: {
              ...prev.jurisdiction,
              state: state,
              district: district,
              taluka: prev.level === "district" ? "All" : taluka,
              village: prev.level === "village" ? "All" : "All"
            }
          }));
          setVillages(villageList);
          toast.success("Location details auto-filled!");
        }
      } else {
        toast.error("Could not fetch location details for this pincode");
      }
    } catch (error) {
      console.error("Pincode Error:", error);
    } finally {
      setIsPincodeLoading(false);
    }
  };

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

  const handleCancelInvite = (inviteId: string) => {
    setInviteIdToCancel(inviteId);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!inviteIdToCancel) return;

    setIsCancelling(true);
    try {
      const res = await apiClient.api.admin.organization.invite[":invitationId"].$delete({
        param: { invitationId: inviteIdToCancel }
      });
      if (res.ok) {
        toast.success("Invitation cancelled");
        navigate({ search: (prev: any) => ({ ...prev }) }); // Refresh loader
        setIsCancelDialogOpen(false);
      } else {
        toast.error("Failed to cancel invitation");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling the invitation");
    } finally {
      setIsCancelling(false);
      setInviteIdToCancel(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-muted/5">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-8 py-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight font-brand flex items-center gap-3">
              <UserPlus className="size-6 md:size-8 text-primary" />
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
        <div className="max-w-7xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-10 pb-16">

          {/* INVITE FORM AREA */}
          <div className="lg:col-span-7 container w-full mx-auto space-y-8">
            <Card className="bg-background shadow-none border-none overflow-hidden ">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        onValueChange={(val: any) => {
                          const baseJurisdiction = {
                            state: inviterJurisdiction?.state || "Maharashtra",
                            district: "All",
                            taluka: "All",
                            village: "All"
                          };
                          setFormData({ ...formData, level: val, pincode: "", jurisdiction: baseJurisdiction });
                          setVillages([]);
                        }}
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

                  {formData.level !== "state" && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Pincode</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. 415110"
                          maxLength={6}
                          className="pl-12 h-12 rounded-2xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                          value={formData.pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setFormData({ ...formData, pincode: val });
                            if (val.length === 6) handlePincodeChange(val);
                          }}
                        />
                        {isPincodeLoading && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specific Jurisdiction Selection */}
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    {formData.level !== "state" && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">State</label>
                        <Input
                          value={formData.jurisdiction.state}
                          readOnly
                          className="h-12 rounded-2xl bg-muted/50 border-border/50 text-muted-foreground"
                        />
                      </div>
                    )}

                    {(formData.level === "district" || formData.level === "taluka" || formData.level === "village") && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">District</label>
                        <Input
                          value={formData.jurisdiction.district}
                          readOnly
                          className="h-12 rounded-2xl bg-muted/50 border-border/50 text-muted-foreground"
                        />
                      </div>
                    )}

                    {(formData.level === "taluka" || formData.level === "village") && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Taluka</label>
                        <Input
                          value={formData.jurisdiction.taluka}
                          readOnly
                          className="h-12 rounded-2xl bg-muted/50 border-border/50 text-muted-foreground"
                        />
                      </div>
                    )}

                    {formData.level === "village" && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Village</label>
                        <Select
                          value={formData.jurisdiction.village}
                          disabled={villages.length === 0}
                          onValueChange={(val) => setFormData({
                            ...formData,
                            jurisdiction: { ...formData.jurisdiction, village: val }
                          })}
                        >
                          <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                            <SelectValue placeholder={villages.length === 0 ? "Enter Pincode" : "Select Village"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl font-medium">
                            <SelectItem value="All">All Villages</SelectItem>
                            {villages.map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
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
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-border lg:pl-10">
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-brand px-1">Pending Invitations</h3>
              {pendingInvites.length > 0 ? (
                <div className="space-y-3">
                  {pendingInvites.map((invite: any) => (
                    <Card key={invite.id} className="rounded-2xl border-border/50 shadow-none hover:border-primary/20 transition-all bg-background group">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="text-sm font-bold truncate">{invite.email}</p>
                              <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-4 px-1 w-fit shrink-0">{invite.role}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium truncate">
                              {invite.jurisdiction?.village !== "All" ? `${invite.jurisdiction?.village}, ` : ""}
                              {invite.jurisdiction?.taluka !== "All" ? `${invite.jurisdiction?.taluka}, ` : ""}
                              {invite.jurisdiction?.district !== "All" ? `${invite.jurisdiction?.district}` : invite.jurisdiction?.state}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-medium italic sm:hidden">
                              {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:block text-xs lg:text-[10px] text-muted-foreground font-medium italic whitespace-nowrap">
                            {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCancelInvite(invite.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
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


          </div>

        </div>
      </div>

      <ConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={confirmCancel}
        isLoading={isCancelling}
        title="Cancel Invitation"
        description="Are you sure you want to cancel this invitation? This action cannot be undone and the invitee will no longer be able to use the join link."
        confirmText="Yes, Cancel Invite"
        variant="destructive"
      />

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
