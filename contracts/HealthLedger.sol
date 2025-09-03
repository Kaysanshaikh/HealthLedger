// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title HealthLedger - Simple on-chain registry mapping record IDs to IPFS CIDs with ACL
contract HealthLedger is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");

    struct Record {
        address patient;
        address createdBy;
        string cid; // IPFS CID pointing to encrypted health data
        string meta; // optional off-chain metadata hash (e.g., SHA256)
        uint256 createdAt;
    }

    // recordId => Record
    mapping(bytes32 => Record) private records;
    // recordId => (address => hasAccess)
    mapping(bytes32 => mapping(address => bool)) private access;

    event RecordCreated(bytes32 indexed recordId, address indexed patient, address indexed createdBy, string cid);
    event AccessGranted(bytes32 indexed recordId, address indexed grantee, address indexed granter);
    event AccessRevoked(bytes32 indexed recordId, address indexed grantee, address indexed revoker);
    event RecordUpdated(bytes32 indexed recordId, string newCid, string newMeta, address indexed updater);

    constructor(address admin) {
        require(admin != address(0), "admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    // ---------- Modifiers ----------
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not admin");
        _;
    }

    modifier onlyDoctorOrAdmin() {
        require(hasRole(DOCTOR_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not doctor/admin");
        _;
    }

    // ---------- Write functions ----------

    /// @notice Create a new record id => CID for a patient.
    /// @dev Anyone with DOCTOR_ROLE or ADMIN_ROLE can create. Patients may self-create by setting patient=msg.sender.
    function createRecord(bytes32 recordId, address patient, string calldata cid, string calldata meta) external onlyDoctorOrAdmin {
        require(patient != address(0), "patient required");
        require(records[recordId].createdAt == 0, "exists");
        records[recordId] = Record({
            patient: patient,
            createdBy: msg.sender,
            cid: cid,
            meta: meta,
            createdAt: block.timestamp
        });
        // by default: patient, creator, and admins have access
        access[recordId][patient] = true;
        access[recordId][msg.sender] = true;
        emit RecordCreated(recordId, patient, msg.sender, cid);
    }

    /// @notice Update CID and/or meta for a record
    /// @dev Only admins, or the patient, or creator who currently has access may update
    function updateRecord(bytes32 recordId, string calldata newCid, string calldata newMeta) external {
        Record storage r = records[recordId];
        require(r.createdAt != 0, "not found");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
            msg.sender == r.patient || access[recordId][msg.sender],
            "no permission"
        );
        r.cid = newCid;
        r.meta = newMeta;
        emit RecordUpdated(recordId, newCid, newMeta, msg.sender);
    }

    /// @notice Grant access to an address for a record. Only patient or admin can grant.
    function grantAccess(bytes32 recordId, address grantee) external {
        Record storage r = records[recordId];
        require(r.createdAt != 0, "not found");
        require(grantee != address(0), "bad grantee");
        require(msg.sender == r.patient || hasRole(ADMIN_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not owner/admin");
        access[recordId][grantee] = true;
        emit AccessGranted(recordId, grantee, msg.sender);
    }

    /// @notice Revoke access to an address for a record. Only patient or admin can revoke.
    function revokeAccess(bytes32 recordId, address grantee) external {
        Record storage r = records[recordId];
        require(r.createdAt != 0, "not found");
        require(msg.sender == r.patient || hasRole(ADMIN_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not owner/admin");
        access[recordId][grantee] = false;
        emit AccessRevoked(recordId, grantee, msg.sender);
    }

    /// @notice Assign DOCTOR role. Only admin can call.
    function addDoctor(address account) external onlyAdmin {
        _grantRole(DOCTOR_ROLE, account);
    }

    /// @notice Remove DOCTOR role. Only admin can call.
    function removeDoctor(address account) external onlyAdmin {
        _revokeRole(DOCTOR_ROLE, account);
    }

    // ---------- Read functions ----------

    function getRecord(bytes32 recordId)
        external
        view
        returns (address patient, address createdBy, string memory cid, string memory meta, uint256 createdAt)
    {
        Record storage r = records[recordId];
        require(r.createdAt != 0, "not found");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
            msg.sender == r.patient || access[recordId][msg.sender],
            "no access"
        );
        return (r.patient, r.createdBy, r.cid, r.meta, r.createdAt);
    }

    function hasAccess(bytes32 recordId, address account) external view returns (bool) {
        Record storage r = records[recordId];
        if (r.createdAt == 0) return false;
        if (account == r.patient) return true;
        if (hasRole(ADMIN_ROLE, account) || hasRole(DEFAULT_ADMIN_ROLE, account)) return true;
        return access[recordId][account];
    }
}
