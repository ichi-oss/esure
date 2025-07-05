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
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Settings,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function SubAdminsManagement() {
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [filteredSubAdmins, setFilteredSubAdmins] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSubAdmins();
  }, []);

  useEffect(() => {
    filterSubAdmins();
  }, [subAdmins, searchTerm, statusFilter]);

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

  const fetchSubAdmins = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        // Filter to only show sub-admins
        const subAdminUsers = data.users.filter(
          (user: User) => user.role === "sub-admin"
        );
        setSubAdmins(subAdminUsers);
      }
    } catch (error) {
      console.error("Error fetching sub-admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubAdmins = () => {
    let filtered = subAdmins;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (subAdmin) =>
          subAdmin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subAdmin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActiveFilter = statusFilter === "active";
      filtered = filtered.filter(
        (subAdmin) => subAdmin.isActive === isActiveFilter
      );
    }

    setFilteredSubAdmins(filtered);
  };

  const toggleSubAdminStatus = async (
    subAdminId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${subAdminId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchSubAdmins();
      }
    } catch (error) {
      console.error("Error updating sub-admin status:", error);
    }
  };

  const deleteSubAdmin = async (subAdminId: string, subAdminName: string) => {
    if (
      confirm(
        `Are you sure you want to delete sub-admin ${subAdminName}? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/users/${subAdminId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchSubAdmins();
        }
      } catch (error) {
        console.error("Error deleting sub-admin:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading sub-admins...</p>
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
              onClick={() => router.push("/admin")}
              className="p-2 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              Sub-Admin Management
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
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold">{subAdmins.length}</p>
                <p className="text-xs text-muted-foreground">
                  Total Sub-Admins
                </p>
              </div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {subAdmins.filter((u) => u.isActive).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Sub-Admins
                </p>
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
                placeholder="Search sub-admins..."
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

        {/* Add Sub-Admin Button */}
        <div className="px-4 mb-4">
          <Button
            onClick={() => router.push("/admin/create-sub-admin")}
            className="w-full h-12 rounded-lg font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Sub-Admin
          </Button>
        </div>

        {/* Sub-Admins List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-muted-foreground">
              Sub-Admins ({filteredSubAdmins.length})
            </h3>
          </div>

          {filteredSubAdmins.length === 0 ? (
            <Card className="mobile-card">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sub-admins found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSubAdmins.map((subAdmin) => (
                <Card
                  key={subAdmin._id}
                  className="mobile-card overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Sub-Admin Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{subAdmin.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {subAdmin.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              subAdmin.isActive ? "default" : "secondary"
                            }
                            className="capitalize text-xs"
                          >
                            {subAdmin.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Sub-Admin
                          </Badge>
                        </div>
                      </div>

                      {/* Sub-Admin Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {subAdmin.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDate(subAdmin.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubAdmin(subAdmin);
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
                            router.push(
                              `/admin/edit-sub-admin/${subAdmin._id}`
                            );
                          }}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleSubAdminStatus(
                              subAdmin._id,
                              subAdmin.isActive
                            )
                          }
                          className="px-3"
                        >
                          {subAdmin.isActive ? (
                            <UserX className="w-4 h-4 text-destructive" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            deleteSubAdmin(subAdmin._id, subAdmin.fullName)
                          }
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

      {/* View Sub-Admin Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sub-Admin Details</DialogTitle>
          </DialogHeader>
          {selectedSubAdmin && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Full Name
                    </Label>
                    <p className="font-medium">{selectedSubAdmin.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <p className="font-medium">{selectedSubAdmin.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Role
                    </Label>
                    <p className="font-medium">Sub-Administrator</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Status
                    </Label>
                    <p className="font-medium">
                      {selectedSubAdmin.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Created Date
                    </Label>
                    <p className="font-medium">
                      {formatDate(selectedSubAdmin.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Create and manage users</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Settings className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Create and manage policies</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Eye className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      View all user data and policies
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
