// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthSystem {
    struct MedicalRecord {
        address doctor;
        string diagnosis;
        string treatment;
        uint256 timestamp;
    }

    struct Patient {
        string name;
        bool isRegistered;
        MedicalRecord[] records;
    }

    struct Doctor {
        string name;
        string specialization;
        bool isRegistered;
    }

    address public admin;
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    // patient => doctor => hasAccess
    mapping(address => mapping(address => bool)) public accessList;
    // medicineId => isAuthentic
    mapping(string => bool) public verifiedMedicines;

    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event RecordAdded(address indexed patient, address indexed doctor, uint256 timestamp);
    event AccessLog(address indexed accessedBy, address indexed patient, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyRegisteredDoctor() {
        require(doctors[msg.sender].isRegistered, "Only registered doctors can call this");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Role Registration
    function registerPatient(string memory _name) public {
        patients[msg.sender].name = _name;
        patients[msg.sender].isRegistered = true;
    }

    function registerDoctor(string memory _name, string memory _specialization) public {
        doctors[msg.sender].name = _name;
        doctors[msg.sender].specialization = _specialization;
        doctors[msg.sender].isRegistered = true;
    }

    // Access Control
    function grantAccess(address _doctor) public {
        accessList[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    function revokeAccess(address _doctor) public {
        accessList[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    // Medical Records
    function addMedicalRecord(address _patient, string memory _diagnosis, string memory _treatment) public onlyRegisteredDoctor {
        require(accessList[_patient][msg.sender], "No access to this patient's records");
        
        patients[_patient].records.push(MedicalRecord({
            doctor: msg.sender,
            diagnosis: _diagnosis,
            treatment: _treatment,
            timestamp: block.timestamp
        }));

        emit RecordAdded(_patient, msg.sender, block.timestamp);
    }

    function getPatientRecords(address _patient) public returns (MedicalRecord[] memory) {
        require(msg.sender == _patient || accessList[_patient][msg.sender], "Access denied");
        
        if (msg.sender != _patient) {
            emit AccessLog(msg.sender, _patient, block.timestamp);
        }
        
        return patients[_patient].records;
    }

    // Medicine Authenticity
    function addVerifiedMedicine(string memory _medicineId) public onlyAdmin {
        verifiedMedicines[_medicineId] = true;
    }

    function checkMedicine(string memory _medicineId) public view returns (bool) {
        return verifiedMedicines[_medicineId];
    }
}
