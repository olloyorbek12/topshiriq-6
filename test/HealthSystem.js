import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("HealthSystem", function () {
  let HealthSystem, healthSystem, owner, patient, doctor, otherAccount;

  beforeEach(async function () {
    [owner, patient, doctor, otherAccount] = await ethers.getSigners();
    HealthSystem = await ethers.getContractFactory("HealthSystem");
    healthSystem = await HealthSystem.deploy();
  });

  it("Should register a patient", async function () {
    await healthSystem.connect(patient).registerPatient("John Doe");
    const p = await healthSystem.patients(patient.address);
    expect(p.name).to.equal("John Doe");
    expect(p.isRegistered).to.be.true;
  });

  it("Should register a doctor", async function () {
    await healthSystem.connect(doctor).registerDoctor("Dr. Smith", "Cardiology");
    const d = await healthSystem.doctors(doctor.address);
    expect(d.name).to.equal("Dr. Smith");
    expect(d.specialization).to.equal("Cardiology");
  });

  it("Should grant and revoke access", async function () {
    await healthSystem.connect(patient).grantAccess(doctor.address);
    expect(await healthSystem.accessList(patient.address, doctor.address)).to.be.true;

    await healthSystem.connect(patient).revokeAccess(doctor.address);
    expect(await healthSystem.accessList(patient.address, doctor.address)).to.be.false;
  });

  it("Should allow authorized doctor to add record", async function () {
    await healthSystem.connect(patient).registerPatient("John");
    await healthSystem.connect(doctor).registerDoctor("Dr. Smith", "Cardiology");
    await healthSystem.connect(patient).grantAccess(doctor.address);

    await healthSystem.connect(doctor).addMedicalRecord(patient.address, "Flu", "Paracetamol");
    
    const records = await healthSystem.getPatientRecords(patient.address);
    expect(records.length).to.equal(1);
    expect(records[0].diagnosis).to.equal("Flu");
  });

  it("Should verify medicine authenticity", async function () {
    await healthSystem.addVerifiedMedicine("MED-123");
    expect(await healthSystem.checkMedicine("MED-123")).to.be.true;
    expect(await healthSystem.checkMedicine("MED-999")).to.be.false;
  });
});
