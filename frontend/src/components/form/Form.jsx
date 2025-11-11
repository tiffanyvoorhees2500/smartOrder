import './Form.css';
import axios from 'axios';
import { StyledForm } from './StyledForm';
import { useState, useEffect, useCallback } from 'react';
import { states } from './states';
import { setToken } from '../../utils/auth';
import { getAuthHeader, getUserFromToken } from '../../utils/auth';

const base_url = process.env.REACT_APP_API_BASE_URL;

/* Login Form */
export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    // Client-side validation
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      const response = await axios.post(`${base_url}/users/login`, {
        email,
        password,
      });

      setToken(response.data.token);
      window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
      // Show a generic error message
      setErrorMessage('Invalid credentials. Try again.');
    }
  }

  return (
    <StyledForm onSubmit={handleLogin} title="Login">
      {/* == Email == */}
      <label htmlFor="email">
        Email
        <input
          type="email"
          name="email"
          id="email"
          placeholder="example@example.com"
        />
      </label>

      {/* == Password == */}
      <label htmlFor="password">
        Password
        <input type="password" name="password" id="password" />
      </label>

      {/* == Submit == */}
      <button type="submit">Login</button>

      {/* Error message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </StyledForm>
  );
}

/* Manage Users Form */
export function ManageUsersForm() {
  const isAdmin = getUserFromToken()?.isAdmin;

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const BLANK_FORM = {
    id : null,
    name: '',
    email: '',
    password: '',
    defaultShipToState: 'UT',
    isAdmin: false,
    pricingType: 'Retail',
    discountType: 'Individual',
  };

  const [formData, setFormData] = useState(BLANK_FORM);
  
  // Fetch all users (only needed for admins)
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get(`${base_url}/users`, {
        headers: getAuthHeader(),
      });
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sorted);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [isAdmin]);  

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Non-Admin, autofill their own info
  useEffect(() => {
    if (isAdmin) return;

    const userId = getUserFromToken()?.id;
    if (!userId) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${base_url}/users/${userId}`, {
          headers: getAuthHeader(),
        });

        setFormData({
          id: response.data.id,
          name: response.data.name || "",
          email: response.data.email || "",
          password: "",
          defaultShipToState: response.data.defaultShipToState || "UT",
          isAdmin: response.data.isAdmin || false,
          pricingType: response.data.pricingType || "Retail",
          discountType: response.data.discountType || "Individual",
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
      } 
    };
    fetchData();
  }, [isAdmin]);

  // Admin, populate form when selected user changes
  useEffect(() => {
    if (!isAdmin) return;

    if (!selectedUserId) {
      setFormData(BLANK_FORM);
      return;
    }

    const user = users.find(u => String(u.id) === String(selectedUserId));
    if (user) {
      setFormData({
        id: user.id,  
        name: user.name || "",
        email: user.email || "",
        password: "",
        defaultShipToState: user.defaultShipToState || "UT",
        isAdmin: user.isAdmin || false,
        pricingType: user.pricingType || "Retail",
        discountType: user.discountType || "Individual",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedUserId, users]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' 
        ? checked 
        : name === 'isAdmin' 
        ? value === 'true' 
        : value,
    }));
  };

  // Save changes to user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = getUserFromToken(); // current logged in user
      const isCreateNew = isAdmin && !selectedUserId;

      let targetID;
      let method;
      let url;

      if (isCreateNew) {
        // Admin is creating a new user
        method = 'post';
        url = `${base_url}/users/manage-users`;
      } else {
        // Editing a user 
        method = 'put';
        targetID = isAdmin 
          ? selectedUserId || user.id // admin editing another user or self
          : user.id; // non-admin editing self
        url = `${base_url}/users/${targetID}`;
      }

      // Prepare payload
      const payload = { ...formData };

      // Don't send password if empty
      if (!payload.password) delete payload.password;   
      
      // If Admin, include admin-only fields
      if (isAdmin) {
        payload.isAdmin = formData.isAdmin;
        payload.pricingType = formData.pricingType;
        payload.discountType = formData.discountType;
      } else {
        // Non-admins cannot set these fields
        delete payload.isAdmin;
        delete payload.pricingType;
        delete payload.discountType;
      }

      // Send request
      const response = await axios[method](url, payload, { headers: getAuthHeader() });

      // if the logged-in user updated their own info, update the token
      const updatedUserId = response.data.id || targetID;
      if (String(updatedUserId) === String(user.id) && response.data.token) {
        setToken(response.data.token);
      }

      // update user list for admins
      if (isAdmin) await fetchUsers(); 

      alert('User saved!');
      setSelectedUserId(null); // back to “new user”
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(`Save failed: ${err.response.data.error}`);
      } else {
        console.error(err);
        alert('Save failed – see console.');
      }
    }
  };

  // Delete user 
  const handleDelete = async () => {
    if (!selectedUserId || !window.confirm('Delete this user?')) return;

    try {
      const response = await axios.delete(`${base_url}/users/${selectedUserId}`, { headers: getAuthHeader() });
      
      if (response.data.logout) {
        alert('Your account has been deleted. Logging out...');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      await fetchUsers(); // refresh user list from server
      setSelectedUserId(null);
      setFormData(BLANK_FORM);
      alert('User deleted');

    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit} title="Register/Edit Users">
      
      {/* Select User dropdown - Admins only */}
      {isAdmin && (
        <label>
          Select User:
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
          >
            <option value="">-- New User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Name */}
      <label>
        Name
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete='off'
        />
      </label>

      {/* Email */}
      <label>
        Email
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete='off'
        />
      </label>

      {/* Password */}
      <label>
        Password
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={formData.id && formData.password === '' ? 'Leave blank to keep' : ''}
          autoComplete='new-password'
        />
      </label>

      {/* Default Ship To State */}
      <label>
        State
        <select
          name="defaultShipToState"
          value={formData.defaultShipToState}
          onChange={handleChange}
          required
        >
          <option value="">Select a state</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {/* Admin, Pricing Type, Discount Type - Admin Only */}
      {isAdmin && (
        <>
          {/* Admin Yes/No Toggle */}
          <label className="inline-label">
            Admin:
            <div className="toggle-group">
              <label className={`toggle ${formData.isAdmin ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="isAdmin"
                  value="true"
                  checked={formData.isAdmin === true}
                  onChange={handleChange}
                />
                Yes
              </label>

              <label
                className={`toggle ${formData.isAdmin === false ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="isAdmin"
                  value="false"
                  checked={formData.isAdmin === false}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
          </label>

          {/* Pricing Type Toggle */}
          <label className="inline-label">
            Pricing Type:
            <div className="toggle-group">
              <label
                className={`toggle ${
                  formData.pricingType === 'Retail' ? 'active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="pricingType"
                  value="Retail"
                  checked={formData.pricingType === 'Retail'}
                  onChange={handleChange}
                />
                Retail
              </label>

              <label
                className={`toggle ${
                  formData.pricingType === 'Wholesale' ? 'active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="pricingType"
                  value="Wholesale"
                  checked={formData.pricingType === 'Wholesale'}
                  onChange={handleChange}
                />
                Wholesale
              </label>
            </div>
          </label>

          {/* Discount Type Toggle */}
          <label className="inline-label">
            Discount Type:
            <div className="toggle-group">
              <label
                className={`toggle ${
                  formData.discountType === 'Individual' ? 'active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="discountType"
                  value="Individual"
                  checked={formData.discountType === 'Individual'}
                  onChange={handleChange}
                />
                Individual
              </label>

              <label
                className={`toggle ${
                  formData.discountType === 'Group' ? 'active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="discountType"
                  value="Group"
                  checked={formData.discountType === 'Group'}
                  onChange={handleChange}
                />
                Group
              </label>
            </div>
          </label>
        </>
      )}
     
      <div className="form-buttons">
        {/* Save Button */}
        <button type="submit">Save</button>

        {/* Delete Button - Admins only */}
        {isAdmin && selectedUserId && (
          <button type="button" className="delete-button" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </StyledForm>
  );
}
