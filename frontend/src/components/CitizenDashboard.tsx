import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

const WasteCategories = [
  'ORGANIC',
  'PLASTIC',
  'METAL',
  'ELECTRONIC',
  'PAPER',
  'GLASS',
  'HAZARDOUS',
];

const CitizenDashboard: React.FC = () => {
  const { account, contract } = useWeb3();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    address: '',
    wasteType: 0,
    quantity: 1,
  });

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/waste/user/${account}`
      );
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchReports();
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tx = await contract.reportWaste(
        formData.latitude,
        formData.longitude,
        formData.address,
        formData.wasteType,
        formData.quantity
      );
      await tx.wait();
      
      // Save to backend
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/waste`, {
        blockchainId: tx.hash,
        reporter: account,
        location: `${formData.latitude},${formData.longitude}`,
        wasteType: WasteCategories[formData.wasteType],
      });

      fetchReports();
      setFormData({
        latitude: '',
        longitude: '',
        address: '',
        wasteType: 0,
        quantity: 1,
      });
    } catch (error) {
      console.error('Error reporting waste:', error);
      alert('Error reporting waste. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Citizen Dashboard</h1>
      
      {/* Report Waste Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Waste</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="border rounded p-2"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="border rounded p-2 w-full"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.wasteType}
              onChange={(e) => setFormData({ ...formData, wasteType: parseInt(e.target.value) })}
              className="border rounded p-2"
            >
              {WasteCategories.map((type, index) => (
                <option key={type} value={index}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Quantity (kg)"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="border rounded p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Report Waste'}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="border rounded p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <span className="font-medium">{report.wasteType}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  report.status === 'collected'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{report.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                Reported: {new Date(report.reportedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
