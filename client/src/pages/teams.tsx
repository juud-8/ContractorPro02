import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Mail, Settings, Trash2, UserPlus, Crown, Shield, User, Copy, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TeamWithMembers, TeamMember, TeamInvitation } from "@shared/schema";

export default function TeamsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [copiedInviteLink, setCopiedInviteLink] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    ownerId: "current-user-id", // This would come from auth context
  });
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member",
    teamId: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery<TeamWithMembers[]>({
    queryKey: ["/api/teams"],
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: typeof newTeam) => {
      return await apiRequest("/api/teams", {
        method: "POST",
        body: JSON.stringify(teamData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setShowCreateDialog(false);
      setNewTeam({ name: "", description: "", ownerId: "current-user-id" });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (inviteData: typeof inviteForm) => {
      return await apiRequest(`/api/teams/${inviteData.teamId}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          email: inviteData.email,
          role: inviteData.role,
          teamId: inviteData.teamId,
          invitedBy: "current-user-id",
          token: `invite-${Date.now()}-${Math.random()}`,
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setShowInviteDialog(false);
      setInviteForm({ email: "", role: "member", teamId: 0 });
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: number; userId: string }) => {
      return await apiRequest(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "manager":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return Crown;
      case "admin":
        return Shield;
      case "manager":
        return UserPlus;
      default:
        return User;
    }
  };

  const copyInviteLink = (teamId: number) => {
    const inviteLink = `${window.location.origin}/invite/${teamId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteLink(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invitation link has been copied to clipboard",
    });
    setTimeout(() => setCopiedInviteLink(null), 3000);
  };

  const handleCreateTeam = () => {
    createTeamMutation.mutate(newTeam);
  };

  const handleInviteUser = () => {
    if (inviteForm.teamId && inviteForm.email) {
      inviteUserMutation.mutate(inviteForm);
    }
  };

  const handleRemoveMember = (teamId: number, userId: string) => {
    removeTeamMemberMutation.mutate({ teamId, userId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teams and collaborate with your colleagues
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Enter team description"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCreateDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeam.name || createTeamMutation.isPending}
                  className="flex-1"
                >
                  {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams?.length || 0}</div>
            <p className="text-xs contractor-text-slate-600 mt-1">Active teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams?.reduce((acc, team) => acc + team.members.length, 0) || 0}
            </div>
            <p className="text-xs contractor-text-slate-600 mt-1">Across all teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs contractor-text-slate-600 mt-1">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams?.filter(t => t.ownerId === "current-user-id").length || 0}</div>
            <p className="text-xs contractor-text-slate-600 mt-1">As owner</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first team to start collaborating with colleagues
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    {team.description && (
                      <p className="text-muted-foreground mt-1">{team.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {team.members.length} {team.members.length === 1 ? "member" : "members"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyInviteLink(team.id)}
                      title="Copy invitation link"
                    >
                      {copiedInviteLink === `${window.location.origin}/invite/${team.id}` ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInviteForm({ ...inviteForm, teamId: team.id })}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              value={inviteForm.email}
                              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="p-3 bg-contractor-slate-50 rounded-md">
                            <p className="text-xs contractor-text-slate-600 mb-2">Or share this invitation link:</p>
                            <div className="flex items-center gap-2">
                              <Input
                                value={`${window.location.origin}/invite/${inviteForm.teamId}`}
                                readOnly
                                className="text-xs"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyInviteLink(inviteForm.teamId)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="invite-role">Role</Label>
                            <Select
                              value={inviteForm.role}
                              onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowInviteDialog(false)}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleInviteUser}
                              disabled={!inviteForm.email || inviteUserMutation.isPending}
                              className="flex-1"
                            >
                              {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {member.user.firstName?.[0] || member.user.email?.[0] || "?"}
                            </div>
                            <div>
                              <div className="font-medium">
                                {member.user.firstName && member.user.lastName
                                  ? `${member.user.firstName} ${member.user.lastName}`
                                  : member.user.email}
                              </div>
                              {member.user.email && (
                                <div className="text-sm text-muted-foreground">
                                  {member.user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {React.createElement(getRoleIcon(member.role), { className: "h-3 w-3 mr-1" })}
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {member.role !== "owner" && (
                              <>
                                <Select
                                  value={member.role}
                                  onValueChange={(newRole) => {
                                    // Update role mutation
                                    toast({
                                      title: "Role Updated",
                                      description: `Member role updated to ${newRole}`,
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-[100px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveMember(team.id, member.userId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}