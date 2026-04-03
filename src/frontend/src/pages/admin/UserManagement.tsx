import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Trash2,
  UserCog,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppRole, ApprovalStatus, UserRole } from "../../backend";
import type { UserProfile } from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import {
  type CredentialAccount,
  useCredentialAuth,
} from "../../hooks/useCredentialAuth";

// Map AppRole to UserRole for authorization
function appRoleToUserRole(appRole: AppRole): UserRole {
  if (appRole === AppRole.admin) return UserRole.admin;
  if (appRole === AppRole.teacher) return UserRole.user;
  return UserRole.guest; // checker
}

function truncatePrincipal(p: string) {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}...${p.slice(-6)}`;
}

function RoleBadge({ role }: { role: AppRole | string }) {
  if (role === AppRole.admin || role === "admin") {
    return (
      <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20">
        Admin
      </Badge>
    );
  }
  if (role === AppRole.teacher || role === "teacher") {
    return (
      <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/20">
        Teacher
      </Badge>
    );
  }
  return (
    <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/20">
      Checker
    </Badge>
  );
}

function ApprovalBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20">
        <XCircle className="w-3 h-3 mr-1" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20">
      <AlertCircle className="w-3 h-3 mr-1" /> Pending
    </Badge>
  );
}

// ============ Credential Accounts Section ============
function CredentialAccountsSection() {
  const { listAccounts, createAccount, deleteAccount, changePassword } =
    useCredentialAuth();

  const [accounts, setAccounts] = useState<CredentialAccount[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState<string | null>(
    null,
  );

  // Create form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "teacher" | "checker">(
    "teacher",
  );
  const [newQualifications, setNewQualifications] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Change password form state
  const [cpOldPwd, setCpOldPwd] = useState("");
  const [cpNewPwd, setCpNewPwd] = useState("");
  const [cpConfirmPwd, setCpConfirmPwd] = useState("");
  const [showCpPwd, setShowCpPwd] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);

  const refreshAccounts = useCallback(() => {
    setAccounts(listAccounts());
  }, [listAccounts]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newUsername.trim() ||
      !newPassword ||
      !newName.trim() ||
      !newEmail.trim() ||
      !newPhone.trim()
    ) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    if (newPassword !== newConfirmPassword) {
      setCreateError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    try {
      await createAccount({
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        qualifications: newQualifications.trim(),
        isApproved: true,
        createdAt: new Date().toISOString(),
      });
      toast.success(`Account '${newUsername.trim()}' created successfully!`);
      setIsCreateOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewConfirmPassword("");
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewRole("teacher");
      setNewQualifications("");
      refreshAccounts();
    } catch (err: any) {
      setCreateError(err?.message ?? "Failed to create account.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (username: string) => {
    if (
      !window.confirm(
        `Delete credential account '${username}'? This cannot be undone.`,
      )
    )
      return;
    deleteAccount(username);
    toast.success(`Account '${username}' deleted.`);
    refreshAccounts();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordOpen) return;
    if (!cpOldPwd || !cpNewPwd || !cpConfirmPwd) {
      setCpError("Please fill in all fields.");
      return;
    }
    if (cpNewPwd !== cpConfirmPwd) {
      setCpError("New passwords do not match.");
      return;
    }
    if (cpNewPwd.length < 6) {
      setCpError("New password must be at least 6 characters.");
      return;
    }
    setCpError(null);
    setIsChangingPwd(true);
    try {
      await changePassword(changePasswordOpen, cpOldPwd, cpNewPwd);
      toast.success("Password changed successfully!");
      setChangePasswordOpen(null);
      setCpOldPwd("");
      setCpNewPwd("");
      setCpConfirmPwd("");
    } catch (err: any) {
      setCpError(err?.message ?? "Failed to change password.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Local Credential Accounts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            लोकल खाते — Username/password accounts stored locally
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAccounts}
            data-ocid="cred.secondary_button"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) setCreateError(null);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" data-ocid="cred.open_modal_button">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-ocid="cred.dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-primary" />
                  Create Credential Account
                </DialogTitle>
                <DialogDescription>
                  Create a username/password login account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cred-username">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cred-username"
                      placeholder="teacher1"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      disabled={isCreating}
                      data-ocid="cred.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cred-role">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={newRole}
                      onValueChange={(v) =>
                        setNewRole(v as "admin" | "teacher" | "checker")
                      }
                      disabled={isCreating}
                    >
                      <SelectTrigger id="cred-role" data-ocid="cred.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="checker">Checker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cred-password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cred-password"
                      type={showNewPwd ? "text" : "password"}
                      placeholder="min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isCreating}
                      className="pr-10"
                      data-ocid="cred.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showNewPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cred-confirm">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cred-confirm"
                    type="password"
                    placeholder="repeat password"
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    disabled={isCreating}
                    data-ocid="cred.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cred-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cred-name"
                    placeholder="Dr. Priya Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isCreating}
                    data-ocid="cred.input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cred-email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cred-email"
                      type="email"
                      placeholder="user@college.edu"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={isCreating}
                      data-ocid="cred.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cred-phone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cred-phone"
                      placeholder="9876543210"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      disabled={isCreating}
                      data-ocid="cred.input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cred-qual">Qualifications</Label>
                  <Textarea
                    id="cred-qual"
                    placeholder="M.Tech, PhD..."
                    value={newQualifications}
                    onChange={(e) => setNewQualifications(e.target.value)}
                    disabled={isCreating}
                    rows={2}
                    className="resize-none"
                    data-ocid="cred.textarea"
                  />
                </div>

                {createError && (
                  <Alert variant="destructive" data-ocid="cred.error_state">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isCreating}
                    data-ocid="cred.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    data-ocid="cred.confirm_button"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {isCreating ? "Creating..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={!!changePasswordOpen}
        onOpenChange={(open) => {
          if (!open) {
            setChangePasswordOpen(null);
            setCpOldPwd("");
            setCpNewPwd("");
            setCpConfirmPwd("");
            setCpError(null);
          }
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="cred.dialog">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Change password for{" "}
              <span className="font-mono font-semibold">
                {changePasswordOpen}
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cp-old">Current Password</Label>
              <div className="relative">
                <Input
                  id="cp-old"
                  type={showCpPwd ? "text" : "password"}
                  placeholder="Current password"
                  value={cpOldPwd}
                  onChange={(e) => setCpOldPwd(e.target.value)}
                  disabled={isChangingPwd}
                  className="pr-10"
                  data-ocid="cred.input"
                />
                <button
                  type="button"
                  onClick={() => setShowCpPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCpPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-new">New Password</Label>
              <Input
                id="cp-new"
                type="password"
                placeholder="New password"
                value={cpNewPwd}
                onChange={(e) => setCpNewPwd(e.target.value)}
                disabled={isChangingPwd}
                data-ocid="cred.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-confirm">Confirm New Password</Label>
              <Input
                id="cp-confirm"
                type="password"
                placeholder="Repeat new password"
                value={cpConfirmPwd}
                onChange={(e) => setCpConfirmPwd(e.target.value)}
                disabled={isChangingPwd}
                data-ocid="cred.input"
              />
            </div>
            {cpError && (
              <Alert variant="destructive" data-ocid="cred.error_state">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{cpError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordOpen(null)}
                disabled={isChangingPwd}
                data-ocid="cred.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChangingPwd}
                data-ocid="cred.confirm_button"
              >
                {isChangingPwd ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4 mr-2" />
                )}
                {isChangingPwd ? "Saving..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accounts table */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="cred.table"
      >
        {accounts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-center"
            data-ocid="cred.empty_state"
          >
            <KeyRound className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">
              No credential accounts
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create local accounts for username/password login
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Username
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Approved
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc, idx) => (
                  <TableRow
                    key={acc.username}
                    className="hover:bg-secondary/20 transition-colors"
                    data-ocid={`cred.item.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">
                        {acc.username}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {acc.name}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={acc.role} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {acc.email}
                    </TableCell>
                    <TableCell>
                      <ApprovalBadge
                        status={acc.isApproved ? "approved" : "pending"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          onClick={() => {
                            setChangePasswordOpen(acc.username);
                            setCpError(null);
                          }}
                          data-ocid={`cred.edit_button.${idx + 1}`}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span className="ml-1 text-xs">Pwd</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(acc.username)}
                          disabled={acc.username === "admin"}
                          data-ocid={`cred.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Main UserManagement Component ============
export function UserManagement() {
  const { actor } = useActor();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Create user form state
  const [createPrincipal, setCreatePrincipal] = useState("");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createRole, setCreateRole] = useState<AppRole>(AppRole.teacher);
  const [createQualifications, setCreateQualifications] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const list = await actor.listAllUsers();
      setUsers(list);
    } catch (err: any) {
      toast.error(`Failed to load users: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCopyPrincipal = (p: string) => {
    navigator.clipboard.writeText(p).then(() => {
      toast.success("Principal ID copied!");
    });
  };

  const handleApprove = async (user: UserProfile) => {
    if (!actor) return;
    const pid = user.principal.toString();
    setActionLoadingId(`${pid}_approve`);
    try {
      await actor.setApproval(
        user.principal as Principal,
        ApprovalStatus.approved,
      );
      await actor.assignCallerUserRole(
        user.principal as Principal,
        appRoleToUserRole(user.role),
      );
      toast.success(`${user.name} approved successfully!`);
      await loadUsers();
    } catch (err: any) {
      toast.error(`Approval failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (user: UserProfile) => {
    if (!actor) return;
    const pid = user.principal.toString();
    setActionLoadingId(`${pid}_reject`);
    try {
      await actor.setApproval(
        user.principal as Principal,
        ApprovalStatus.rejected,
      );
      toast.success(`${user.name} rejected.`);
      await loadUsers();
    } catch (err: any) {
      toast.error(`Rejection failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (!actor) return;
    if (!window.confirm(`Delete user ${user.name}? This cannot be undone.`))
      return;
    const pid = user.principal.toString();
    setActionLoadingId(`${pid}_delete`);
    try {
      await actor.adminDeleteUser(user.principal as Principal);
      toast.success(`${user.name} deleted.`);
      await loadUsers();
    } catch (err: any) {
      toast.error(`Delete failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (
      !createPrincipal.trim() ||
      !createName.trim() ||
      !createEmail.trim() ||
      !createPhone.trim()
    ) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const principalObj = Principal.fromText(createPrincipal.trim());

      const newUser = await actor.adminCreateUser(
        principalObj,
        createName.trim(),
        createEmail.trim(),
        createPhone.trim(),
        createRole,
        createQualifications.trim(),
      );

      await actor.assignCallerUserRole(
        principalObj,
        appRoleToUserRole(createRole),
      );

      toast.success(`User ${newUser.name} created successfully!`);
      setIsCreateOpen(false);
      setCreatePrincipal("");
      setCreateName("");
      setCreateEmail("");
      setCreatePhone("");
      setCreateRole(AppRole.teacher);
      setCreateQualifications("");
      await loadUsers();
    } catch (err: any) {
      setCreateError(err?.message ?? "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  const pendingCount = users.filter(
    (u) => u.approvalStatus === "pending",
  ).length;

  return (
    <div className="space-y-8" data-ocid="users.page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            User Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            उपयोगकर्ता प्रबंधन — Manage all registered users and approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
              {pendingCount} Pending
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            data-ocid="users.secondary_button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1.5" />
            )}
            Refresh
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-ocid="users.open_modal_button">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Create User / नया उपयोगकर्ता
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-ocid="users.dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-primary" />
                  Create User / उपयोगकर्ता बनाएं
                </DialogTitle>
                <DialogDescription>
                  Create a user account directly with a Principal ID
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="create-principal">
                    Principal ID (User ID){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-principal"
                    placeholder="aaaaa-bbbbb-ccccc-..."
                    value={createPrincipal}
                    onChange={(e) => setCreatePrincipal(e.target.value)}
                    required
                    disabled={isCreating}
                    data-ocid="users.input"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Internet Identity principal of the user
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="create-name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="create-name"
                      placeholder="Dr. Priya Sharma"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      required
                      disabled={isCreating}
                      data-ocid="users.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-role">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={createRole}
                      onValueChange={(v) => setCreateRole(v as AppRole)}
                      disabled={isCreating}
                    >
                      <SelectTrigger id="create-role" data-ocid="users.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AppRole.admin}>Admin</SelectItem>
                        <SelectItem value={AppRole.teacher}>Teacher</SelectItem>
                        <SelectItem value={AppRole.checker}>Checker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="user@college.edu.in"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    required
                    disabled={isCreating}
                    data-ocid="users.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    required
                    disabled={isCreating}
                    data-ocid="users.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-qual">Qualifications</Label>
                  <Textarea
                    id="create-qual"
                    placeholder="M.Tech, PhD..."
                    value={createQualifications}
                    onChange={(e) => setCreateQualifications(e.target.value)}
                    disabled={isCreating}
                    rows={2}
                    className="resize-none"
                    data-ocid="users.textarea"
                  />
                </div>

                {createError && (
                  <div
                    className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3"
                    data-ocid="users.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{createError}</p>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isCreating}
                    data-ocid="users.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    data-ocid="users.confirm_button"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {isCreating ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Internet Identity Users table */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-primary" />
          Internet Identity Users
        </h3>
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="users.table"
        >
          {isLoading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="users.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground ml-3">
                Loading users...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="users.empty_state"
            >
              <UserCog className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">
                No users registered yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                कोई उपयोगकर्ता पंजीकृत नहीं है — Users will appear here after
                registration
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      User ID (Principal)
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      Role
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => {
                    const pid = user.principal.toString();
                    const isActionLoading = actionLoadingId?.startsWith(pid);
                    const rowOcid = `users.item.${idx + 1}`;
                    return (
                      <TableRow
                        key={pid}
                        className="hover:bg-secondary/20 transition-colors"
                        data-ocid={rowOcid}
                      >
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                              {truncatePrincipal(pid)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPrincipal(pid)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy Principal ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.phone}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <ApprovalBadge status={user.approvalStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.approvalStatus === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                  onClick={() => handleApprove(user)}
                                  disabled={!!isActionLoading}
                                  data-ocid={`users.confirm_button.${idx + 1}`}
                                >
                                  {actionLoadingId === `${pid}_approve` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  <span className="ml-1 text-xs">Approve</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                  onClick={() => handleReject(user)}
                                  disabled={!!isActionLoading}
                                  data-ocid={`users.secondary_button.${idx + 1}`}
                                >
                                  {actionLoadingId === `${pid}_reject` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  <span className="ml-1 text-xs">Reject</span>
                                </Button>
                              </>
                            )}
                            {user.role !== AppRole.admin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(user)}
                                disabled={!!isActionLoading}
                                data-ocid={`users.delete_button.${idx + 1}`}
                              >
                                {actionLoadingId === `${pid}_delete` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {users.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Users",
              labelHindi: "कुल उपयोगकर्ता",
              value: users.length,
              color: "text-foreground",
            },
            {
              label: "Pending",
              labelHindi: "लंबित",
              value: users.filter((u) => u.approvalStatus === "pending").length,
              color: "text-yellow-400",
            },
            {
              label: "Approved",
              labelHindi: "स्वीकृत",
              value: users.filter((u) => u.approvalStatus === "approved")
                .length,
              color: "text-green-400",
            },
            {
              label: "Rejected",
              labelHindi: "अस्वीकृत",
              value: users.filter((u) => u.approvalStatus === "rejected")
                .length,
              color: "text-red-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs font-medium text-foreground mt-1">
                {stat.label}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {stat.labelHindi}
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Credential Accounts Section */}
      <CredentialAccountsSection />
    </div>
  );
}
