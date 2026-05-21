import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from './api';

function sortReliefByPeriod(items = []) {
  return [...items].sort((a, b) => {
    const pa = Number(a.period_relief || a.period || 999);
    const pb = Number(b.period_relief || b.period || 999);

    if (pa !== pb) return pa - pb;

    const ma = String(a.masa || "");
    const mb = String(b.masa || "");
    return ma.localeCompare(mb);
  });
}

function triggerPdfDownload(pdf) {
  const url = pdf?.download_url || pdf?.pdf_url || pdf?.view_url;
  if (!url) return;

  try {
    const a = document.createElement("a");
    a.href = url;
    // JANGAN guna target="_blank" di sini supaya browser tak block popup (kerana dipanggil dari async/Promise)
    if (pdf.file_name) {
      a.download = pdf.file_name;
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    // Fallback jika click() gagal
    window.location.assign(url);
  }
}

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showGuruForm, setShowGuruForm] = useState(false);
  const [showGpkLogin, setShowGpkLogin] = useState(false);
  const [showGpkPanel, setShowGpkPanel] = useState(false);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('getDashboardHariIni');
      if (data.success) {
        setDashboard(data);
      } else {
        setError(data.error || data.message || 'Gagal memuatkan data.');
      }
    } catch (err) {
      setError('SAMBUNGAN KE BACKEND GAGAL. SILA REFRESH ATAU HUBUNGI ADMIN.');
    }
    setLoading(false);
  };

  const fetchGuruList = async () => {
    try {
      const data = await apiGet('getSenaraiGuru');
      if (data.success) {
        setGuruList(data.data || []);
      }
    } catch (err) {
      console.error("Gagal mendapatkan senarai guru", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchGuruList();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg transition-all ${toastType === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
          <div className="font-semibold text-sm">{toastMessage}</div>
        </div>
      )}

      <header className="w-full flex flex-col items-center pt-6 pb-2 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <img src="https://i.postimg.cc/3RF9M05N/Logo-SKSA.png" alt="Logo SKSA" className="h-20 w-auto mb-3" />
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-[#0F172A] m-0 text-center px-4">SISTEM JADUAL GANTI</h1>
        <h2 className="text-sm sm:text-lg font-bold tracking-widest text-[#0F172A] opacity-80 text-center px-4">SEKOLAH KEBANGSAAN SUNGAI ABONG</h2>
      </header>

      <div className="w-full h-2 bg-[#FACC15] shrink-0"></div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 py-6 sm:py-8 px-4 sm:px-10 shrink-0">
        <button 
          onClick={() => setShowGuruForm(true)}
          className="flex-1 w-full sm:max-w-md py-4 sm:py-5 px-4 sm:px-8 bg-[#0F172A] text-white font-black text-sm sm:text-lg rounded-xl shadow-lg border-b-4 border-gray-900 flex items-center justify-center gap-2 sm:gap-3 active:transform active:translate-y-1 transition-all"
        >
          <svg className="w-5 sm:w-6 h-5 sm:h-6 text-[#FACC15] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <span className="truncate">GURU ISI KETIDAKHADIRAN</span>
        </button>
        <button 
          onClick={() => setShowGpkLogin(true)}
          className="flex-1 w-full sm:max-w-md py-4 sm:py-5 px-4 sm:px-8 bg-[#FACC15] text-[#0F172A] font-black text-sm sm:text-lg rounded-xl shadow-lg border-b-4 border-[#caab11] flex items-center justify-center gap-2 sm:gap-3 active:transform active:translate-y-1 transition-all"
        >
          <svg className="w-5 sm:w-6 h-5 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <span className="truncate">GPK PENTADBIRAN</span>
        </button>
      </div>

      <div className="w-full h-2 bg-[#FACC15] shrink-0"></div>

      <main className="flex-grow p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden max-w-[1400px] w-full mx-auto">
        {loading ? (
          <div className="col-span-1 md:col-span-12 text-center py-10 font-bold text-slate-500">
            <div className="w-8 h-8 mx-auto mb-2 border-4 border-slate-300 border-t-[#0F172A] rounded-full animate-spin"></div>
            SEDANG MEMUATKAN DATA...
          </div>
        ) : error ? (
          <div className="col-span-1 md:col-span-12 bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm">
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        ) : (
          <>
            <div className="col-span-1 md:col-span-4 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-full max-h-[600px]">
              <div className="bg-[#0F172A] p-4 rounded-t-2xl shrink-0">
                <h3 className="text-white font-black tracking-wide flex items-center gap-2 uppercase">
                  <div className="w-2 h-2 bg-[#FACC15] rounded-full"></div>
                  Keberadaan Guru
                </h3>
              </div>
              <div className="p-4 flex-grow overflow-auto">
                <div className="text-xs text-gray-500 font-bold uppercase mb-4 tracking-tighter">
                  TARIKH: {dashboard?.tarikh_papar || dashboard?.tarikh || '-'} • HARI: {dashboard?.hari || '-'}
                </div>
                {dashboard?.keberadaan?.length > 0 ? (
                  <ul className="space-y-3">
                    {dashboard.keberadaan.map((g, i) => (
                      <li key={i} className="flex justify-between items-center p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <span className="font-bold text-sm text-gray-800">{i + 1}. {g.nama_guru}</span>
                        <span className="text-[10px] font-black bg-red-500 text-white px-2 py-1 rounded uppercase text-center max-w-[80px] break-words">{g.sebab || g.jenis}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 font-medium italic uppercase text-sm">TIADA MAKLUMAT GURU TIDAK HADIR HARI INI</p>
                )}
              </div>
            </div>

            <div className="col-span-1 md:col-span-8 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-full md:max-h-[600px]">
              <div className="bg-[#0F172A] p-4 rounded-t-2xl flex flex-col sm:flex-row sm:justify-between items-start sm:items-center shrink-0 gap-3">
                <h3 className="text-white font-black tracking-wide flex items-center gap-2 uppercase text-sm sm:text-base">
                  <div className="w-2 h-2 bg-[#FACC15] rounded-full"></div>
                  Jadual Relief Hari Ini
                </h3>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <button 
                    onClick={fetchDashboard}
                    className="whitespace-nowrap shrink-0 text-[10px] sm:text-xs bg-[#FACC15] text-[#0F172A] font-black px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 uppercase hover:bg-[#caab11] transition-colors"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>
              <div className="p-0 flex-grow overflow-auto relative">
                {dashboard?.relief?.length > 0 ? (
                  <>
                    <div className="hidden md:block">
                      <table className="w-full text-left border-collapse whitespace-nowrap sm:whitespace-normal">
                        <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                          <tr>
                            <th className="p-2 sm:p-3 text-[10px] font-black text-[#0F172A] uppercase">Masa</th>
                            <th className="p-2 sm:p-3 text-[10px] font-black text-[#0F172A] uppercase">P</th>
                            <th className="p-2 sm:p-3 text-[10px] font-black text-[#0F172A] uppercase">Guru Tidak Hadir</th>
                            <th className="p-2 sm:p-3 text-[10px] font-black text-[#0F172A] uppercase">Kelas</th>
                            <th className="p-2 sm:p-3 text-[10px] font-black text-[#0F172A] uppercase">Subjek</th>
                            <th className="p-2 sm:p-3 text-[10px] font-black text-[#0F172A] uppercase">Guru Ganti</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sortReliefByPeriod(dashboard.relief).map((r, i) => (
                            <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                              <td className="p-2 sm:p-3 text-xs lg:text-xs font-medium text-slate-700">{r.masa}</td>
                              <td className="p-2 sm:p-3 text-xs lg:text-xs text-slate-600">{r.period_relief}</td>
                              <td className="p-2 sm:p-3 text-xs lg:text-xs font-bold text-red-600 uppercase pr-4">{r.guru_tidak_hadir}</td>
                              <td className="p-2 sm:p-3 text-xs lg:text-xs font-medium text-slate-800">{r.kelas}</td>
                              <td className="p-2 sm:p-3 text-xs lg:text-xs font-medium text-slate-600">{r.subjek}</td>
                              <td className="p-2 sm:p-3 text-xs lg:text-xs font-bold text-blue-800 uppercase italic pr-4">{r.guru_ganti}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="md:hidden flex flex-col gap-3 p-3 mt-2">
                      {sortReliefByPeriod(dashboard.relief).map((r, i) => (
                        <div key={i} className="bg-white border text-sm border-gray-200 rounded-lg shadow-sm p-3">
                          <div className="flex justify-between items-center bg-gray-50 -mx-3 -mt-3 p-2 px-3 border-b border-gray-100 rounded-t-lg mb-3">
                            <span className="font-bold text-xs text-gray-700">{r.masa}</span>
                            <span className="bg-[#0F172A] text-white text-[10px] font-black px-2 py-0.5 rounded">P{r.period_relief}</span>
                          </div>
                          <div className="mb-2">
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Guru Tidak Hadir</div>
                            <div className="font-bold text-red-600 uppercase text-xs">{r.guru_tidak_hadir}</div>
                          </div>
                          <div className="mb-2">
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Kelas / Subjek</div>
                            <div className="font-bold text-gray-800 text-xs">{r.kelas} <span className="font-normal mx-1">/</span> {r.subjek}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Guru Ganti</div>
                            <div className="font-bold text-blue-800 uppercase italic text-xs">{r.guru_ganti}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-500 font-medium italic uppercase text-sm mt-10">
                    BELUM ADA JADUAL RELIEF DIJANA UNTUK HARI INI
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 text-[9px] sm:text-[10px] text-blue-700 font-bold border-t border-blue-100 italic rounded-b-2xl shrink-0">
                * JADUAL INI ADALAH MUKTAMAD SETAKAT JAM 07:45 AM HARI INI.
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="p-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-auto shrink-0">
        Hak Cipta Terpelihara &copy; {new Date().getFullYear()} SK Sungai Abong • Sistem Digitalisasi Pendidikan
      </footer>

      {showGuruForm && (
        <GuruFormModal 
          onClose={() => setShowGuruForm(false)} 
          guruList={guruList} 
          onSuccess={(res) => {
            setShowGuruForm(false);
            fetchDashboard();
            if (res && res.jumlah_hari > 1) {
              showToast(`MAKLUMAT BERJAYA DIHANTAR UNTUK ${res.jumlah_hari} HARI PERSEKOLAHAN`);
            } else {
              showToast('MAKLUMAT BERJAYA DIHANTAR');
            }
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {showGpkLogin && (
        <GpkLoginModal 
          onClose={() => setShowGpkLogin(false)} 
          onSuccess={() => {
            setShowGpkLogin(false);
            setShowGpkPanel(true);
          }}
        />
      )}

      {showGpkPanel && (
        <GpkPanel 
          onClose={() => setShowGpkPanel(false)}
          guruList={guruList}
          setGuruList={setGuruList}
          showToast={showToast}
          onSuccess={() => {
            setShowGpkPanel(false);
            fetchDashboard();
            showToast('JADUAL RELIEF BERJAYA DIJANA');
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  );
}

function GuruFormModal({ onClose, guruList, onSuccess, onError }) {

  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    nama_guru: '',
    jenis_tarikh: 'SATU_HARI',
    tarikh: today,
    tarikh_mula: today,
    tarikh_akhir: today,
    jenis: '',
    sebab: '',
    masa_keluar: '',
    masa_balik: '',
    waktu_diganti: 'SEMUA',
    periods: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jenisOptions = [
    'MC', 'CRK', 'TAKLIMAT', 'MESYUARAT', 'BENGKEL', 'KURSUS', 'URUSAN KELUARGA', 'MENGURUS PASUKAN SEKOLAH', 'TUGASAN LUAR (PENGADIL/JU/TEKNIKAL/YANG BERKAITAN)', 'LAIN-LAIN'
  ];

  const jamOptions = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
  const minitOptions = ['00', '30'];

  const periodLabels = {
    1: '7:30 - 8:00',
    2: '8:00 - 8:30',
    3: '8:30 - 9:00',
    4: '9:00 - 9:30',
    5: '9:30 - 10:00',
    6: '9:50 - 10:20',
    7: '10:20 - 10:50',
    8: '10:50 - 11:20',
    9: '11:20 - 11:50',
    10: '11:50 - 12:20',
    11: '12:20 - 12:50',
    12: '12:50 - 1:20'
  };

  const [timeState, setTimeState] = useState({
    keluarJam: '07', keluarMin: '00',
    balikJam: '07', balikMin: '00'
  });

  useEffect(() => {
    if (formData.jenis === 'MC' || formData.jenis === 'CRK') {
      setFormData(prev => ({
        ...prev,
        masa_keluar: 'SEPANJANG HARI',
        masa_balik: 'SEPANJANG HARI',
        waktu_diganti: 'SEMUA'
      }));
    } else {
      if (formData.masa_keluar === 'SEPANJANG HARI') {
        setFormData(prev => ({
          ...prev,
          masa_keluar: `${timeState.keluarJam}:${timeState.keluarMin}`,
          masa_balik: `${timeState.balikJam}:${timeState.balikMin}`,
          waktu_diganti: 'SEMUA'
        }));
      }
    }
  }, [formData.jenis]);

  useEffect(() => {
    if (formData.jenis !== 'MC' && formData.jenis !== 'CRK') {
      setFormData(prev => ({
        ...prev,
        masa_keluar: `${timeState.keluarJam}:${timeState.keluarMin}`,
        masa_balik: `${timeState.balikJam}:${timeState.balikMin}`
      }));
    }
  }, [timeState, formData.jenis]);

  const handleCheckboxChange = (period) => {
    setFormData(prev => {
      const isSelected = prev.periods.includes(period);
      if (isSelected) {
        return { ...prev, periods: prev.periods.filter(p => p !== period) };
      } else {
        return { ...prev, periods: [...prev.periods, period].sort((a,b) => a-b) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSpecialType = formData.jenis === 'MC' || formData.jenis === 'CRK';
    const isMultiDay = formData.jenis_tarikh === 'BEBERAPA_HARI';
    
    if (!formData.nama_guru || !formData.jenis) {
      alert("Sila lengkapkan maklumat wajib.");
      return;
    }

    if (isMultiDay) {
      if (!formData.tarikh_mula || !formData.tarikh_akhir) {
        alert("Sila pilih tarikh mula dan tarikh akhir.");
        return;
      }
      if (formData.tarikh_akhir < formData.tarikh_mula) {
        alert("TARIKH AKHIR TIDAK BOLEH LEBIH AWAL DARIPADA TARIKH MULA");
        return;
      }
    } else {
      if (!formData.tarikh) {
        alert("Sila pilih tarikh.");
        return;
      }
    }
    
    if (!isSpecialType && !formData.sebab) {
      alert("Sila isi sebab/catatan.");
      return;
    }
    
    let waktuDigantiToSubmit = formData.waktu_diganti;
    if (waktuDigantiToSubmit === 'PILIH PERIOD') {
      if (formData.periods.length === 0) {
        alert("Sila pilih sekurang-kurangnya 1 period.");
        return;
      }
      waktuDigantiToSubmit = formData.periods.join(',');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nama_guru: formData.nama_guru,
        jenis_tarikh: formData.jenis_tarikh,
        jenis: formData.jenis,
        sebab: formData.sebab,
        masa_keluar: formData.masa_keluar,
        masa_balik: formData.masa_balik,
        waktu_diganti: waktuDigantiToSubmit
      };

      if (isMultiDay) {
        payload.tarikh_mula = formData.tarikh_mula;
        payload.tarikh_akhir = formData.tarikh_akhir;
      } else {
        payload.tarikh = formData.tarikh;
      }

      const res = await apiPost('submitKetidakhadiran', payload);
      if (res.success) {
        onSuccess(res);
      } else {
        onError(res.error || res.message || 'Gagal menghantar borang.');
      }
    } catch (err) {
      onError('Ralat semasa menghantar borang.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="bg-white rounded shadow-xl w-full max-w-lg mt-10 p-6 mb-10 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-2 mb-4 uppercase">MAKLUMAN KETIDAKHADIRAN GURU</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Nama Guru *</label>
            <select 
              required
              className="w-full p-2 border border-slate-300 rounded focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none uppercase font-medium bg-slate-50"
              value={formData.nama_guru} 
              onChange={e => setFormData({...formData, nama_guru: e.target.value})}
            >
              <option value="">-- PILIH GURU --</option>
              {guruList.map(g => (
                <option key={g.nama_guru} value={g.nama_guru}>{g.nama_guru}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Jenis Tarikh *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="jenis_tarikh" 
                  value="SATU_HARI" 
                  checked={formData.jenis_tarikh === 'SATU_HARI'}
                  onChange={() => setFormData({...formData, jenis_tarikh: 'SATU_HARI'})}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-500"
                />
                <span className="font-bold text-slate-800 uppercase text-sm">SATU HARI</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="jenis_tarikh" 
                  value="BEBERAPA_HARI" 
                  checked={formData.jenis_tarikh === 'BEBERAPA_HARI'}
                  onChange={() => setFormData({...formData, jenis_tarikh: 'BEBERAPA_HARI'})}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-500"
                />
                <span className="font-bold text-slate-800 uppercase text-sm">BEBERAPA HARI</span>
              </label>
            </div>
          </div>

          {formData.jenis_tarikh === 'SATU_HARI' ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Tarikh *</label>
              <input 
                required type="date" 
                className="w-full p-2 border border-slate-300 rounded focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none font-medium bg-slate-50"
                value={formData.tarikh}
                onChange={e => setFormData({...formData, tarikh: e.target.value})}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Tarikh Mula *</label>
                  <input 
                    required type="date" 
                    className="w-full p-2 border border-slate-300 rounded focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none font-medium bg-slate-50"
                    value={formData.tarikh_mula}
                    onChange={e => setFormData({...formData, tarikh_mula: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Tarikh Akhir *</label>
                  <input 
                    required type="date" 
                    className="w-full p-2 border border-slate-300 rounded focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none font-medium bg-slate-50"
                    value={formData.tarikh_akhir}
                    onChange={e => setFormData({...formData, tarikh_akhir: e.target.value})}
                  />
                </div>
              </div>
              <p className="text-[10px] font-bold text-blue-600 italic uppercase">Sistem akan menyimpan rekod mengikut hari persekolahan sahaja. Sabtu dan Ahad akan diabaikan secara automatik.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Jenis *</label>
            <select 
              required
              className="w-full p-2 border border-slate-300 rounded focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none uppercase font-medium bg-slate-50"
              value={formData.jenis}
              onChange={e => setFormData({...formData, jenis: e.target.value})}
            >
              <option value="">-- PILIH JENIS --</option>
              {jenisOptions.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Sebab / Catatan {(formData.jenis !== 'MC' && formData.jenis !== 'CRK') && '*'}</label>
            <textarea 
              required={formData.jenis !== 'MC' && formData.jenis !== 'CRK'}
              rows="3"
              disabled={formData.jenis === 'MC' || formData.jenis === 'CRK'}
              className="w-full p-2 border border-slate-300 rounded focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none uppercase font-medium bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder={formData.jenis === 'MC' || formData.jenis === 'CRK' ? "TIDAK WAJIB UNTUK MC/CRK" : "CONTOH: BENGKEL PKG / MESYUARAT PPD / URUSAN RASMI"}
              value={formData.sebab}
              onChange={e => setFormData({...formData, sebab: e.target.value.toUpperCase()})}
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex-1">
              <label className="block text-xs font-black text-blue-800 mb-2 uppercase tracking-tighter">Masa Keluar</label>
              {formData.jenis === 'MC' || formData.jenis === 'CRK' ? (
                <div className="p-2.5 bg-white border border-blue-200 rounded font-bold text-blue-900 text-sm">SEPANJANG HARI</div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 border border-blue-200 rounded font-bold text-blue-900 outline-none focus:border-blue-500"
                    value={timeState.keluarJam}
                    onChange={e => setTimeState(prev => ({...prev, keluarJam: e.target.value}))}
                  >
                    {jamOptions.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  <select 
                    className="flex-1 p-2 border border-blue-200 rounded font-bold text-blue-900 outline-none focus:border-blue-500"
                    value={timeState.keluarMin}
                    onChange={e => setTimeState(prev => ({...prev, keluarMin: e.target.value}))}
                  >
                    {minitOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-black text-blue-800 mb-2 uppercase tracking-tighter">Masa Balik</label>
              {formData.jenis === 'MC' || formData.jenis === 'CRK' ? (
                <div className="p-2.5 bg-white border border-blue-200 rounded font-bold text-blue-900 text-sm">SEPANJANG HARI</div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 border border-blue-200 rounded font-bold text-blue-900 outline-none focus:border-blue-500"
                    value={timeState.balikJam}
                    onChange={e => setTimeState(prev => ({...prev, balikJam: e.target.value}))}
                  >
                    {jamOptions.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  <select 
                    className="flex-1 p-2 border border-blue-200 rounded font-bold text-blue-900 outline-none focus:border-blue-500"
                    value={timeState.balikMin}
                    onChange={e => setTimeState(prev => ({...prev, balikMin: e.target.value}))}
                  >
                    {minitOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Waktu Perlu Diganti *</label>
            <div className="space-y-2 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="waktu_diganti" 
                  value="SEMUA" 
                  checked={formData.waktu_diganti === 'SEMUA'}
                  onChange={() => setFormData({...formData, waktu_diganti: 'SEMUA'})}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-500"
                />
                <span className="font-bold text-slate-800 uppercase text-sm">SEMUA (SEPENUH MASA)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="waktu_diganti" 
                  value="PILIH PERIOD" 
                  checked={formData.waktu_diganti === 'PILIH PERIOD'}
                  onChange={() => setFormData({...formData, waktu_diganti: 'PILIH PERIOD'})}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-500"
                />
                <span className="font-bold text-slate-800 uppercase text-sm">PILIH PERIOD TERTENTU</span>
              </label>
            </div>

            {formData.waktu_diganti === 'PILIH PERIOD' && (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-300">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(p => (
                  <label key={p} className={`flex flex-col items-center justify-center gap-1 cursor-pointer p-2 rounded border transition-colors ${formData.periods.includes(p) ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.periods.includes(p)}
                      onChange={() => handleCheckboxChange(p)}
                    />
                    <div className="font-black text-sm">P{p}</div>
                    <div className="text-[9px] font-bold opacity-80">{periodLabels[p]}</div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3 border-t mt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 text-white font-bold py-3 rounded uppercase hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'HANTAR MAKLUMAT'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 rounded uppercase hover:bg-slate-300"
            >
              BATAL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GpkLoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!password) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await apiPost('loginGPK', { password });
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || res.message || 'PASSWORD SALAH.');
      }
    } catch (err) {
      setErrorMsg('SAMBUNGAN KE BACKEND GAGAL.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-sm p-6 border-t-4 border-yellow-400">
        <h2 className="text-xl font-bold text-slate-900 uppercase text-center mb-6">PENGESAHAN GPK</h2>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-700 font-bold p-3 rounded mb-4 text-sm text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase text-center">MASUKKAN PASSWORD GPK PENTADBIRAN</label>
            <input 
              type="password" 
              autoFocus
              className="w-full p-3 border-2 border-slate-300 rounded text-center text-xl tracking-widest focus:border-slate-700 outline-none font-bold bg-slate-50"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-yellow-400 text-slate-900 font-bold py-3 rounded uppercase hover:bg-yellow-500 shadow disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'MASUK'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 rounded uppercase hover:bg-slate-300 shadow"
            >
              BATAL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function JadualAnjalPanel({ selectedTarikh, selectedHari, guruList, showToast, onError }) {
  const [anjalData, setAnjalData] = useState(null);
  const [anjalItems, setAnjalItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sortPeriod = (a, b) => Number(a || 0) - Number(b || 0);
  const kelasOrder = (kelas) => {
    const text = String(kelas || '').toUpperCase().replace(/\s+/g, '');
    const match = text.match(/^([1-6])([A-Z]+)/);
    const order = { S: 1, K: 2, B: 3 };
    if (!match) return { tahun: 99, susunan: 99, text };
    return { tahun: Number(match[1]), susunan: order[match[2].charAt(0)] || 50, text };
  };
  const compareKelas = (a, b) => {
    const ka = kelasOrder(a);
    const kb = kelasOrder(b);
    if (ka.tahun !== kb.tahun) return ka.tahun - kb.tahun;
    if (ka.susunan !== kb.susunan) return ka.susunan - kb.susunan;
    return ka.text.localeCompare(kb.text);
  };
  const sortedItems = [...anjalItems].sort((a, b) => {
    const pc = sortPeriod(a.period_relief, b.period_relief);
    if (pc !== 0) return pc;
    return compareKelas(a.kelas, b.kelas);
  });
  const periodList = [...new Set(sortedItems.map(i => String(i.period_relief || '')).filter(Boolean))].sort(sortPeriod);
  const kelasList = [...new Set(sortedItems.map(i => String(i.kelas || '')).filter(Boolean))].sort(compareKelas);
  const byKelasPeriod = {};
  sortedItems.forEach(item => {
    byKelasPeriod[`${item.kelas}|${item.period_relief}`] = item;
  });

  const parseCandidates = (item) => {
    const names = [];
    const add = (name) => {
      const clean = String(name || '').trim();
      if (!clean) return;
      if (!names.some(n => n.toUpperCase() === clean.toUpperCase())) names.push(clean);
    };
    add(item.guru_dipilih);
    add(item.guru_dicadang);
    String(item.cadangan_lain || '').split('|').forEach(add);
    return names;
  };

  const recalcWarnings = (items) => {
    const selectedByPeriod = {};
    items.forEach(item => {
      const guru = String(item.guru_dipilih || item.guru_dicadang || '').trim().toUpperCase();
      const p = String(item.period_relief || '');
      if (!guru || !p) return;
      if (!selectedByPeriod[p]) selectedByPeriod[p] = {};
      selectedByPeriod[p][guru] = (selectedByPeriod[p][guru] || 0) + 1;
    });

    return items.map(item => {
      const guru = String(item.guru_dipilih || item.guru_dicadang || '').trim().toUpperCase();
      const p = Number(item.period_relief || 0);
      let warning = item.warning || '';
      if (guru && selectedByPeriod[String(p)] && selectedByPeriod[String(p)][guru] > 1) {
        warning = 'AMARAN: GURU SAMA DIPILIH PADA PERIOD YANG SAMA';
      } else if (
        guru &&
        ((selectedByPeriod[String(p - 1)] && selectedByPeriod[String(p - 1)][guru]) ||
         (selectedByPeriod[String(p + 1)] && selectedByPeriod[String(p + 1)][guru]))
      ) {
        warning = 'AMARAN: GURU DIPILIH BERTURUT-TURUT';
      } else if (String(warning).startsWith('AMARAN:')) {
        warning = '';
      }
      return { ...item, warning };
    });
  };

  const loadAnjal = async () => {
    if (!selectedTarikh) return;
    setLoading(true);
    try {
      const res = await apiGet('getPaparanJadualAnjal', { tarikh: selectedTarikh });
      if (res.success) {
        setAnjalData(res);
        setAnjalItems(recalcWarnings(res.items || []));
      } else {
        setAnjalData(null);
        setAnjalItems([]);
        onError(res.error || res.message || 'Gagal memuatkan Jadual Anjal.');
      }
    } catch (err) {
      onError('Ralat semasa memuatkan Jadual Anjal.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnjal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarikh]);

  const janaJadualAnjal = async () => {
    if (!selectedTarikh) return;
    const confirmText = anjalItems.length > 0
      ? 'Jana semula Jadual Anjal? Draft lama tarikh ini akan diganti.'
      : 'Jana draft Jadual Anjal untuk tarikh ini?';
    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      const res = await apiPost('janaCadanganJadualAnjal', { tarikh: selectedTarikh, save: true });
      if (res.success) {
        setAnjalData(res);
        setAnjalItems(recalcWarnings(res.items || []));
        showToast('DRAFT JADUAL ANJAL BERJAYA DIJANA');
      } else {
        onError(res.error || res.message || 'Gagal menjana Jadual Anjal.');
      }
    } catch (err) {
      onError('Ralat semasa menjana Jadual Anjal.');
    }
    setLoading(false);
  };

  const updateGuru = (idItem, guru) => {
    const next = anjalItems.map(item => {
      if (item.id_item !== idItem) return item;
      return {
        ...item,
        guru_dipilih: guru,
        guru_dicadang: item.guru_dicadang || guru,
        mode_pilihan: guru === item.guru_dicadang ? 'AUTO ANJAL' : 'MANUAL ANJAL',
        updated_at: new Date().toISOString()
      };
    });
    setAnjalItems(recalcWarnings(next));
  };

  const simpanJadualAnjal = async () => {
    if (anjalItems.length === 0) {
      alert('Tiada Jadual Anjal untuk disimpan.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiPost('simpanJadualAnjal', {
        tarikh: selectedTarikh,
        hari: selectedHari || anjalData?.hari,
        id_anjal: anjalData?.id_anjal || anjalData?.header?.id_anjal,
        items: anjalItems
      });
      if (res.success) {
        showToast('JADUAL ANJAL BERJAYA DISIMPAN');
        await loadAnjal();
      } else {
        onError(res.error || res.message || 'Gagal menyimpan Jadual Anjal.');
      }
    } catch (err) {
      onError('Ralat semasa menyimpan Jadual Anjal.');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow border-2 border-yellow-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b pb-4 mb-4">
        <div>
          <h3 className="font-black text-slate-900 uppercase text-xl">JADUAL ANJAL</h3>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">
            Untuk hari ramai guru tidak hadir. Cadangan tidak semak free period asal dan sistem cuba elak guru berturut-turut.
          </p>
          <div className="mt-2 text-[11px] font-black text-slate-500 uppercase">
            TARIKH: <span className="text-slate-900">{selectedTarikh}</span> • HARI: <span className="text-slate-900">{selectedHari || anjalData?.hari || '-'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={loadAnjal}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-black rounded uppercase text-xs border border-slate-300 disabled:opacity-50"
          >
            Refresh Anjal
          </button>
          <button
            onClick={janaJadualAnjal}
            disabled={loading}
            className="px-4 py-2 bg-yellow-400 text-slate-900 font-black rounded uppercase text-xs shadow hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? 'MEMPROSES...' : anjalItems.length > 0 ? 'JANA SEMULA ANJAL' : 'JANA JADUAL ANJAL'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-slate-500 font-bold uppercase">SEDANG MEMUATKAN JADUAL ANJAL...</div>
      ) : anjalItems.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded">
          <div className="font-black text-slate-600 uppercase">Belum ada draft Jadual Anjal untuk tarikh ini.</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Tekan butang Jana Jadual Anjal di atas.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase">Kelas</div>
              <div className="text-xl font-black text-slate-900">{kelasList.length}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase">Period</div>
              <div className="text-xl font-black text-slate-900">{periodList.length}</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
              <div className="text-[10px] font-black text-blue-600 uppercase">Slot</div>
              <div className="text-xl font-black text-blue-700">{anjalItems.length}</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded p-3 text-center">
              <div className="text-[10px] font-black text-red-600 uppercase">Amaran</div>
              <div className="text-xl font-black text-red-700">{anjalItems.filter(i => i.warning).length}</div>
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-[11px] border-collapse min-w-max">
              <thead className="bg-[#0F172A] text-white uppercase">
                <tr>
                  <th className="p-2 border border-slate-700 sticky left-0 bg-[#0F172A] z-20">Kelas</th>
                  {periodList.map(p => (
                    <th key={p} className="p-2 border border-slate-700 min-w-[210px]">P{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kelasList.map(kelas => (
                  <tr key={kelas} className="align-top">
                    <td className="p-2 border border-slate-300 font-black text-center sticky left-0 bg-slate-100 z-10">{kelas}</td>
                    {periodList.map(p => {
                      const item = byKelasPeriod[`${kelas}|${p}`];
                      if (!item) return <td key={p} className="p-2 border border-slate-200 bg-slate-50 text-slate-300 text-center">-</td>;
                      const candidates = parseCandidates(item);
                      return (
                        <td key={p} className={`p-2 border border-slate-200 ${item.warning ? 'bg-red-50' : 'bg-white'}`}>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{item.masa || '-'}</div>
                          <select
                            value={item.guru_dipilih || item.guru_dicadang || ''}
                            onChange={(e) => updateGuru(item.id_item, e.target.value)}
                            className="w-full p-1.5 border border-slate-300 rounded bg-white font-black uppercase text-[10px] outline-none focus:border-slate-900"
                          >
                            <optgroup label="Cadangan Anjal">
                              {candidates.map(nama => <option key={nama} value={nama}>{nama}</option>)}
                            </optgroup>
                            <optgroup label="Semua Guru">
                              {guruList.filter(g => String(g.aktif || 'YA').toUpperCase() !== 'TIDAK').map(g => (
                                <option key={g.nama_guru} value={g.nama_guru}>{g.nama_guru}</option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mt-1 truncate" title={item.guru_asal || ''}>Asal: {item.guru_asal || '-'}</div>
                          {item.warning && <div className="mt-1 text-[9px] font-black text-red-600 uppercase">{item.warning}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden flex flex-col gap-3">
            {sortedItems.map(item => {
              const candidates = parseCandidates(item);
              return (
                <div key={item.id_item} className={`border rounded p-3 ${item.warning ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-black text-slate-900 uppercase">{item.kelas}</div>
                    <div className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">P{item.period_relief} • {item.masa}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Guru Dipilih</div>
                  <select
                    value={item.guru_dipilih || item.guru_dicadang || ''}
                    onChange={(e) => updateGuru(item.id_item, e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-black uppercase text-xs"
                  >
                    <optgroup label="Cadangan Anjal">
                      {candidates.map(nama => <option key={nama} value={nama}>{nama}</option>)}
                    </optgroup>
                    <optgroup label="Semua Guru">
                      {guruList.filter(g => String(g.aktif || 'YA').toUpperCase() !== 'TIDAK').map(g => (
                        <option key={g.nama_guru} value={g.nama_guru}>{g.nama_guru}</option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Guru Asal: {item.guru_asal || '-'}</div>
                  {item.warning && <div className="mt-2 text-[10px] font-black text-red-600 uppercase bg-white border border-red-200 rounded p-2">{item.warning}</div>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
            <button
              onClick={simpanJadualAnjal}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-[#0F172A] text-yellow-400 font-black rounded uppercase shadow hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'MENYIMPAN...' : 'SIMPAN JADUAL ANJAL'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GpkPanel({ onClose, guruList, setGuruList, showToast, onSuccess, onError }) {
  const [selectedTarikh, setSelectedTarikh] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [gpkDashboard, setGpkDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [reliefStatus, setReliefStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [reliefMode, setReliefMode] = useState('JANA_CADANGAN'); // JANA_CADANGAN, KEMASKINI_RELIEF, JANA_SEMULA_SEMUA

  const [reliefItems, setReliefItems] = useState([]);
  const [selectedHari, setSelectedHari] = useState(null);
  const [loadingJana, setLoadingJana] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pdfInfo, setPdfInfo] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showJadualAnjal, setShowJadualAnjal] = useState(false);

  const handleDownloadPdf = async () => {
    if (!selectedTarikh) return;
    setLoadingPdf(true);
    try {
      const res = await apiGet('janaPdfRelief', { tarikh: selectedTarikh });
      if (res.success) {
        setPdfInfo(res.pdf);
        if (showToast) showToast("PDF BERJAYA DIJANA DAN SEDANG DIMUAT TURUN", "success");
        triggerPdfDownload(res.pdf);
      } else {
        if (showToast) showToast(res.error || res.message || "Gagal menjana PDF", "error");
        else onError(res.error || res.message || "Gagal menjana PDF");
      }
    } catch (err) {
       if (showToast) showToast(err.message || "Gagal menjana PDF", "error");
       else onError(err.message || "Gagal menjana PDF");
    } finally {
       setLoadingPdf(false);
    }
  };

  const muatkanDataTarikh = async (tarikhToLoad = selectedTarikh) => {
    setLoadingDashboard(true);
    setReliefItems([]);
    setSelectedHari(null);
    setPdfInfo(null);
    setShowJadualAnjal(false);
    try {
      const data = await apiGet('getDashboardHariIni', { tarikh: tarikhToLoad });
      if (data.success) {
        setGpkDashboard(data);
        setSelectedTarikh(data.tarikh);
        setSelectedHari(data.hari);
        apiGet("getPdfRelief", { tarikh: data.tarikh }).then(pdfRes => {
          if (pdfRes.success && pdfRes.pdf) setPdfInfo(pdfRes.pdf);
        }).catch(() => {});
      } else {
        onError(data.error || data.message || 'Gagal memuatkan data tarikh.');
      }
    } catch (err) {
      onError('SAMBUNGAN KE BACKEND GAGAL.');
    }
    setLoadingDashboard(false);
  };

  const loadReliefStatus = async (tarikhToLoad = selectedTarikh) => {
    setLoadingStatus(true);
    try {
      const res = await apiGet('getReliefStatus', { tarikh: tarikhToLoad });
      if (res.success) {
        setReliefStatus(res.relief_status);
      } else {
        onError(res.error || res.message || 'Gagal memuatkan status relief.');
      }
    } catch (err) {
      onError('Ralat semasa mendapatkan status relief.');
    }
    setLoadingStatus(false);
  };

  useEffect(() => {
    muatkanDataTarikh(selectedTarikh);
    loadReliefStatus(selectedTarikh);
    if (!guruList || guruList.length === 0) {
      apiGet('getSenaraiGuru').then(res => {
        if (res.success && setGuruList) setGuruList(res.data || []);
      }).catch(err => console.error("Gagal dapat guruList", err));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMuatkanData = () => {
    muatkanDataTarikh(selectedTarikh);
    loadReliefStatus(selectedTarikh);
  };

  const janaCadangan = async (mode = "JANA_CADANGAN") => {
    setLoadingJana(true);
    setReliefItems([]);
    setReliefMode(mode);
    try {
      const payload = { 
        tarikh: selectedTarikh
      };

      if (mode === "KEMASKINI_RELIEF") {
        payload.mode = "KEMASKINI_RELIEF";
        payload.only_unprocessed = true;
      } else if (mode === "JANA_SEMULA_SEMUA") {
        payload.mode = "JANA_SEMULA_SEMUA";
      }

      const res = await apiPost('janaCadanganRelief', payload);
      if (res.success) {
        const items = (res.items || []).map(item => ({
          ...item,
          mode_pilihan: mode === "JANA_CADANGAN" ? 'AUTO CADANGAN' : mode,
          warning: item.warning || (item.guru_ganti === "" ? "TIADA GURU TERSEDIA" : null)
        }));
        setReliefItems(items);
        setSelectedHari(res.hari);
        if (mode === "KEMASKINI_RELIEF") showToast('CADANGAN KEMASKINI RELIEF BERJAYA DIJANA');
      } else {
        onError(res.error || res.message || 'Gagal menjana cadangan.');
      }
    } catch(err) {
      onError('Ralat semasa menjana cadangan.');
    }
    setLoadingJana(false);
  };

  const janaSemulaSemua = () => {
    if (window.confirm("JANA SEMULA SEMUA akan menggantikan jadual relief sedia ada untuk tarikh ini. Pilihan manual sebelum ini mungkin berubah. Teruskan?")) {
      janaCadangan("JANA_SEMULA_SEMUA");
    }
  };

  const handleSelectGuru = async (index, newGuru) => {
    if (!newGuru || newGuru === '') return;

    let items = [...reliefItems];
    const currentItem = items[index];

    items[index] = { ...currentItem, guru_ganti: newGuru, warning: null };
    setReliefItems(items);

    if (newGuru !== currentItem.guru_ganti) {
      try {
        const res = await apiPost('checkGuruManual', {
          tarikh: selectedTarikh,
          hari: selectedHari || gpkDashboard?.hari,
          period_relief: currentItem.period_relief,
          nama_guru: newGuru
        });

        const newItems = [...reliefItems]; 
        if (res.success && res.is_free) {
           newItems[index] = {
             ...newItems[index],
             guru_ganti: newGuru,
             mode_pilihan: 'MANUAL',
             warning: res.message || `✅ ${newGuru} TIADA KELAS PADA WAKTU INI. BOLEH DIPILIH.`,
             warningType: 'success'
           };
        } else if (res.success && !res.is_free) {
           newItems[index] = {
             ...newItems[index],
             guru_ganti: newGuru,
             mode_pilihan: 'MANUAL',
             warning: res.message || `⚠️ ${newGuru} ADA KELAS PADA WAKTU INI. TERUSKAN JUGA?`,
             warningType: 'error'
           };
        } else {
           newItems[index] = {
             ...newItems[index],
             guru_ganti: newGuru,
             mode_pilihan: 'MANUAL',
             warning: res.error || res.message || 'Gagal semak status guru.',
             warningType: 'error'
           };
        }
        setReliefItems(newItems);

      } catch(err) {
        const newItems = [...reliefItems];
        newItems[index] = { ...newItems[index], mode_pilihan: 'MANUAL', guru_ganti: newGuru };
        setReliefItems(newItems);
      }
    }
  };

  const simpanJadual = async () => {
    if (reliefItems.length === 0) {
      alert("Tiada jadual untuk disimpan.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiPost('simpanRelief', {
        tarikh: selectedTarikh,
        hari: selectedHari || gpkDashboard?.hari,
        items: reliefItems
      });
      if (res.success) {
        showToast(reliefMode === 'KEMASKINI_RELIEF' ? 'JADUAL RELIEF BERJAYA DIKEMASKINI' : 'JADUAL RELIEF BERJAYA DIJANA');
        setReliefItems([]);
        muatkanDataTarikh(selectedTarikh);
        loadReliefStatus(selectedTarikh);
      } else {
        onError(res.error || res.message || 'Gagal menyimpan jadual.');
      }
    } catch(err) {
      onError('Ralat semasa menyimpan jadual.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto flex flex-col">
      <div className="bg-slate-900 border-b-4 border-yellow-400 p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase">PANEL GPK PENTADBIRAN</h2>
          <div className="text-yellow-400 font-bold text-sm tracking-widest">{gpkDashboard?.tarikh_papar || selectedTarikh} | {gpkDashboard?.hari || '-'}</div>
        </div>
        <button 
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded font-bold uppercase border border-slate-600 shadow"
        >
          X TUTUP
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        
        <div className="bg-white p-6 rounded shadow border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">PILIH TARIKH RELIEF</label>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <input 
                type="date"
                className="w-full p-3 border border-slate-300 rounded focus:border-slate-500 outline-none font-medium bg-slate-50"
                value={selectedTarikh}
                onChange={e => {
                  setSelectedTarikh(e.target.value);
                  setShowJadualAnjal(false);
                }}
              />
            </div>
            <button 
              onClick={handleMuatkanData}
              disabled={loadingDashboard}
              className="w-full sm:w-auto px-6 py-3 bg-[#0F172A] text-white font-bold rounded shadow hover:bg-slate-800 transition uppercase disabled:opacity-50"
            >
              {loadingDashboard ? 'MEMUATKAN...' : 'MUATKAN DATA TARIKH'}
            </button>
          </div>
          <p className="text-sm font-bold text-slate-500 italic mt-3">GPK boleh memilih tarikh hari ini, esok atau tarikh akan datang untuk menyemak dan menjana relief lebih awal.</p>
        </div>

        <div className="bg-white p-6 rounded shadow border border-slate-200">
          <h3 className="font-bold text-slate-800 uppercase mb-4 text-lg border-b pb-2">STATUS RELIEF TARIKH DIPILIH</h3>
          {loadingStatus ? (
            <div className="p-4 text-center text-slate-500 font-bold">MEMUATKAN STATUS...</div>
          ) : reliefStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1">GURU X HADIR</div>
                  <div className="text-xl font-black text-slate-900">{reliefStatus.jumlah_guru_tidak_hadir}</div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-100 text-center">
                  <div className="text-[10px] text-green-600 font-black uppercase mb-1">SELESAI RELIEF</div>
                  <div className="text-xl font-black text-green-700">{reliefStatus.jumlah_selesai_relief}</div>
                </div>
                <div className={`p-4 rounded border text-center ${reliefStatus.ada_belum_diproses ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[10px] font-black uppercase mb-1 ${reliefStatus.ada_belum_diproses ? 'text-red-600' : 'text-slate-500'}`}>BELUM DIPROSES</div>
                  <div className={`text-xl font-black ${reliefStatus.ada_belum_diproses ? 'text-red-700' : 'text-slate-900'}`}>{reliefStatus.jumlah_belum_diproses}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-100 text-center">
                  <div className="text-[10px] text-blue-600 font-black uppercase mb-1">SLOT RELIEF</div>
                  <div className="text-xl font-black text-blue-700">{reliefStatus.jumlah_slot_relief}</div>
                </div>
              </div>

              {reliefStatus.ada_belum_diproses ? (
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 font-black uppercase text-sm mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    ⚠️ ADA MAKLUMAT KETIDAKHADIRAN BARU BELUM DIPROSES
                  </div>
                  <ul className="text-xs font-bold text-red-600 space-y-1 list-disc list-inside">
                    {reliefStatus.belum_diproses?.map((g, idx) => (
                      <li key={idx} className="uppercase">{g.nama_guru} ({g.jenis}) - {g.sebab || 'TIADA CATATAN'} • PERIOD: {g.waktu_diganti}</li>
                    ))}
                  </ul>
                </div>
              ) : reliefStatus.ada_relief ? (
                <div className="bg-green-50 p-3 rounded border border-green-200 text-center text-xs font-black text-green-700 uppercase">
                  ✅ SEMUA MAKLUMAT KETIDAKHADIRAN UNTUK TARIKH INI TELAH DIPROSES
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center text-xs font-bold text-slate-500 uppercase">
                  BELUM ADA JADUAL RELIEF DIJANA UNTUK TARIKH INI
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="bg-white p-6 rounded shadow border border-slate-200">
          <h3 className="font-bold text-slate-800 uppercase mb-4 text-lg border-b pb-2">SENARAI GURU TIDAK HADIR</h3>
          <div className="overflow-x-auto">
            {loadingDashboard ? (
              <div className="p-6 text-center text-slate-500 font-bold uppercase">SEDANG MEMUATKAN DATA...</div>
            ) : gpkDashboard?.keberadaan?.length > 0 ? (
              <table className="w-full text-sm text-left border-collapse min-w-max">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b-2 border-slate-300">
                  <tr>
                    <th className="px-4 py-3 border border-slate-200">Nama Guru</th>
                    <th className="px-4 py-3 border border-slate-200">Jenis</th>
                    <th className="px-4 py-3 border border-slate-200">Sebab</th>
                    <th className="px-4 py-3 text-center border border-slate-200">Keluar</th>
                    <th className="px-4 py-3 text-center border border-slate-200">Balik</th>
                    <th className="px-4 py-3 text-center border border-slate-200">Waktu Diganti</th>
                    <th className="px-4 py-3 text-center border border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-slate-800">
                  {gpkDashboard.keberadaan.map((g, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold border border-slate-200">{g.nama_guru}</td>
                      <td className="px-4 py-3 border border-slate-200">{g.jenis}</td>
                      <td className="px-4 py-3 border border-slate-200">{g.sebab}</td>
                      <td className="px-4 py-3 text-center border border-slate-200">{g.masa_keluar || '-'}</td>
                      <td className="px-4 py-3 text-center border border-slate-200">{g.masa_balik || '-'}</td>
                      <td className="px-4 py-3 text-center border border-slate-200">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold border border-slate-300">
                          {g.waktu_diganti}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border border-slate-200">
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200 text-xs">
                          DIHANTAR
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="bg-slate-50 p-6 text-center rounded border border-slate-200">
                <p className="text-slate-500 font-bold italic uppercase">TIADA MAKLUMAT GURU TIDAK HADIR UNTUK TARIKH INI</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 border-t pt-8">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => janaCadangan("KEMASKINI_RELIEF")}
                disabled={loadingJana || loadingDashboard || !reliefStatus?.ada_belum_diproses}
                className="px-8 py-4 bg-yellow-400 text-slate-900 font-extrabold rounded-lg shadow-md hover:bg-yellow-500 transition text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingJana && reliefMode === "KEMASKINI_RELIEF" ? 'MEMPROSES KEMASKINI...' : 'KEMASKINI RELIEF'}
              </button>
              {!reliefStatus?.ada_belum_diproses && reliefStatus?.ada_relief && (
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase">TIADA MAKLUMAT BARU UNTUK DIKEMASKINI</p>
              )}
              {!reliefStatus?.ada_relief && (
                 <button 
                  onClick={() => janaCadangan("JANA_CADANGAN")}
                  disabled={loadingJana || loadingDashboard || !gpkDashboard || gpkDashboard?.keberadaan?.length === 0}
                  className="px-8 py-4 bg-yellow-400 text-slate-900 font-extrabold rounded-lg shadow-md hover:bg-yellow-500 transition text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingJana && reliefMode === "JANA_CADANGAN" ? 'MEMPROSES CADANGAN...' : 'JANA CADANGAN RELIEF TERBAIK'}
                </button>
              )}
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={janaSemulaSemua}
                disabled={loadingJana || loadingDashboard || !reliefStatus?.ada_relief}
                className="px-4 py-2 border-2 border-red-500 text-red-600 font-black rounded hover:bg-red-50 transition text-sm uppercase disabled:opacity-50"
              >
                {loadingJana && reliefMode === "JANA_SEMULA_SEMUA" ? 'JANA SEMULA...' : 'JANA SEMULA SEMUA'}
              </button>
              <p className="text-[9px] font-bold text-red-400 mt-1 uppercase">* TINDAKAN BERISIKO</p>
            </div>
          </div>
        </div>


        <div className="bg-white p-4 sm:p-5 rounded shadow border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-800 uppercase text-base">MODUL JADUAL ANJAL</h3>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1">
                Buka hanya bila ramai guru tidak hadir dan GPK perlu susun jadual anjal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowJadualAnjal(prev => !prev)}
              className={`px-5 py-3 rounded font-black uppercase text-sm shadow transition ${showJadualAnjal ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-[#0F172A] text-white hover:bg-slate-800'}`}
            >
              {showJadualAnjal ? 'TUTUP JADUAL ANJAL' : 'BUKA JADUAL ANJAL'}
            </button>
          </div>
        </div>

        {showJadualAnjal && (
          <JadualAnjalPanel
            selectedTarikh={selectedTarikh}
            selectedHari={selectedHari || gpkDashboard?.hari}
            guruList={guruList}
            showToast={showToast}
            onError={onError}
          />
        )}

        <div className="bg-white p-6 rounded shadow border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 mb-2 gap-3">
            <h3 className="font-bold text-slate-800 uppercase text-lg mb-0 pb-0 border-0">JADUAL RELIEF TARIKH DIPILIH</h3>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <button 
                onClick={handleDownloadPdf}
                disabled={!gpkDashboard?.relief?.length || loadingPdf}
                className={`px-3 py-1.5 font-black text-xs uppercase rounded flex items-center gap-1 transition-colors ${!gpkDashboard?.relief?.length ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                {loadingPdf ? 'SEDANG JANA PDF...' : 'JANA / DOWNLOAD PDF'}
              </button>
              {!gpkDashboard?.relief?.length && (
                <span className="text-[10px] text-red-500 font-bold uppercase">JANA RELIEF DAHULU SEBELUM DOWNLOAD PDF</span>
              )}
              {pdfInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-500">PDF TERKINI:</span>
                  <button className="text-[10px] bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded hover:bg-slate-50 font-bold transition-colors" onClick={() => window.open(pdfInfo.view_url || pdfInfo.pdf_url, "_blank")}>BUKA PDF</button>
                  <button className="text-[10px] bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded hover:bg-slate-50 font-bold transition-colors" onClick={() => triggerPdfDownload(pdfInfo)}>DOWNLOAD PDF</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 font-semibold text-slate-600 mb-4 text-xs uppercase">
            <div>TARIKH: <span className="text-slate-900">{gpkDashboard?.tarikh_papar || '-'}</span></div>
            <div>HARI: <span className="text-slate-900">{gpkDashboard?.hari || '-'}</span></div>
          </div>
          
          <div>
            {gpkDashboard?.relief?.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse min-w-max">
                    <thead className="bg-[#0F172A] text-white uppercase font-bold border-b-2 border-slate-800">
                      <tr>
                        <th className="px-4 py-3 border border-slate-700">MASA</th>
                        <th className="px-4 py-3 border border-slate-700 text-center">PER</th>
                        <th className="px-4 py-3 border border-slate-700">GURU TIDAK HADIR</th>
                        <th className="px-4 py-3 border border-slate-700 text-center">KELAS</th>
                        <th className="px-4 py-3 border border-slate-700">SUBJEK</th>
                        <th className="px-4 py-3 border border-slate-700">GURU GANTI</th>
                        <th className="px-4 py-3 border border-slate-700 text-center">MODE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortReliefByPeriod(gpkDashboard.relief).map((r, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 border border-slate-200">{r.masa}</td>
                          <td className="px-4 py-3 border border-slate-200 text-center font-bold">{r.period_relief}</td>
                          <td className="px-4 py-3 border border-slate-200 text-red-600 font-bold">{r.guru_tidak_hadir}</td>
                          <td className="px-4 py-3 border border-slate-200 text-center font-bold">{r.kelas}</td>
                          <td className="px-4 py-3 border border-slate-200">{r.subjek}</td>
                          <td className="px-4 py-3 border border-slate-200 font-bold text-blue-800 bg-blue-50">{r.guru_ganti}</td>
                          <td className="px-4 py-3 border border-slate-200 text-center text-[10px] font-black uppercase text-slate-400">{r.mode_pilihan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden flex flex-col gap-3">
                  {sortReliefByPeriod(gpkDashboard.relief).map((r, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded shadow-sm p-3">
                      <div className="flex justify-between items-center bg-gray-50 -mx-3 -mt-3 p-2 px-3 border-b border-gray-100 rounded-t mb-3">
                        <span className="font-bold text-xs text-gray-700">{r.masa}</span>
                        <div className="flex gap-2">
                          <span className="bg-[#0F172A] text-white text-[10px] font-black px-2 py-0.5 rounded">P{r.period_relief}</span>
                          <span className="bg-slate-200 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">{r.mode_pilihan}</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Guru Tidak Hadir</div>
                        <div className="font-bold text-red-600 uppercase text-xs">{r.guru_tidak_hadir}</div>
                      </div>
                      <div className="mb-2">
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Kelas / Subjek</div>
                        <div className="font-bold text-gray-800 text-xs">{r.kelas} <span className="font-normal mx-1">/</span> {r.subjek}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Guru Ganti</div>
                        <div className="font-bold text-blue-800 uppercase italic text-xs bg-blue-50 border border-blue-100 rounded p-1 inline-block px-2">{r.guru_ganti}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-slate-500 font-medium italic uppercase text-sm border-2 border-dashed border-slate-200 rounded">
                BELUM ADA JADUAL RELIEF DIJANA UNTUK TARIKH INI
              </div>
            )}
          </div>
        </div>

        {reliefItems.length > 0 && (
          <div className="bg-white p-6 rounded shadow border border-slate-300">
            <h3 className="font-bold text-slate-800 uppercase mb-4 text-lg border-b pb-2 flex justify-between items-end">
              {reliefMode === 'KEMASKINI_RELIEF' ? 'CADANGAN KEMASKINI RELIEF' : reliefMode === 'JANA_SEMULA_SEMUA' ? 'CADANGAN JANA SEMULA SEMUA' : 'CADANGAN JADUAL RELIEF BARU'}
              <span className={`text-xs font-black px-2 py-1 rounded tracking-tighter ${reliefMode === 'KEMASKINI_RELIEF' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                {reliefMode === 'KEMASKINI_RELIEF' ? 'MODE: KEMASKINI - GURU BELUM PROSES' : 'SEDANG DIKEMASKINI'}
              </span>
            </h3>
            {reliefMode === 'KEMASKINI_RELIEF' && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-100 text-[10px] font-black text-yellow-800 uppercase rounded">
                MODE: KEMASKINI RELIEF - HANYA GURU BELUM DIPROSES
              </div>
            )}
            {reliefMode === 'JANA_SEMULA_SEMUA' && (
              <div className="mb-4 p-2 bg-red-50 border border-red-100 text-[10px] font-black text-red-800 uppercase rounded">
                MODE: JANA SEMULA SEMUA - SEMAK SEMUA CADANGAN SEBELUM SIMPAN
              </div>
            )}

            <div className="min-h-[400px]">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-max">
                  <thead className="bg-[#0F172A] text-white uppercase font-bold border-b-2 border-slate-900">
                    <tr>
                      <th className="px-4 py-3 border border-slate-700">Masa</th>
                      <th className="px-4 py-3 text-center border border-slate-700">Per</th>
                      <th className="px-4 py-3 border border-slate-700">Guru Tidak Hadir</th>
                      <th className="px-4 py-3 text-center border border-slate-700">Kelas</th>
                      <th className="px-4 py-3 border border-slate-700">Subjek</th>
                      <th className="px-4 py-3 w-80 border border-slate-700">Guru Ganti (Auto / Manual)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortReliefByPeriod(reliefItems).map((r, i) => {
                      const realIndex = reliefItems.indexOf(r);
                      return (
                      <tr key={i} className={`border-b border-slate-200 align-top transition-colors ${(!r.guru_ganti || r.guru_ganti === '' || r.warning === 'TIADA GURU TERSEDIA') ? 'bg-red-50' : 'hover:bg-yellow-50'}`}>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium border border-slate-200">{r.masa}</td>
                        <td className="px-4 py-4 text-center font-bold text-slate-900 bg-slate-50 border border-slate-200">{r.period_relief}</td>
                        <td className="px-4 py-4 font-bold text-red-600 border border-slate-200">{r.guru_tidak_hadir}</td>
                        <td className="px-4 py-4 text-center font-bold border border-slate-200">{r.kelas}</td>
                        <td className="px-4 py-4 font-medium border border-slate-200">{r.subjek}</td>
                        <td className="px-4 py-3 border border-slate-200">
                          <div className="flex flex-col gap-2">
                            <div className="relative">
                              <select 
                                className={`w-full p-2 border-2 rounded font-bold uppercase text-sm bg-white shadow-sm outline-none ${(!r.guru_ganti || r.guru_ganti === '' || r.warning === 'TIADA GURU TERSEDIA') ? 'border-red-500' : 'border-slate-300 focus:border-slate-800'}`}
                                value={r.guru_ganti}
                                onChange={(e) => handleSelectGuru(realIndex, e.target.value)}
                              >
                                <optgroup label="Cadangan AI/Sistem">
                                  {(r.candidates && r.candidates.length > 0) ? (
                                    r.candidates.map(c => (
                                      <option key={c.nama_guru} value={c.nama_guru}>
                                        {c.nama_guru} {c.nama_guru && '—'} Hari ini: {c.jumlah_mengajar_hari_ini ?? '0'} slot | Minggu: {c.jumlah_mengajar_minggu_ini ?? '0'} slot
                                      </option>
                                    ))
                                  ) : (
                                    <option value={r.guru_ganti}>{r.guru_ganti || '-- TIADA GURU TERSEDIA --'}</option>
                                  )}
                                </optgroup>
                                <optgroup label="Semua Guru (Pilihan Manual)">
                                  <option value="-- SILA PILIH GURU LAIN --" disabled>-- PILIH GURU SECARA MANUAL --</option>
                                  {guruList.filter(g => String(g.aktif || "YA").toUpperCase() !== "TIDAK").map(g => (
                                    <option key={'all'+g.nama_guru} value={g.nama_guru}>{g.nama_guru}</option>
                                  ))}
                                </optgroup>
                              </select>

                              {(!r.guru_ganti || r.guru_ganti === '' || r.warning === 'TIADA GURU TERSEDIA') && (
                                <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-red-600 uppercase animate-pulse">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                  TIADA GURU TERSEDIA - SILA PILIH MANUAL
                                </div>
                              )}
                            </div>
                            
                            {r.warning && (
                              <div className={`text-xs font-bold p-2 rounded border ${r.warningType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {r.warning}
                              </div>
                            )}
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Mode: {r.mode_pilihan}</div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-4 mt-2">
                {sortReliefByPeriod(reliefItems).map((r, i) => {
                  const realIndex = reliefItems.indexOf(r);
                  return (
                  <div key={i} className={`border rounded shadow-sm p-4 ${(!r.guru_ganti || r.guru_ganti === '' || r.warning === 'TIADA GURU TERSEDIA') ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center bg-gray-50 -mx-4 -mt-4 p-2 px-4 border-b border-gray-100 rounded-t mb-3">
                      <span className="font-bold text-xs text-gray-700">{r.masa}</span>
                      <span className="bg-[#0F172A] text-white text-[10px] font-black px-2 py-0.5 rounded">P{r.period_relief}</span>
                    </div>
                    <div className="mb-2">
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Guru Tidak Hadir</div>
                      <div className="font-bold text-red-600 uppercase text-xs">{r.guru_tidak_hadir}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Kelas / Subjek</div>
                      <div className="font-bold text-gray-800 text-xs">{r.kelas} <span className="font-normal mx-1">/</span> {r.subjek}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Guru Ganti</div>
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <select 
                            className={`w-full p-2 border-2 rounded font-bold uppercase text-xs bg-white shadow-sm outline-none ${(!r.guru_ganti || r.guru_ganti === '' || r.warning === 'TIADA GURU TERSEDIA') ? 'border-red-500' : 'border-slate-300 focus:border-slate-800'}`}
                            value={r.guru_ganti}
                            onChange={(e) => handleSelectGuru(realIndex, e.target.value)}
                          >
                            <optgroup label="Cadangan AI/Sistem">
                              {(r.candidates && r.candidates.length > 0) ? (
                                r.candidates.map(c => (
                                  <option key={c.nama_guru} value={c.nama_guru}>
                                    {c.nama_guru} {c.nama_guru && '—'} Hari ini: {c.jumlah_mengajar_hari_ini ?? '0'} slot | Minggu: {c.jumlah_mengajar_minggu_ini ?? '0'} slot
                                  </option>
                                ))
                              ) : (
                                <option value={r.guru_ganti}>{r.guru_ganti || '-- TIADA GURU TERSEDIA --'}</option>
                              )}
                            </optgroup>
                            <optgroup label="Semua Guru (Pilihan Manual)">
                              <option value="-- SILA PILIH GURU LAIN --" disabled>-- PILIH GURU SECARA MANUAL --</option>
                              {guruList.filter(g => String(g.aktif || "YA").toUpperCase() !== "TIDAK").map(g => (
                                <option key={'all'+g.nama_guru} value={g.nama_guru}>{g.nama_guru}</option>
                              ))}
                            </optgroup>
                          </select>

                          {(!r.guru_ganti || r.guru_ganti === '' || r.warning === 'TIADA GURU TERSEDIA') && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-red-600 uppercase animate-pulse">
                              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                              TIADA GURU TERSEDIA - SILA PILIH MANUAL
                            </div>
                          )}
                        </div>
                        
                        {r.warning && (
                          <div className={`text-[10px] font-bold p-2 rounded border ${r.warningType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {r.warning}
                          </div>
                        )}
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Mode: {r.mode_pilihan}</div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            <div className="mt-8 flex justify-end pt-4 border-t-2 border-slate-100 px-4">
              <button 
                onClick={simpanJadual}
                disabled={saving}
                className="w-full sm:w-auto px-10 py-4 bg-[#0F172A] text-yellow-400 font-extrabold rounded-lg shadow-lg hover:bg-slate-800 transition text-lg uppercase tracking-wide border-2 border-slate-900 disabled:opacity-50"
              >
                {saving ? 'SEDANG MENYIMPAN...' : 'SIMPAN & JANA JADUAL RELIEF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
