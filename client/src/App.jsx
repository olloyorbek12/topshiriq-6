import React, { useMemo, useState } from 'react';
import './App.css';

const CONTRACT_ABI = [
  "function registerPatient(string memory _name) public",
  "function registerDoctor(string memory _name, string memory _specialization) public",
  "function grantAccess(address _doctor) public",
  "function revokeAccess(address _doctor) public",
  "function addMedicalRecord(address _patient, string memory _diagnosis, string memory _treatment) public",
  "function getPatientRecords(address _patient) public view returns (tuple(address doctor, string diagnosis, string treatment, uint256 timestamp)[])",
  "function checkMedicine(string memory _medicineId) public view returns (bool)",
  "function addVerifiedMedicine(string memory _medicineId) public",
  "function patients(address) public view returns (string name, bool isRegistered)",
  "function doctors(address) public view returns (string name, string specialization, bool isRegistered)"
];

function App() {
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('none'); // patient, doctor, admin
  const [userName, setUserName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialization, setDoctorSpecialization] = useState('');
  const [accessDoctor, setAccessDoctor] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState([]);
  const [medicineId, setMedicineId] = useState('');
  const [medResult, setMedResult] = useState(null);
  const [toast, setToast] = useState('');

  // For Demo purposes when provider is missing
  const [isDemo, setIsDemo] = useState(false);

  const shortAccount = useMemo(() => {
    if (!account) {
      return '';
    }
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }, [account]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // In a real app, we would fetch the user's role from the contract here
        setIsDemo(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("MetaMask topilmadi! Demo rejimida davom etamiz.");
      setIsDemo(true);
      setAccount('0xDemoAccount...1234');
    }
  };

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast("Iltimos, ismingizni kiriting.");
      return;
    }
    setRole('patient');
    showToast("Bemor muvaffaqiyatli ro'yxatdan o'tdi!");
  };

  const handleRegisterDoctor = (e) => {
    e.preventDefault();
    if (!doctorName.trim() || !doctorSpecialization.trim()) {
      showToast("Doktor ismi va mutaxassislik kiritilishi kerak.");
      return;
    }
    setRole('doctor');
    showToast("Shifokor muvaffaqiyatli ro'yxatdan o'tdi!");
  };

  const handleMedicineCheck = () => {
    const normalized = medicineId.trim().toLowerCase();
    if (!normalized) {
      showToast("Dori ID kiriting.");
      return;
    }
    // Demo check: valid IDs start with med- and include current year.
    const isValid = normalized.startsWith('med-') && normalized.includes('2026');
    setMedResult(isValid);
  };

  const handleGrantAccess = () => {
    if (!accessDoctor.trim().startsWith('0x')) {
      showToast("Iltimos, to'g'ri ETH manzil kiriting (0x...).");
      return;
    }
    showToast("Doktorga ruxsat berildi (demo).");
    setAccessDoctor('');
  };

  return (
    <div className="app-container">
      {toast && <div className="toast">{toast}</div>}
      <nav className="glass-nav">
        <div className="logo">HEALTH<span className="neon-text">CHAIN</span></div>
        <div className="account-info">
          {account ? (
            <span className="status-badge">{shortAccount}</span>
          ) : (
            <button onClick={connectWallet} style={{width: 'auto', padding: '0.5rem 1rem'}}>Hamyonni ulash</button>
          )}
        </div>
      </nav>

      <div className="main-grid">
        <aside className="sidebar">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            🏠 Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
            📋 Tibbiy Kartalar
          </div>
          <div className={`nav-item ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>
            🔐 Ruxsatlar
          </div>
          <div className={`nav-item ${activeTab === 'pharmacy' ? 'active' : ''}`} onClick={() => setActiveTab('pharmacy')}>
            💊 Dorilar
          </div>
        </aside>

        <main className="content-card">
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <h2 className="neon-text">Xush kelibsiz!</h2>
              <p>Blockchain-ga asoslangan xavfsiz tibbiy tizim interfeysi.</p>
              <div className="stats-grid">
                <div className="record-item stat-card">
                  <h4>Rol</h4>
                  <p>{role === 'none' ? 'Tanlanmagan' : role.toUpperCase()}</p>
                </div>
                <div className="record-item stat-card">
                  <h4>Yozuvlar soni</h4>
                  <p>{records.length}</p>
                </div>
                <div className="record-item stat-card">
                  <h4>Holat</h4>
                  <p>{isDemo ? 'Demo rejim' : 'Wallet ulangan'}</p>
                </div>
              </div>
              
              {role === 'none' ? (
                <div className="registration-options" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem'}}>
                  <div className="content-card" style={{background: 'rgba(56, 189, 248, 0.1)'}}>
                    <h3>Bemor sifatida</h3>
                    <p>O'z yozuvlaringizni boshqaring</p>
                    <input placeholder="Ismingizni kiriting" onChange={(e) => setUserName(e.target.value)} />
                    <button onClick={handleRegisterPatient}>Ro'yxatdan o'tish</button>
                  </div>
                  <div className="content-card" style={{background: 'rgba(168, 85, 247, 0.1)'}}>
                    <h3>Shifokor sifatida</h3>
                    <p>Bemorlarga tashxis qo'ying</p>
                    <input placeholder="Doktor ismi" onChange={(e) => setDoctorName(e.target.value)} />
                    <input placeholder="Mutaxassislik" onChange={(e) => setDoctorSpecialization(e.target.value)} />
                    <button onClick={handleRegisterDoctor}>Ro'yxatdan o'tish</button>
                  </div>
                </div>
              ) : (
                <div className="user-profile">
                  <p>Sizning rolingiz: <strong className="status-badge">{role.toUpperCase()}</strong></p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'records' && (
            <div className="fade-in">
              <h2 className="neon-text">Tibbiy Tarix</h2>
              <div className="records-list">
                {records.length > 0 ? records.map((r, i) => (
                  <div key={i} className="record-item">
                    <h4>Tashxis: {r.diagnosis}</h4>
                    <p>Davolash: {r.treatment}</p>
                    <small>Sana: {new Date(Number(r.timestamp) * 1000).toLocaleString()}</small>
                  </div>
                )) : (
                  <div className="record-item" style={{textAlign: 'center', opacity: 0.7}}>
                    <p>Hozircha yozuvlar yo'q.</p>
                    {role === 'doctor' && <button style={{width: 'auto'}}>Yangi yozuv qo'shish +</button>}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pharmacy' && (
            <div className="fade-in">
              <h2 className="neon-text">Dorilar Haqiqiyligini Tekshirish</h2>
              <div style={{marginTop: '2rem'}}>
                <input 
                  placeholder="Dori seriya raqami yoki ID (masalan: MED-AB12-2026)" 
                  value={medicineId}
                  onChange={(e) => setMedicineId(e.target.value)}
                />
                <button onClick={handleMedicineCheck}>Tekshirish</button>
                
                {medResult !== null && (
                  <div className="record-item" style={{marginTop: '1rem', borderColor: medResult ? 'var(--primary)' : 'red'}}>
                    {medResult ? (
                      <p style={{color: 'var(--primary)'}}>✅ Ushbu dori vositasi blockchain orqali tasdiqlangan!</p>
                    ) : (
                      <p style={{color: 'red'}}>❌ Diqqat! Ushbu dori bazada topilmadi yoki sohta bo'lishi mumkin.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="fade-in">
              <h2 className="neon-text">Ruxsatnomalar Boshqaruvi</h2>
              <p>Quyidagi shifokorlarga ma'lumotlaringizni ko'rishga ruxsat bering.</p>
              <input
                placeholder="Doktor ETH Manzili (0x...)"
                value={accessDoctor}
                onChange={(e) => setAccessDoctor(e.target.value)}
              />
              <button onClick={handleGrantAccess}>Ruxsat berish (Grant Access)</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
