'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Edit,
  MoreVertical,
  Plus,
  Trash2,
  CheckSquare,
  FolderOpen,
  Clock,
  FileDown,
  BookOpen,
  Building,
  Users as UsersIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { canManageUsers } from '@/lib/permissions';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  organizationId: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount?: number;
}

// Available permissions
const PERMISSIONS = {
  projects: {
    label: 'Projects',
    icon: FolderOpen,
    permissions: [
      { id: 'projects.create', label: 'Create projects' },
      { id: 'projects.view', label: 'View projects' },
      { id: 'projects.edit', label: 'Edit projects' },
      { id: 'projects.delete', label: 'Delete projects' },
    ],
  },
  tasks: {
    label: 'Tasks',
    icon: CheckSquare,
    permissions: [
      { id: 'tasks.create', label: 'Create tasks' },
      { id: 'tasks.view', label: 'View tasks' },
      { id: 'tasks.edit', label: 'Edit tasks' },
      { id: 'tasks.delete', label: 'Delete tasks' },
      { id: 'tasks.assign', label: 'Assign tasks' },
    ],
  },
  users: {
    label: 'Users',
    icon: UsersIcon,
    permissions: [
      { id: 'users.view', label: 'View users' },
      { id: 'users.invite', label: 'Invite users' },
      { id: 'users.edit', label: 'Edit users' },
      { id: 'users.delete', label: 'Delete users' },
      { id: 'users.manage_roles', label: 'Manage roles' },
    ],
  },
  time: {
    label: 'Time Tracking',
    icon: Clock,
    permissions: [
      { id: 'time.track', label: 'Track time' },
      { id: 'time.view_all', label: 'View all time entries' },
      { id: 'time.edit_all', label: 'Edit all time entries' },
      { id: 'time.approve', label: 'Approve time entries' },
    ],
  },
  reports: {
    label: 'Reports',
    icon: FileDown,
    permissions: [
      { id: 'reports.view', label: 'View reports' },
      { id: 'reports.create', label: 'Create reports' },
      { id: 'reports.export', label: 'Export data' },
    ],
  },
  kb: {
    label: 'Knowledge Base',
    icon: BookOpen,
    permissions: [
      { id: 'kb.view', label: 'View articles' },
      { id: 'kb.create', label: 'Create articles' },
      { id: 'kb.edit', label: 'Edit articles' },
      { id: 'kb.delete', label: 'Delete articles' },
    ],
  },
  org: {
    label: 'Organization',
    icon: Building,
    permissions: [
      { id: 'org.view', label: 'View organization' },
      { id: 'org.edit', label: 'Edit organization' },
      { id: 'org.billing', label: 'Manage billing' },
      { id: 'org.settings', label: 'Manage settings' },
    ],
  },
};

// Default roles
const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access',
    isSystem: true,
    permissions: Object.values(PERMISSIONS).flatMap(group => 
      group.permissions.map(p => p.id)
    ),
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard team member access',
    isSystem: true,
    permissions: [
      'projects.view',
      'tasks.create',
      'tasks.view',
      'tasks.edit',
      'tasks.assign',
      'users.view',
      'time.track',
      'reports.view',
      'kb.view',
      'kb.create',
      'org.view',
    ],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
    permissions: [
      'projects.view',
      'tasks.view',
      'users.view',
      'reports.view',
      'kb.view',
      'org.view',
    ],
  },
];

export default function TeamPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Form states for role creation
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const canManage = canManageUsers(session?.user?.role);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles([...DEFAULT_ROLES, ...data]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };


  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          permissions: newRolePermissions,
        }),
      });

      if (response.ok) {
        const newRole = await response.json();
        toast.success('Role created successfully');
        setRoles([...roles, newRole]);
        setCreateRoleDialogOpen(false);
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermissions([]);
      } else {
        toast.error('Failed to create role');
      }
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('Role updated successfully');
        fetchRoles();
        setEditingRole(null);
      } else {
        toast.error('Failed to update role');
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Role deleted successfully');
        setRoles(roles.filter(r => r.id !== roleId));
      } else {
        toast.error('Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };





  const togglePermission = (permission: string) => {
    setNewRolePermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage roles and their access permissions
          </p>
        </div>

        {/* Roles & Permissions Content */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Roles</h2>
              {canManage && (
                <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Define a custom role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input
                          id="roleName"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="e.g., Project Manager"
                        />
                      </div>
                      <div>
                        <Label htmlFor="roleDescription">Description</Label>
                        <Textarea
                          id="roleDescription"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                          placeholder="Describe the role's responsibilities..."
                        />
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="space-y-4 mt-2">
                          {Object.entries(PERMISSIONS).map(([key, group]) => {
                            const GroupIcon = group.icon;
                            return (
                              <Card key={key}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center gap-2">
                                    <GroupIcon className="h-4 w-4" />
                                    <CardTitle className="text-sm">{group.label}</CardTitle>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  {group.permissions.map(permission => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={permission.id}
                                        checked={newRolePermissions.includes(permission.id)}
                                        onCheckedChange={() => togglePermission(permission.id)}
                                      />
                                      <Label
                                        htmlFor={permission.id}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {permission.label}
                                      </Label>
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateRoleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRole}>
                        Create Role
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid gap-4">
              {roles.map(role => {
                const userCount = users.filter(u => u.role === role.id).length;
                return (
                  <Card key={role.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {role.name}
                            {role.isSystem && (
                              <Badge variant="secondary" className="text-xs">
                                System
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {userCount} {userCount === 1 ? 'user' : 'users'}
                          </Badge>
                          {canManage && !role.isSystem && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingRole(role)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(PERMISSIONS).map(([key, group]) => {
                          const GroupIcon = group.icon;
                          const rolePerms = group.permissions.filter(p => 
                            role.permissions.includes(p.id)
                          );
                          
                          if (rolePerms.length === 0) return null;
                          
                          return (
                            <div key={key} className="flex items-start gap-2">
                              <GroupIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{group.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {rolePerms.map(p => p.label).join(', ')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}