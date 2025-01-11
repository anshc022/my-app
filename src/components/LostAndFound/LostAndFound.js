import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ItemList from './ItemList';
import ReportItem from './ReportItem';  // Import the separated component

const UserHeader = ({ user, onLogout }) => (
  <div className="fixed top-4 right-4 z-20 flex items-center gap-4">
    <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-white/10">
      <span className="text-gray-400">Welcome, </span>
      <span className="text-amber-400 font-medium">{user.username}</span>
    </div>
    <button
      onClick={onLogout}
      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
    >
      Logout
    </button>
  </div>
);

const LostAndFound = () => {
  const navigate = useNavigate();
  const { user, token, setUser, setToken, login, register } = useAuth(); // Add setUser and setToken here
  const [activeTab, setActiveTab] = useState('browse');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMatchesOnly, setShowMatchesOnly] = useState(false);
  const [currentUserItem, setCurrentUserItem] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginData, setLoginData] = useState({ 
    login: '', // Changed from email to login
    password: '' 
  });
  const [registerData, setRegisterData] = useState({ 
    username: '',
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [userReports, setUserReports] = useState([]); // Ensure it's initialized as an empty array
  const [matchedItems, setMatchedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://unilife-backend-js.onrender.com/api/lost-items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter out deleted items
      const activeItems = data.filter(item => !item.isDeleted);
      
      // Filter and match items
      const foundItems = activeItems.filter(item => item.type === 'found');
      const lostItems = activeItems.filter(item => item.type === 'lost');
      
      // Find matches based on category and description similarity
      const matches = foundItems.map(foundItem => {
        const matchingLost = lostItems.find(lostItem => 
          lostItem.category === foundItem.category &&
          (lostItem.description.toLowerCase().includes(foundItem.description.toLowerCase()) ||
           foundItem.description.toLowerCase().includes(lostItem.description.toLowerCase()))
        );
        return matchingLost ? { found: foundItem, lost: matchingLost } : null;
      }).filter(Boolean);

      setMatchedItems(matches);
      setItems(activeItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  // Add this function to fetch user's reports
  const fetchUserReports = async () => {
    try {
      const response = await fetch('https://unilife-backend-js.onrender.com/api/lost-items/my-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // Filter out any potentially deleted items on the client side as well
      setUserReports(
        Array.isArray(data) 
          ? data.filter(report => !report.isDeleted)
          : []
      );
    } catch (error) {
      console.error('Error fetching user reports:', error);
      setUserReports([]); // Set empty array on error
    }
  };

  // Update useEffect to fetch user reports
  useEffect(() => {
    if (token) {
      fetchItems();
      fetchUserReports(); // Add this line
    }
  }, [token]);

  const handleItemSubmitted = async (updatedItem) => {
    if (editingItem) {
      // Update the item in the reports list
      setUserReports(prevReports => 
        prevReports.map(report => 
          report._id === updatedItem._id ? updatedItem : report
        )
      );
      setEditingItem(null);
    } else {
      setCurrentUserItem(updatedItem);
      setShowMatchesOnly(true);
    }
    setActiveTab('browse');
    await fetchItems();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('https://unilife-backend-js.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token); // Add this line to update token state
        setUser(data.user); // Add this line to update user state
        setShowLoginForm(false);
        await fetchItems(); // Refresh items after login
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const response = await fetch('https://unilife-backend-js.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token); // Add this line to update token state
        setUser(data.user); // Add this line to update user state
        setShowRegisterForm(false);
        await fetchItems(); // Refresh items after registration
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Add authentication check effect
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        // No token found, force to login screen
        setShowLoginForm(true);
        return;
      }

      try {
        // Verify token is valid
        const response = await fetch('https://unilife-backend-js.onrender.com/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (!response.ok) {
          // Token invalid, clear it and force login
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setShowLoginForm(true);
          return;
        }

        // Token valid, set it
        setToken(storedToken);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setShowLoginForm(true);
      }
    };

    checkAuth();
  }, []);

  // Force redirect to login if no token
  if (!token && !showLoginForm && !showRegisterForm) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="bg-gray-800/50 p-8 rounded-lg border border-white/10 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Access Required</h2>
          <p className="text-gray-400 mb-8 text-center">
            Please login or register to access the Lost & Found system
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowLoginForm(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => setShowRegisterForm(true)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add claim handler
  const handleClaimItem = async (itemId) => {
    try {
      const response = await fetch(`https://unilife-backend-js.onrender.com/api/lost-items/${itemId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Claim submitted successfully. The owner will be notified.');
        fetchItems();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error claiming item:', error);
      alert('Failed to claim item: ' + error.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`https://unilife-backend-js.onrender.com/api/lost-items/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete report');

      // Update both the reports list and main items list
      await Promise.all([
        fetchUserReports(),
        fetchItems()
      ]);
      
      alert('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report: ' + error.message);
    }
  };

  const handleEditReport = (report) => {
    setEditingItem(report);
    setActiveTab('report');
  };

  // Initial choice screen
  if (!token && !showLoginForm && !showRegisterForm) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="bg-gray-800/50 p-8 rounded-lg border border-white/10 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Lost & Found</h2>
          <p className="text-gray-400 mb-8 text-center">
            Please login or register to continue
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowLoginForm(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => setShowRegisterForm(true)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add this JSX for the combined login/register form
  if (!token && showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="bg-gray-800/50 p-8 rounded-lg border border-white/10 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {showRegisterForm ? 'Register' : 'Login'}
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-center">
              {error}
            </div>
          )}
          
          {showRegisterForm ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-gray-400">Username</label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400">Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-1"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-gray-400">Confirm Password</label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-1"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-4 mt-6">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Register
                </button>
                <p className="text-center text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="text-amber-500 hover:text-amber-400"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-gray-400">Username or Email</label>
                <input
                  type="text"
                  value={loginData.login}
                  onChange={(e) => setLoginData({...loginData, login: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-1"
                  required
                  placeholder="Enter username or email"
                />
              </div>
              <div>
                <label className="text-gray-400">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-1"
                  required
                />
              </div>
              <div className="space-y-4 mt-6">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Login
                </button>
                <p className="text-center text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(true)}
                    className="text-amber-500 hover:text-amber-400"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          )}

          <button
            onClick={() => {
              setShowLoginForm(false);
              setShowRegisterForm(false);
              setError('');
            }}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Add this component for displaying user's reports
  const UserReports = () => (
    <div className="mt-8 bg-gray-800/50 p-6 rounded-lg border border-white/10">
      <h3 className="text-xl font-semibold mb-4">My Reports</h3>
      {!Array.isArray(userReports) || userReports.length === 0 ? (
        <p className="text-gray-400">You haven't reported any items yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userReports.map((report) => (
            <div key={report._id} className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  report.type === 'lost' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {report.type.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                    title="Delete report"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-medium mt-2">{report.title}</h4>
              <p className="text-gray-400 mt-1">{report.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                Location: {report.location}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleEditReport(report)}
                  className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                  title="Edit report"
                >
                  <svg className="w-5 h-5 text-amber-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                  title="Delete report"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setShowLoginForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-amber-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-amber-600/10 blur-[150px] animate-pulse delay-700"></div>
      </div>

      {/* User Header - Add this */}
      {user && <UserHeader user={user} onLogout={handleLogout} />}

      {/* Back Button */}
      <div className="fixed top-4 left-4 z-20">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 border border-white/10 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm text-gray-400">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Lost & Found
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl opacity-50 -z-10"></div>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Report lost items or help others find their belongings using AI-powered assistance
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse Items
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'report'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Report Item
            </button>
            <button
              onClick={() => setActiveTab('my-reports')}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'my-reports'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              My Reports
            </button>
          </div>
        </div>

        {/* Add toggle for matches */}
        {activeTab === 'browse' && currentUserItem && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowMatchesOnly(!showMatchesOnly)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showMatchesOnly 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {showMatchesOnly ? 'Show All Items' : 'Show Potential Matches'}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {activeTab === 'browse' ? (
            <>
              {showHelp && (
                <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400">
                      You will see found items if you've reported something as lost, and lost items if you've reported something as found.
                    </p>
                    <button 
                      onClick={() => setShowHelp(false)}
                      className="text-gray-500 hover:text-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              {matchedItems.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Potential Matches</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchedItems.map(({ found, lost }) => (
                      <div 
                        key={`${found._id}-${lost._id}`} 
                        className="bg-green-500/10 p-6 rounded-lg border border-green-500/20"
                      >
                        <h3 className="text-green-400 font-medium mb-2">Match Found!</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-400">Found Item:</p>
                            <p className="font-medium">{found.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Lost Item:</p>
                            <p className="font-medium">{lost.title}</p>
                          </div>
                          <button
                            onClick={() => handleClaimItem(found._id)}
                            className="w-full px-4 py-2 bg-green-500/20 text-green-400 
                                     hover:bg-green-500/30 rounded-lg transition-colors"
                          >
                            Contact Owner
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ItemList 
                items={items} 
                loading={loading} 
                onItemUpdate={fetchItems}
                onClaimItem={handleClaimItem}
              />
            </>
          ) : activeTab === 'report' ? (
            <ReportItem 
              onItemSubmitted={handleItemSubmitted} 
              token={token} 
              editItem={editingItem}
            />
          ) : (
            <UserReports />
          )}
        </div>
      </div>
    </div>
  );
};

export default LostAndFound;
