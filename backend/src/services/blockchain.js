const { ethers } = require('ethers');
const WasteManagementABI = require('../contracts/WasteManagement.json');

class BlockchainService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
        this.contract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            WasteManagementABI.abi,
            this.provider
        );
    }

    async getWasteReport(reportId) {
        try {
            const report = await this.contract.getWasteReport(reportId);
            return report;
        } catch (error) {
            console.error('Blockchain Error:', error);
            throw error;
        }
    }

    async getUserReports(userAddress) {
        try {
            const reports = await this.contract.getUserReports(userAddress);
            return reports;
        } catch (error) {
            console.error('Blockchain Error:', error);
            throw error;
        }
    }

    async getUserPoints(userAddress) {
        try {
            const points = await this.contract.getUserPoints(userAddress);
            return points;
        } catch (error) {
            console.error('Blockchain Error:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainService();
