// src/UserCRUD.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserCRUD.css';

const API_URL = 'http://localhost:3001/users';

function UserCRUD() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: ''
  });

  // GET - Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // POST - Create new user
  const createUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(API_URL, formData);
      setUsers(prev => [...prev, response.data]);
      setFormData({ name: '', email: '', phone: '', website: '' });
      setError(null);
    } catch (err) {
      setError('Failed to create user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // PUT - Update entire user
  const updateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/${editingUser.id}`, formData);
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? response.data : user
      ));
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', website: '' });
      setError(null);
    } catch (err) {
      setError('Failed to update user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // PATCH - Partial update
  const patchUser = async (userId, updates) => {
    try {
      const response = await axios.patch(`${API_URL}/${userId}`, updates);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...response.data } : user
      ));
    } catch (err) {
      setError('Failed to update user: ' + err.message);
    }
  };

  // DELETE - Remove user
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setError(null);
    } catch (err) {
      setError('Failed to delete user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      website: user.website
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', website: '' });
  };

  return (
    <div className="container">
      <h1>User Management CRUD</h1>
      
      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* User Form */}
      <form onSubmit={editingUser ? updateUser : createUser} className="form">
        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
        <input
          type="url"
          name="website"
          placeholder="Website"
          value={formData.website}
          onChange={handleInputChange}
        />
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (editingUser ? 'Update User' : 'Add User')}
          </button>
          {editingUser && (
            <button type="button" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      {/* Loading Spinner */}
      {loading && <div className="spinner">Loading...</div>}

      {/* Users Table */}
      <div className="table-container">
        <h2>Users List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </td>
                <td className="actions">
                  <button 
                    onClick={() => startEdit(user)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => patchUser(user.id, { name: `${user.name} (Updated)` })}
                    className="patch-btn"
                  >
                    Patch Name
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p className="no-data">No users found. Add some users to get started!</p>
        )}
      </div>
    </div>
  );
}

export default UserCRUD;