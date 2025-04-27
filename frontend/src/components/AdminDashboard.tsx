import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const { account, contract } = useWeb3();
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCollectorAddress, setNewCollectorAddress] = useState('');

  const fetchData = async () => {
    try {
      const [usersResponse, reportsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/waste`),
      ]);
      setUsers(usersResponse.data);
      setReports(reportsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchData();
    }
  }, [account]);

  const handleAddCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contract.grantCollectorRole(newCollectorAddress);
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
        address: newCollectorAddress,
        role: 'collector',
      });
      setNewCollectorAddress('');
      fetchData();
    } catch (error) {
      console.error('Error adding collector:', error);
      alert('Error adding collector. Please try again.');
    }
    setLoading(false);
  };

  const getStatistics = () => {
    const totalReports = reports.length;
    const collectedReports = reports.filter((r) => r.status === 'collected').length;
    const totalUsers = users.length;
    const collectors = users.filter((u) => u.role === 'collector').length;

    return { totalReports, collectedReports, totalUsers, collectors };
  };

  const stats = getStatistics();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">Total Reports</h3>
          <p className="text-2xl font-bold">{stats.totalReports}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">Collected</h3>
          <p className="text-2xl font-bold">{stats.collectedReports}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">Collectors</h3>
          <p className="text-2xl font-bold">{stats.collectors}</p>
        </div>
      </div>

      {/* Add Collector Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Collector</h2>
        <form onSubmit={handleAddCollector} className="flex gap-4">
          <input
            type="text"
            placeholder="Collector Address"
            value={newCollectorAddress}
            onChange={(e) => setNewCollectorAddress(e.target.value)}
            className="border rounded p-2 flex-grow"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Collector'}
          </button>
        </form>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.blockchainId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.reporter.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.wasteType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.status === 'collected'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
