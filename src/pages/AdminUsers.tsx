import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, ShieldOff, UserPlus, Trash2, Filter, X } from "lucide-react";
import { BulkAccountDialog } from "@/components/BulkAccountDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "all",
    plan: "all",
    jobRole: "",
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Admin role granted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to grant admin role");
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Admin role removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove admin role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const results = await Promise.allSettled(
        userIds.map(userId =>
          supabase.functions.invoke("delete-user", {
            body: { userId },
          })
        )
      );
      
      const failed = results.filter(r => r.status === "rejected").length;
      const succeeded = results.length - failed;
      
      return { succeeded, failed, total: results.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      
      if (data.failed > 0) {
        toast.warning(`Deleted ${data.succeeded} users. ${data.failed} failed.`);
      } else {
        toast.success(`Successfully deleted ${data.succeeded} users`);
      }
      
      setSelectedUsers(new Set());
      setBulkDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete users");
    },
  });

  const isAdmin = (userId: string) => {
    return userRoles?.some(role => role.user_id === userId && role.role === "admin");
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
    }
  };

  const handleBulkDeleteConfirm = () => {
    bulkDeleteMutation.mutate(Array.from(selectedUsers));
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      email: "",
      role: "all",
      plan: "all",
      jobRole: "",
    });
  };

  const hasActiveFilters = filters.name || filters.email || filters.role !== "all" || filters.plan !== "all" || filters.jobRole;

  const filteredProfiles = profiles?.filter((profile) => {
    if (filters.name && !profile.full_name?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.email && !profile.email.toLowerCase().includes(filters.email.toLowerCase())) {
      return false;
    }
    if (filters.role !== "all") {
      const hasAdminRole = isAdmin(profile.id);
      if (filters.role === "admin" && !hasAdminRole) return false;
      if (filters.role === "user" && hasAdminRole) return false;
    }
    if (filters.plan !== "all" && profile.plan_type !== filters.plan) {
      return false;
    }
    if (filters.jobRole && !profile.job_role?.toLowerCase().includes(filters.jobRole.toLowerCase())) {
      return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredProfiles?.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredProfiles?.map(p => p.id) || []));
    }
  };

  const isAllSelected = filteredProfiles?.length > 0 && selectedUsers.size === filteredProfiles?.length;

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and create bulk accounts
          </p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedUsers.size})
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Filter Users</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="filter-name">Name</Label>
                    <Input
                      id="filter-name"
                      placeholder="Search by name"
                      value={filters.name}
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-email">Email</Label>
                    <Input
                      id="filter-email"
                      placeholder="Search by email"
                      value={filters.email}
                      onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-role">Role</Label>
                    <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                      <SelectTrigger id="filter-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-plan">Plan</Label>
                    <Select value={filters.plan} onValueChange={(value) => setFilters({ ...filters, plan: value })}>
                      <SelectTrigger id="filter-plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-job">Job Role</Label>
                    <Input
                      id="filter-job"
                      placeholder="Search by job role"
                      value={filters.jobRole}
                      onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => setBulkDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Bulk Accounts
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Job Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProfiles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  {hasActiveFilters ? "No users match the current filters" : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles?.map((profile) => {
                const hasAdminRole = isAdmin(profile.id);
                const planType = profile.plan_type || "basic";
                const planBadgeVariant = planType === "pro" ? "default" : planType === "trial" ? "secondary" : "outline";
                
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(profile.id)}
                        onCheckedChange={() => toggleUserSelection(profile.id)}
                        aria-label={`Select ${profile.full_name || profile.email}`}
                      />
                    </TableCell>
                    <TableCell>{profile.full_name || "N/A"}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      {hasAdminRole ? (
                        <Badge variant="default" className="bg-purple-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>{profile.job_role || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={planBadgeVariant}>
                        {planType.charAt(0).toUpperCase() + planType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {hasAdminRole ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAdminMutation.mutate(profile.id)}
                            disabled={removeAdminMutation.isPending}
                          >
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Remove Admin
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => addAdminMutation.mutate(profile.id)}
                            disabled={addAdminMutation.isPending}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(profile.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <BulkAccountDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              All user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''}? 
              This action cannot be undone. All user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
