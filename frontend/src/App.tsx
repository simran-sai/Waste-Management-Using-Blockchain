import React, { useEffect, useState } from 'react';
import { useWeb3 } from './contexts/Web3Context';
import axios from 'axios';
import CitizenDashboard from './components/CitizenDashboard';
import CollectorDashboard from './components/CollectorDashboard';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const { account, connectWallet, isConnected } = useWeb3();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (account) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/users/${account}`
          );
          setUserRole(response.data.role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          // If user doesn't exist, create as citizen
          try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
              address: account,
              role: 'citizen',
            });
            setUserRole('citizen');
          } catch (createError) {
            console.error('Error creating user:', createError);
          }
        }
      }
    };

    if (account) {
      fetchUserRole();
    }
  }, [account]);

  const renderDashboard = () => {
    if (!isConnected) {
      return (
        <div className="text-center">
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Connect MetaMask
          </button>
        </div>
      );
    }

    if (!userRole) {
      return <div>Loading...</div>;
    }

    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'collector':
        return <CollectorDashboard />;
      default:
        return <CitizenDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Waste Management System</h1>
            </div>
            <div className="flex items-center">
              {isConnected && (
                <div className="text-sm text-gray-500">
                  Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
};

export default App;
