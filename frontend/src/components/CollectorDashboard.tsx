import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

const CollectorDashboard: React.FC = () => {
  const { account, contract } = useWeb3();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/waste`
      );
      setReports(response.data.filter((report: any) => !report.isCollected));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchReports();
    }
  }, [account]);

  const handleCollect = async (reportId: number) => {
    setLoading(true);
    try {
      const tx = await contract.collectWaste(reportId);
      await tx.wait();

      // Update backend
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/api/waste/${reportId}`,
        {
          status: 'collected',
          collector: account,
        }
      );

      fetchReports();
    } catch (error) {
      console.error('Error collecting waste:', error);
      alert('Error collecting waste. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Collector Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Collections</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="border rounded p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{report.wasteType}</span>
                  <p className="text-sm text-gray-600 mt-2">{report.location}</p>
                  <p className="text-sm text-gray-500">
                    Reported: {new Date(report.reportedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCollect(report.blockchainId)}
                  disabled={loading}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Collect'}
                </button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No waste reports available for collection
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
