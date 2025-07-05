"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  CreditCard,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  address?: string;
  dateOfBirth?: string;
  vehicleRegistration?: string;
  lastFourDigits?: string;
  phoneNumber?: string;
}

interface Policy {
  _id: string;
  policyNumber: string;
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  vehicleInfo: {
    make: string;
    model: string;
    yearOfManufacture: number;
    colour?: string;
  };
}

interface UserWithPolicies extends User {
  policies: Policy[];
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserWithPolicies[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithPolicies[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserWithPolicies | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setCurrentUser(data.user);
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users-with-policies");
      if (response.ok) {
        const data = await response.json();
        // Filter to only show regular users
        const regularUsers = data.users.filter(
          (user: UserWithPolicies) => user.role === "user"
        );
        setUsers(regularUsers);
      } else {
        // Fallback to regular users endpoint if the new one doesn't exist
        const usersResponse = await fetch("/api/admin/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const regularUsers = usersData.users.filter(
            (user: User) => user.role === "user"
          );
          setUsers(
            regularUsers.map((user: User) => ({ ...user, policies: [] }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.vehicleRegistration
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActiveFilter = statusFilter === "active";
      filtered = filtered.filter((user) => user.isActive === isActiveFilter);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (
      confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleEditUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "expired":
        return "bg-destructive/20 text-destructive";
      case "renewed":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pb-16">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              User Management
            </h1>
          </div>
          <button className="text-primary hover:text-primary/80 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-20">
        {/* Stats */}
        <div className="px-4 mb-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {users.filter((u) => u.isActive).length}
                </p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">
                  {users.reduce(
                    (sum, user) => sum + (user.policies?.length || 0),
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 mb-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-0 bg-card shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 rounded-lg border-0 bg-card shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Add User Button */}
        <div className="px-4 mb-4">
          <Button
            onClick={() => router.push("/admin/create-user")}
            className="w-full h-12 rounded-lg font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Users List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-muted-foreground">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {filteredUsers.length === 0 ? (
            <Card className="mobile-card">
              <CardContent className="p-8 text-center">
                <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user._id} className="mobile-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* User Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className="capitalize text-xs"
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {user.role.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {user.vehicleRegistration && (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {user.vehicleRegistration}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                        {user.policies && user.policies.length > 0 && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {user.policies.length}{" "}
                              {user.policies.length === 1
                                ? "Policy"
                                : "Policies"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {user.policies && user.policies.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/users/${user._id}/policies`)
                            }
                            className="flex-1"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Policies
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleUserStatus(user._id, user.isActive)
                          }
                          className="px-3"
                        >
                          {user.isActive ? (
                            <UserX className="w-4 h-4 text-destructive" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user._id, user.fullName)}
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Full Name
                    </Label>
                    <p className="font-medium">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Role
                    </Label>
                    <p className="font-medium capitalize">
                      {selectedUser.role.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Status
                    </Label>
                    <p className="font-medium">
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  {selectedUser.dateOfBirth && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Date of Birth
                      </Label>
                      <p className="font-medium">
                        {formatDate(selectedUser.dateOfBirth)}
                      </p>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Address
                      </Label>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                  )}
                  {selectedUser.vehicleRegistration && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Vehicle Registration
                      </Label>
                      <p className="font-medium uppercase">
                        {selectedUser.vehicleRegistration}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policies */}
              {selectedUser.policies && selectedUser.policies.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      Policies ({selectedUser.policies.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        router.push(
                          `/admin/users/${selectedUser._id}/policies`
                        );
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Manage All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedUser.policies.map((policy) => (
                      <Card key={policy._id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            Policy #{policy.policyNumber}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(policy.status)}>
                              {policy.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsViewDialogOpen(false);
                                router.push(`/admin/policy/${policy._id}`);
                              }}
                              className="h-6 px-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Vehicle:
                            </span>
                            <p>
                              {policy.vehicleInfo.yearOfManufacture}{" "}
                              {policy.vehicleInfo.make}{" "}
                              {policy.vehicleInfo.model}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Premium:
                            </span>
                            <p>£{policy.price}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Start Date:
                            </span>
                            <p>{formatDate(policy.startDate)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              End Date:
                            </span>
                            <p>{formatDate(policy.endDate)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <EditUserDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
      />
    </div>
  );
}

// Edit User Dialog Component
function EditUserDialog({
  user,
  isOpen,
  onClose,
  onSave,
}: {
  user: UserWithPolicies | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    isActive: true,
    address: "",
    dateOfBirth: "",
    vehicleRegistration: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "",
        isActive: user.isActive,
        address: user.address || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        vehicleRegistration: user.vehicleRegistration || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicleRegistration">Vehicle Registration</Label>
              <Input
                id="vehicleRegistration"
                value={formData.vehicleRegistration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleRegistration: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
