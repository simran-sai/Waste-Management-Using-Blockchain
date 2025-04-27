// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract WasteManagement is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");

    enum WasteCategory { ORGANIC, PLASTIC, METAL, ELECTRONIC, PAPER, GLASS, HAZARDOUS }

    struct Location {
        string latitude;
        string longitude;
        string address;
    }

    struct WasteReport {
        uint256 id;
        address reporter;
        Location location;
        WasteCategory wasteType;
        uint256 quantity; // in kilograms
        uint256 timestamp;
        bool isCollected;
        address collector;
        uint256 collectionTimestamp;
        bool isVerified;
        uint256 rewardPoints;
    }

    uint256 private _reportCounter;
    mapping(uint256 => WasteReport) public wasteReports;
    mapping(address => uint256[]) public userReports;
    mapping(address => uint256) public userRewardPoints;

    event WasteReported(
        uint256 indexed id,
        address indexed reporter,
        string location,
        string wasteType,
        uint256 timestamp
    );

    event WasteCollected(
        uint256 indexed id,
        address indexed collector,
        uint256 timestamp
    );

    event RewardPointsAwarded(address indexed user, uint256 points);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function reportWaste(
        string memory latitude,
        string memory longitude,
        string memory locationAddress,
        WasteCategory wasteType,
        uint256 quantity
    ) external nonReentrant returns (uint256) {
        require(bytes(latitude).length > 0 && bytes(longitude).length > 0, "Location required");
        require(quantity > 0, "Quantity must be greater than 0");
        require(uint256(wasteType) <= uint256(WasteCategory.HAZARDOUS), "Invalid waste type");

        uint256 reportId = _reportCounter++;
        WasteReport storage report = wasteReports[reportId];
        report.id = reportId;
        report.reporter = msg.sender;
        report.location = Location(latitude, longitude, locationAddress);
        report.wasteType = wasteType;
        report.quantity = quantity;
        report.timestamp = block.timestamp;
        report.isCollected = false;
        report.isVerified = false;
        
        // Calculate initial reward points based on waste type and quantity
        uint256 basePoints = quantity * 10; // 10 points per kg
        if (wasteType == WasteCategory.HAZARDOUS) {
            basePoints *= 3; // Triple points for hazardous waste
        } else if (wasteType == WasteCategory.ELECTRONIC) {
            basePoints *= 2; // Double points for e-waste
        }
        report.rewardPoints = basePoints;

        userReports[msg.sender].push(reportId);

        emit WasteReported(
            reportId,
            msg.sender,
            location,
            wasteType,
            block.timestamp
        );

        // Award points for reporting
        _awardPoints(msg.sender, 1);

        return reportId;
    }

    function collectWaste(uint256 reportId) external nonReentrant {
        require(
            hasRole(COLLECTOR_ROLE, msg.sender),
            "Must have collector role"
        );
        WasteReport storage report = wasteReports[reportId];
        require(!report.isCollected, "Waste already collected");

        report.isCollected = true;
        report.collector = msg.sender;
        report.collectionTimestamp = block.timestamp;

        emit WasteCollected(reportId, msg.sender, block.timestamp);

        // Award points to collector
        _awardPoints(msg.sender, 2);
    }

    function _awardPoints(address user, uint256 points) private {
        userRewardPoints[user] += points;
        emit RewardPointsAwarded(user, points);
    }

    function getUserReports(address user) external view returns (uint256[] memory) {
        return userReports[user];
    }

    function getWasteReport(uint256 reportId) external view returns (WasteReport memory) {
        return wasteReports[reportId];
    }

    function getUserPoints(address user) external view returns (uint256) {
        return userRewardPoints[user];
    }

    function grantCollectorRole(address collector) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        grantRole(COLLECTOR_ROLE, collector);
    }

    function revokeCollectorRole(address collector) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        revokeRole(COLLECTOR_ROLE, collector);
    }
}
