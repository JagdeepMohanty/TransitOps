import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import SettingsHeader           from '@components/settings/SettingsHeader';
import SettingsKpiCards         from '@components/settings/SettingsKpiCards';
import UserManagementTable      from '@components/settings/UserManagementTable';
import RolesCard                from '@components/settings/RolesCard';
import RolePermissionMatrix     from '@components/settings/RolePermissionMatrix';
import ApplicationSettingsCard  from '@components/settings/ApplicationSettingsCard';
import SecuritySettingsCard     from '@components/settings/SecuritySettingsCard';
import NotificationSettingsCard from '@components/settings/NotificationSettingsCard';
import ActivityTimeline         from '@components/settings/ActivityTimeline';
import UserModal                from '@components/settings/UserModal';
import RoleModal                from '@components/settings/RoleModal';
import ApprovalModal            from '@components/settings/ApprovalModal';
import { usersApi }             from '@/api/users.api';

function Divider({ label, description }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
      <div className="text-center shrink-0">
        <span className="text-[10px] font-black text-content-disabled uppercase tracking-[0.2em] px-3">{label}</span>
        {description && <p className="text-[9px] text-content-disabled/60 mt-0.5">{description}</p>}
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-border/60 to-transparent" />
    </div>
  );
}

export default function SettingsPage() {
  const [users,         setUsers]         = useState([]);
  const [roles,         setRoles]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [userModal,     setUserModal]     = useState({ mode: null, user: null });
  const [roleModal,     setRoleModal]     = useState({ mode: null, role: null });
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, mode: 'approve', user: null, loading: false });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, rRes] = await Promise.all([
        usersApi.list({ limit: 100 }),
        usersApi.getRoles(),
      ]);
      setUsers(uRes.data?.data?.data ?? uRes.data?.data ?? []);
      setRoles(rRes.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddUser    = ()     => setUserModal({ mode: 'add',    user: null });
  const openEditUser   = (user) => setUserModal({ mode: 'edit',   user });
  const openDeleteUser = (user) => setUserModal({ mode: 'delete', user });
  const closeUserModal = ()     => setUserModal({ mode: null,     user: null });

  const handleUserConfirm = async (formData) => {
    try {
      if (userModal.mode === 'add') {
        await usersApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: Number(formData.roleId || 1),
        });
      } else if (userModal.mode === 'edit') {
        await usersApi.update(userModal.user.id, {
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
          ...(formData.roleId ? { roleId: Number(formData.roleId) } : {}),
        });
      } else if (userModal.mode === 'delete') {
        await usersApi.remove(userModal.user.id);
      }
      closeUserModal();
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Action failed');
    }
  };

  const openApprove    = (user) => setApprovalModal({ isOpen: true, mode: 'approve',    user, loading: false });
  const openReject     = (user) => setApprovalModal({ isOpen: true, mode: 'reject',     user, loading: false });
  const openChangeRole = (user) => setApprovalModal({ isOpen: true, mode: 'changeRole', user, loading: false });
  const closeApproval  = ()     => setApprovalModal({ isOpen: false, mode: 'approve',   user: null, loading: false });

  const handleApprovalConfirm = async (payload) => {
    setApprovalModal(prev => ({ ...prev, loading: true }));
    try {
      if (approvalModal.mode === 'approve') {
        await usersApi.approve(approvalModal.user.id, payload);
      } else if (approvalModal.mode === 'reject') {
        await usersApi.reject(approvalModal.user.id, payload);
      } else if (approvalModal.mode === 'changeRole') {
        await usersApi.updateRole(approvalModal.user.id, payload);
      }
      closeApproval();
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Operation failed');
      setApprovalModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openCreateRole = ()     => setRoleModal({ mode: 'create', role: null });
  const openEditRole   = (role) => setRoleModal({ mode: 'edit',   role });
  const closeRoleModal = ()     => setRoleModal({ mode: null,     role: null });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="space-y-6 pb-12">

        <SettingsHeader onAddUser={openAddUser} onCreateRole={openCreateRole} onSave={() => {}} />

        <Divider label="Overview" description="Platform-wide metrics at a glance" />
        <SettingsKpiCards />

        <Divider label="User Management & Approvals" description="Review registered accounts, approve roles, and configure RBAC" />
        <UserManagementTable
          users={users}
          roles={roles}
          loading={loading}
          error={error}
          onRefresh={fetchUsers}
          onEdit={openEditUser}
          onDelete={openDeleteUser}
          onAdd={openAddUser}
          onApprove={openApprove}
          onReject={openReject}
          onChangeRole={openChangeRole}
        />

        <Divider label="Roles" description="Define and manage organizational roles" />
        <RolesCard onEdit={openEditRole} onCreate={openCreateRole} />

        <Divider label="Permission Matrix" description="Module-level access control per role" />
        <RolePermissionMatrix />

        <Divider label="Application & Security" description="Company settings and security configuration" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ApplicationSettingsCard />
          <SecuritySettingsCard />
        </div>

        <Divider label="Notifications & Activity" description="Alert configuration and audit trail" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <NotificationSettingsCard />
          <ActivityTimeline />
        </div>

      </motion.div>

      <UserModal
        mode={userModal.mode}
        user={userModal.user}
        roles={roles}
        onClose={closeUserModal}
        onConfirm={handleUserConfirm}
      />

      <ApprovalModal
        isOpen={approvalModal.isOpen}
        mode={approvalModal.mode}
        user={approvalModal.user}
        roles={roles}
        loading={approvalModal.loading}
        onClose={closeApproval}
        onConfirm={handleApprovalConfirm}
      />

      <RoleModal
        mode={roleModal.mode}
        role={roleModal.role}
        onClose={closeRoleModal}
        onConfirm={() => closeRoleModal()}
      />
    </>
  );
}
