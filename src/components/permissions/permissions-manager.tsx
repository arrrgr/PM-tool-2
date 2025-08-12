'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  Lock,
  Key,
  Crown
} from 'lucide-react';
// Define permissions client-side
const PERMISSIONS = {
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',
  TASK_VIEW: 'task:view',
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_COMMENT: 'task:comment',
  TEAM_VIEW: 'team:view',
  TEAM_CREATE: 'team:create',
  TEAM_EDIT: 'team:edit',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE_MEMBERS: 'team:manage_members',
  ORG_VIEW: 'org:view',
  ORG_EDIT: 'org:edit',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  ORG_MANAGE_BILLING: 'org:manage_billing',
  ORG_MANAGE_SETTINGS: 'org:manage_settings',
  KB_VIEW: 'kb:view',
  KB_CREATE: 'kb:create',
  KB_EDIT: 'kb:edit',
  KB_DELETE: 'kb:delete',
  TEMPLATE_VIEW: 'template:view',
  TEMPLATE_CREATE: 'template:create',
  TEMPLATE_EDIT: 'template:edit',
  TEMPLATE_DELETE: 'template:delete',
  TEMPLATE_USE: 'template:use',
};

interface Role {
  id: string;
  name: string;
  description: string | null;
  type: string;
  permissions: any;
  isDefault: boolean;
}

interface User {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  roles: any;
}

interface PermissionsManagerProps {
  roles: Role[];
  users: User[];
  currentUserId: string;
}

const permissionGroups = {
  'Projects': [
    { key: PERMISSIONS.PROJECT_VIEW, label: 'View Projects' },
    { key: PERMISSIONS.PROJECT_CREATE, label: 'Create Projects' },
    { key: PERMISSIONS.PROJECT_EDIT, label: 'Edit Projects' },
    { key: PERMISSIONS.PROJECT_DELETE, label: 'Delete Projects' },
    { key: PERMISSIONS.PROJECT_MANAGE_MEMBERS, label: 'Manage Project Members' },
  ],
  'Tasks': [
    { key: PERMISSIONS.TASK_VIEW, label: 'View Tasks' },
    { key: PERMISSIONS.TASK_CREATE, label: 'Create Tasks' },
    { key: PERMISSIONS.TASK_EDIT, label: 'Edit Tasks' },
    { key: PERMISSIONS.TASK_DELETE, label: 'Delete Tasks' },
    { key: PERMISSIONS.TASK_ASSIGN, label: 'Assign Tasks' },
    { key: PERMISSIONS.TASK_COMMENT, label: 'Comment on Tasks' },
  ],
  'Teams': [
    { key: PERMISSIONS.TEAM_VIEW, label: 'View Teams' },
    { key: PERMISSIONS.TEAM_CREATE, label: 'Create Teams' },
    { key: PERMISSIONS.TEAM_EDIT, label: 'Edit Teams' },
    { key: PERMISSIONS.TEAM_DELETE, label: 'Delete Teams' },
    { key: PERMISSIONS.TEAM_MANAGE_MEMBERS, label: 'Manage Team Members' },
  ],
  'Organization': [
    { key: PERMISSIONS.ORG_VIEW, label: 'View Organization' },
    { key: PERMISSIONS.ORG_EDIT, label: 'Edit Organization' },
    { key: PERMISSIONS.ORG_MANAGE_MEMBERS, label: 'Manage Members' },
    { key: PERMISSIONS.ORG_MANAGE_BILLING, label: 'Manage Billing' },
    { key: PERMISSIONS.ORG_MANAGE_SETTINGS, label: 'Manage Settings' },
  ],
  'Knowledge Base': [
    { key: PERMISSIONS.KB_VIEW, label: 'View Articles' },
    { key: PERMISSIONS.KB_CREATE, label: 'Create Articles' },
    { key: PERMISSIONS.KB_EDIT, label: 'Edit Articles' },
    { key: PERMISSIONS.KB_DELETE, label: 'Delete Articles' },
  ],
  'Templates': [
    { key: PERMISSIONS.TEMPLATE_VIEW, label: 'View Templates' },
    { key: PERMISSIONS.TEMPLATE_CREATE, label: 'Create Templates' },
    { key: PERMISSIONS.TEMPLATE_EDIT, label: 'Edit Templates' },
    { key: PERMISSIONS.TEMPLATE_DELETE, label: 'Delete Templates' },
    { key: PERMISSIONS.TEMPLATE_USE, label: 'Use Templates' },
  ],
};

export function PermissionsManager({ roles, users, currentUserId }: PermissionsManagerProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [editPermissionsDialogOpen, setEditPermissionsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newRoleData, setNewRoleData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [roleAssignment, setRoleAssignment] = useState({
    userId: '',
    roleId: '',
  });

  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Shield className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleCreateRole = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoleData),
      });

      if (response.ok) {
        router.refresh();
        setCreateRoleDialogOpen(false);
        setNewRoleData({ name: '', description: '', permissions: [] });
      }
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleAssignment),
      });

      if (response.ok) {
        router.refresh();
        setAssignRoleDialogOpen(false);
        setRoleAssignment({ userId: '', roleId: '' });
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setNewRoleData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <>
      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
          <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Manage roles and their permissions
              </p>
              <Button onClick={() => setCreateRoleDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map(role => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.type)}
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                      </div>
                      {role.type === 'system' && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setEditPermissionsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          View Permissions
                        </Button>
                        {role.type !== 'system' && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Manage user roles and permissions
              </p>
              <Button onClick={() => setAssignRoleDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </div>

            <div className="space-y-3">
              {users.map(({ user, roles: userRoles }) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image || ''} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'Unnamed User'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.id === currentUserId && (
                          <Badge variant="outline">You</Badge>
                        )}
                        {Array.isArray(userRoles) && userRoles.map((role: any) => (
                          <Badge key={role.id} variant={getRoleBadgeVariant(role.name)}>
                            {role.type === 'system' && <Crown className="h-3 w-3 mr-1" />}
                            {role.name}
                          </Badge>
                        ))}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRoleData.name}
                onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                placeholder="e.g., Project Manager"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={newRoleData.description}
                onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                placeholder="Describe the role's responsibilities"
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="space-y-4 border rounded-lg p-4">
                {Object.entries(permissionGroups).map(([group, permissions]) => (
                  <div key={group}>
                    <h4 className="font-medium mb-2">{group}</h4>
                    <div className="space-y-2">
                      {permissions.map(permission => (
                        <div key={permission.key} className="flex items-center space-x-2">
                          <Switch
                            checked={newRoleData.permissions.includes(permission.key)}
                            onCheckedChange={() => togglePermission(permission.key)}
                          />
                          <Label className="text-sm font-normal">{permission.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={loading || !newRoleData.name}>
              {loading ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Permissions Dialog */}
      <Dialog open={editPermissionsDialogOpen} onOpenChange={setEditPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole?.name} Permissions</DialogTitle>
            <DialogDescription>
              View the permissions assigned to this role.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {Object.entries(permissionGroups).map(([group, permissions]) => {
                const rolePermissions = Array.isArray(selectedRole?.permissions) 
                  ? selectedRole.permissions 
                  : [];
                const groupPermissions = permissions.filter(p => 
                  rolePermissions.includes(p.key)
                );
                
                if (groupPermissions.length === 0) return null;
                
                return (
                  <div key={group}>
                    <h4 className="font-medium mb-2">{group}</h4>
                    <div className="space-y-1">
                      {groupPermissions.map(permission => (
                        <div key={permission.key} className="flex items-center space-x-2 text-sm">
                          <Lock className="h-3 w-3 text-green-600" />
                          <span>{permission.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEditPermissionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
            <DialogDescription>
              Select a user and role to assign.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="select-user">User</Label>
              <Select
                value={roleAssignment.userId}
                onValueChange={(value) => setRoleAssignment({ ...roleAssignment, userId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(({ user }) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="select-role">Role</Label>
              <Select
                value={roleAssignment.roleId}
                onValueChange={(value) => setRoleAssignment({ ...roleAssignment, roleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={loading || !roleAssignment.userId || !roleAssignment.roleId}
            >
              {loading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}