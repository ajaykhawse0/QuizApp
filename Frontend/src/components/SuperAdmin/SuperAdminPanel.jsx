import { useState, useEffect } from 'react';
import { Search, UserCog, Trash2, Shield, Users, AlertCircle } from 'lucide-react';
import {superadminAPI} from '../../services/api';

const SuperAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [superadmin, setSuperadmin] = useState({ name: 'SuperAdmin' }); 

  useEffect(() => {
    fetchUsers();
    
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) setSuperadmin(userData);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await superadminAPI.getAllUser();
      setUsers(response.data.Users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!newRole) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/superadmin/roles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }), 
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      setUsers(users.map(u =>
        u.userId === selectedUser.userId ? { ...u, role: newRole } : u
      ));

      closeModal();
      alert(`Role updated to ${newRole} for ${selectedUser.name}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/superadmin/delete/${selectedUser.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u.userId !== selectedUser.userId));
      closeModal();
      alert(`User ${selectedUser.name} deleted successfully`);
    } catch (err) {
      alert(err.message);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setModalAction('role');
    setShowModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalAction('delete');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction(null);
    setSelectedUser(null);
    setNewRole('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': 
        return 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-600/20 dark:text-purple-400 dark:border-purple-500/30';
      case 'admin': 
        return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30';
      case 'user': 
        return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-600/20 dark:text-gray-300 dark:border-gray-500/30';
      default: 
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const stats = {
    total: users.length,
    superadmins: users.filter(u => u.role === 'superadmin').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
     
      {/* Welcome Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
          👋 Hello, Welcome {superadmin?.name || 'SuperAdmin'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Manage users, roles, and system permissions with power.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Super Admins</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.superadmins}</p>
        </div>

        <div className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Admins</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.admins}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-gray-200"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden lg:block bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-400">User</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-400">Email</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-400">Role</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-400">Joined</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-700/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{user.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.toUpperCase()[0] + user.role.slice(1) || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mr-4"
                        title="Change Role"
                      >
                        <UserCog className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-500">
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.userId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-700/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold text-lg">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role.toUpperCase()[0] + user.role.slice(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openRoleModal(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition text-sm font-medium"
                >
                  <UserCog className="w-4 h-4" />
                  Change Role
                </button>
                <button
                  onClick={() => openDeleteModal(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6">
            {modalAction === 'role' ? (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4">
                  Change User Role
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 mb-4">
                  Update role for <strong className="text-gray-900 dark:text-gray-200">{selectedUser?.name}</strong>
                </p>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 text-sm sm:text-base bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg mb-5 sm:mb-6 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUser.userId, newRole)}
                    className="flex-1 px-4 py-2 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                  >
                    Update Role
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-500 mb-3 sm:mb-4">
                  Delete User
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 mb-5 sm:mb-6">
                  Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-200">{selectedUser?.name}</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                  >
                    Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPanel;