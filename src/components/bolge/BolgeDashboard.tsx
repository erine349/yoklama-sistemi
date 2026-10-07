import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Shield,
  Plus,
  ArrowRight,
  School,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Send,
  Search,
  Filter,
  BarChart3,
  FileText,
  Clock,
  Sparkles,
  Check,
  ArrowUpRight,
  ChevronRight,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Principal, School as SchoolType } from '../../types';

interface Props {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export const BolgeDashboard: React.FC<Props> = ({ activeTab = 'dashboard', onNavigate }) => {
  const {
    schools,
    principals,
    addSchool,
    updateSchool,
    deleteSchool,
    addPrincipal,
    updatePrincipal,
    assignPrincipalToSchool,
    activityLogs,
  } = useSchool();
  const { currentUser } = useAuth();

  // Internal tab state synced with activeTab prop for instant, bulletproof switching
  const [currentTab, setCurrentTab] = useState<string>(activeTab || 'dashboard');

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  // Modals state
  const [showNewSchoolModal, setShowNewSchoolModal] = useState(false);
  const [showNewPrincipalModal, setShowNewPrincipalModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Search & Filters
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [principalSearch, setPrincipalSearch] = useState('');
  const [principalFilter, setPrincipalFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Direct Interactive Assignment State (in Atama Merkezi)
  const [wizardSchoolId, setWizardSchoolId] = useState<string>('');
  const [wizardPrincipalId, setWizardPrincipalId] = useState<string>('');

  // Success toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. New School Form State
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    code: '',
    city: 'İstanbul',
    district: '',
    address: '',
    phone: '0212 200 0000',
    email: '',
    capacity: 250,
    principal_id: '',
  });

  // 2. New Principal Form State
  const [principalForm, setPrincipalForm] = useState({
    full_name: '',
    email: '',
    phone: '0532 500 0000',
    title: 'Okul Müdürü',
    assigned_school_id: '',
  });

  // 3. Assign Modal State
  const [assignState, setAssignState] = useState({
    principal_id: '',
    school_id: '',
  });

  // Metrics
  const totalSchools = schools.length;
  const totalPrincipals = principals.length;
  const unassignedSchools = schools.filter((s) => !s.principal_name);
  const unassignedPrincipals = principals.filter((p) => !p.assigned_school_id);
  const totalCapacity = schools.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const totalEnrolled = schools.reduce((acc, s) => acc + (s.student_count || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Initialize wizard selections when available
  useEffect(() => {
    if (unassignedSchools.length > 0 && !wizardSchoolId) {
      setWizardSchoolId(unassignedSchools[0].id);
    } else if (schools.length > 0 && !wizardSchoolId) {
      setWizardSchoolId(schools[0].id);
    }
  }, [schools, unassignedSchools, wizardSchoolId]);

  useEffect(() => {
    if (unassignedPrincipals.length > 0 && !wizardPrincipalId) {
      setWizardPrincipalId(unassignedPrincipals[0].id);
    } else if (principals.length > 0 && !wizardPrincipalId) {
      setWizardPrincipalId(principals[0].id);
    }
  }, [principals, unassignedPrincipals, wizardPrincipalId]);

  // Handlers
  const handleOpenAssignModal = (schoolId?: string, principalId?: string) => {
    setAssignState({
      school_id: schoolId || (schools[0]?.id ?? ''),
      principal_id: principalId || (principals[0]?.id ?? ''),
    });
    setShowAssignModal(true);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim() || !schoolForm.code.trim()) return;

    const assignedPrn = principals.find((p) => p.id === schoolForm.principal_id);

    const created = addSchool({
      name: schoolForm.name,
      code: schoolForm.code.toUpperCase(),
      city: schoolForm.city,
      district: schoolForm.district || 'Merkez',
      address: schoolForm.address,
      phone: schoolForm.phone,
      email: schoolForm.email || `${schoolForm.code.toLowerCase()}@akademipro.k12.tr`,
      capacity: Number(schoolForm.capacity) || 250,
      principal_id: assignedPrn ? assignedPrn.profile_id : undefined,
      principal_name: assignedPrn ? assignedPrn.full_name : undefined,
      status: 'aktif',
    });

    if (assignedPrn) {
      assignPrincipalToSchool(assignedPrn.id, created.id);
    }

    setShowNewSchoolModal(false);
    setSchoolForm({
      name: '',
      code: '',
      city: 'İstanbul',
      district: '',
      address: '',
      phone: '0212 200 0000',
      email: '',
      capacity: 250,
      principal_id: '',
    });
    showToast(`"${created.name}" başarıyla sisteme eklendi.`);
  };

  const handleSavePrincipal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!principalForm.full_name.trim() || !principalForm.email.trim()) return;

    const targetSchool = schools.find((s) => s.id === principalForm.assigned_school_id);
    const newProfileId = `prof-prn-${Date.now()}`;

    const created = addPrincipal({
      profile_id: newProfileId,
      full_name: principalForm.full_name,
      email: principalForm.email,
      phone: principalForm.phone,
      title: principalForm.title || 'Okul Müdürü',
      assigned_school_id: targetSchool ? targetSchool.id : undefined,
      assigned_school_name: targetSchool ? targetSchool.name : undefined,
      hire_date: new Date().toISOString().split('T')[0],
      status: 'aktif',
    });

    setShowNewPrincipalModal(false);
    setPrincipalForm({
      full_name: '',
      email: '',
      phone: '0532 500 0000',
      title: 'Okul Müdürü',
      assigned_school_id: '',
    });
    showToast(`Müdür "${created.full_name}" sisteme kaydedildi. (Şifre: 123456)`);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignState.principal_id || !assignState.school_id) return;
    assignPrincipalToSchool(assignState.principal_id, assignState.school_id);
    setShowAssignModal(false);
    const targetPrn = principals.find((p) => p.id === assignState.principal_id);
    const targetSch = schools.find((s) => s.id === assignState.school_id);
    showToast(`"${targetPrn?.full_name}" başarıyla "${targetSch?.name}" müdürü olarak atandı.`);
  };

  const handleDirectWizardAssign = () => {
    if (!wizardSchoolId || !wizardPrincipalId) return;
    assignPrincipalToSchool(wizardPrincipalId, wizardSchoolId);
    const targetPrn = principals.find((p) => p.id === wizardPrincipalId);
    const targetSch = schools.find((s) => s.id === wizardSchoolId);
    showToast(`"${targetPrn?.full_name}" başarıyla "${targetSch?.name}" müdürü olarak atandı.`);
  };

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    if (window.confirm(`"${schoolName}" okulunu sistemden silmek istediğinize emin misiniz?`)) {
      deleteSchool(schoolId);
      showToast(`"${schoolName}" başarıyla silindi.`);
    }
  };

  // Unique cities list
  const cities = useMemo(() => {
    const set = new Set<string>();
    schools.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return ['Tümü', ...Array.from(set)];
  }, [schools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        (s.principal_name && s.principal_name.toLowerCase().includes(schoolSearch.toLowerCase())) ||
        s.district.toLowerCase().includes(schoolSearch.toLowerCase());
      const matchCity = selectedCity === 'Tümü' || s.city === selectedCity;
      return matchSearch && matchCity;
    });
  }, [schools, schoolSearch, selectedCity]);

  // Filtered principals
  const filteredPrincipals = useMemo(() => {
    return principals.filter((p) => {
      const matchSearch =
        p.full_name.toLowerCase().includes(principalSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(principalSearch.toLowerCase()) ||
        (p.assigned_school_name && p.assigned_school_name.toLowerCase().includes(principalSearch.toLowerCase()));
      if (principalFilter === 'assigned') {
        return matchSearch && Boolean(p.assigned_school_id);
      }
      if (principalFilter === 'unassigned') {
        return matchSearch && !p.assigned_school_id;
      }
      return matchSearch;
    });
  }, [principals, principalSearch, principalFilter]);

  // Chart data
  const schoolCapacityChartData = schools.map((s) => ({
    name: s.code,
    fullName: s.name,
    Kayıtlı: s.student_count || 0,
    Kapasite: s.capacity || 100,
    Öğretmen: s.teacher_count || 0,
  }));

  const cityDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    schools.forEach((s) => {
      counts[s.city] = (counts[s.city] || 0) + 1;
    });
    return Object.keys(counts).map((city) => ({
      name: city,
      value: counts[city],
    }));
  }, [schools]);

  const COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Bölge Koordinatörlüğü Yönetim Merkezi
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Yetkili: {currentUser.full_name}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Kampüsler & Okul Müdürleri Yönetim Portalı
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Bölgenizdeki tüm özel okulları yönetin, yeni kampüsler açın, okul müdürleri tanımlayın ve müdürleri okullara atayın.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNewPrincipalModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Yeni Müdür Ekle</span>
            </button>
            <button
              onClick={() => handleOpenAssignModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-amber-700" />
              <span>Müdür Ata</span>
            </button>
            <button
              onClick={() => setShowNewSchoolModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Okul / Kampüs Aç</span>
            </button>
          </div>
        </div>

        {/* In-page Tab Navigation (div:nth-of-type(2)) */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: 'Genel Bakış', icon: Building2 },
            { id: 'schools', label: 'Okullar & Kampüsler', icon: School, count: totalSchools },
            { id: 'principals', label: 'Müdür Kadrosu', icon: Users, count: totalPrincipals },
            {
              id: 'assignments',
              label: 'Atama Merkezi',
              icon: Shield,
              badge: unassignedSchools.length > 0 ? `${unassignedSchools.length} Bekliyor` : undefined,
            },
            { id: 'analytics', label: 'Bölge İstatistikleri', icon: BarChart3 },
            { id: 'audit', label: 'Denetim Günlüğü', icon: FileText, count: activityLogs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-700'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded animate-pulse ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification Banner */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GENEL BAKIŞ (EXECUTIVE DASHBOARD)                                   */}
      {/* ========================================================================= */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Bağlı Okul / Kampüs</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <School className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {totalSchools}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {cities.filter((c) => c !== 'Tümü').join(', ')}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Kayıtlı Müdür Kadrosu</span>
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {totalPrincipals}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {unassignedPrincipals.length > 0
                  ? `${unassignedPrincipals.length} müdür boşta bekliyor`
                  : 'Tüm müdürler okullara atanmış'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Müdür Bekleyen Kampüs</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums ${
                  unassignedSchools.length > 0 ? 'text-amber-700' : 'text-slate-900'
                }`}
              >
                {unassignedSchools.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {unassignedSchools.length > 0 ? (
                  <span className="text-amber-700 font-semibold">Atama yapılması gerekiyor</span>
                ) : (
                  'Tüm kampüslerin lideri var'
                )}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Öğrenci Kontenjanı</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {totalEnrolled} / {totalCapacity}
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, occupancyRate)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Doluluk Oranı: %{occupancyRate}</p>
            </div>
          </div>

          {/* Urgent Unassigned Schools Alert Card if any */}
          {unassignedSchools.length > 0 && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Atama Bekleyen {unassignedSchools.length} Kampüs Tespit Edildi
                  </h4>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    {unassignedSchools.map((s) => s.name).join(', ')} için henüz bir okul müdürü atanmamıştır.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenAssignModal(unassignedSchools[0]?.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hemen Müdür Ata</span>
              </button>
            </div>
          )}

          {/* Executive Split View: Overview of Schools and Principals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Campuses Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Bağlı Kampüsler</h3>
                    <p className="text-[11px] text-slate-500">Müdür ve kapasite durumu</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('schools')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Tümünü Yönet ({totalSchools})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {schools.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {s.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {s.city} / {s.district} · {s.student_count || 0}/{s.capacity} Kontenjan
                      </p>
                    </div>

                    <div className="text-right">
                      {s.principal_name ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          {s.principal_name}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignModal(s.id)}
                          className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        >
                          + Müdür Ata
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Principals Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Müdür Kadrosu</h3>
                    <p className="text-[11px] text-slate-500">Görev yeri ve atama durumu</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('principals')}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Tümünü Gör ({totalPrincipals})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {principals.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs">
                        {p.full_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{p.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {p.assigned_school_name ? (
                        <span className="text-[11px] font-semibold text-slate-700 block max-w-[140px] truncate">
                          {p.assigned_school_name}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignModal(undefined, p.id)}
                          className="text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg cursor-pointer"
                        >
                          Okula Ata
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity Strip */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Son Bölge İşlemleri ve Denetim Kayıtları
              </h3>
              <button
                onClick={() => handleTabChange('audit')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Tüm Günlüğü Görüntüle →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {activityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-900 mr-2">{log.action}</span>
                      <span className="text-slate-600">{log.target_entity}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{log.created_at}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OKULLAR & KAMPÜSLER                                                */}
      {/* ========================================================================= */}
      {currentTab === 'schools' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tüm Okul ve Kampüs Yönetimi</h3>
              <p className="text-xs text-slate-500">Müdür atamaları, kapasite ve kampüs iletişim detayları</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Okul adı veya kodu..."
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    İl: {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowNewSchoolModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Yeni Okul Aç
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kampüs Kodu</th>
                  <th className="py-3 px-4">Okul / Kampüs Adı</th>
                  <th className="py-3 px-4">İl / İlçe</th>
                  <th className="py-3 px-4">Atanmış Okul Müdürü</th>
                  <th className="py-3 px-4 text-center">Öğrenci / Kontenjan</th>
                  <th className="py-3 px-4 text-center">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Arama kriterlerine uygun okul veya kampüs bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">{sch.code}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{sch.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {sch.phone} · {sch.email}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-800">{sch.city}</span> / {sch.district}
                      </td>
                      <td className="py-3 px-4">
                        {sch.principal_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                              {sch.principal_name[0]}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">{sch.principal_name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">Aktif Yönetici</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Atama Bekleniyor
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        <div>
                          {sch.student_count || 0} / {sch.capacity}
                        </div>
                        <div className="w-16 mx-auto bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((sch.student_count || 0) / (sch.capacity || 1)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          Aktif
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAssignModal(sch.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {sch.principal_name ? 'Müdürü Değiştir' : 'Müdür Ata'}
                          </button>
                          <button
                            onClick={() => handleDeleteSchool(sch.id, sch.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Okulu Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MÜDÜR KADROSU                                                      */}
      {/* ========================================================================= */}
      {currentTab === 'principals' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Okul Müdürleri Kadrosu</h3>
              <p className="text-xs text-slate-500">Müdürlerin kurumsal profilleri ve sorumlu oldukları okullar</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Müdür adı veya e-posta..."
                  value={principalSearch}
                  onChange={(e) => setPrincipalSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={principalFilter}
                onChange={(e) => setPrincipalFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">Tüm Müdürler</option>
                <option value="assigned">Okula Atanmış</option>
                <option value="unassigned">Boşta (Atanmamış)</option>
              </select>

              <button
                onClick={() => setShowNewPrincipalModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Yeni Müdür Ekle
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Müdür Ad Soyad</th>
                  <th className="py-3 px-4">Unvan</th>
                  <th className="py-3 px-4">İletişim (Tel / E-posta)</th>
                  <th className="py-3 px-4">Görev Yaptığı Kampüs</th>
                  <th className="py-3 px-4">Giriş Hesabı</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrincipals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Arama kriterlerine uygun müdür kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredPrincipals.map((prn) => (
                    <tr key={prn.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs ring-1 ring-slate-200">
                            {prn.full_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{prn.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {prn.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{prn.title}</td>
                      <td className="py-3 px-4">
                        <p className="font-mono text-slate-800">{prn.phone}</p>
                        <p className="text-slate-500 text-[11px]">{prn.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        {prn.assigned_school_name ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            <School className="w-3 h-3 text-emerald-700" />
                            {prn.assigned_school_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded">
                            Henüz Okul Atanmadı
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Şifre: 123456
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAssignModal(undefined, prn.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Okula Ata
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MÜDÜR ATAMA MERKEZİ (INTERACTIVE ASSIGNMENT MATRIX)                */}
      {/* ========================================================================= */}
      {currentTab === 'assignments' && (
        <div className="space-y-6">
          {/* Interactive 3-Step Direct Assignment Wizard */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Hızlı Eşleştirme & Atama Sihirbazı
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
                Okul ve Müdür Eşleştirme Konsolu
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aşağıdaki iki listeden bir okul ve atanacak müdürü seçip tek tıkla resmi atamayı tamamlayabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Step 1: Okul Seçimi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  1. Adım: Hedef Okul / Kampüsü Seçin
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {schools.map((s) => {
                    const isSelected = wizardSchoolId === s.id;
                    const isUnassigned = !s.principal_name;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setWizardSchoolId(s.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                            : isUnassigned
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">[{s.code}]</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {s.city} / {s.district} · {s.student_count || 0}/{s.capacity} Kontenjan
                          </p>
                          <p className="text-[11px] mt-1 font-semibold">
                            Mevcut Müdür:{' '}
                            {s.principal_name ? (
                              <span className="text-slate-700">{s.principal_name}</span>
                            ) : (
                              <span className="text-amber-700 font-bold">Atama Bekleniyor</span>
                            )}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Müdür Seçimi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  2. Adım: Görevlendirilecek Müdürü Seçin
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {principals.map((p) => {
                    const isSelected = wizardPrincipalId === p.id;
                    const isAvailable = !p.assigned_school_id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setWizardPrincipalId(p.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                            : isAvailable
                            ? 'bg-teal-50/40 border-teal-200 hover:border-teal-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{p.full_name}</span>
                            <span className="text-[10px] font-mono text-slate-500">[{p.title}]</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{p.email}</p>
                          <p className="text-[11px] mt-1 font-semibold">
                            Şu Anki Görevi:{' '}
                            {p.assigned_school_name ? (
                              <span className="text-slate-700">{p.assigned_school_name}</span>
                            ) : (
                              <span className="text-teal-700 font-bold">Boşta (Atanmamış)</span>
                            )}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Complete Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Seçim:{' '}
                <span className="font-bold text-slate-900">
                  {principals.find((p) => p.id === wizardPrincipalId)?.full_name || 'Seçilmedi'}
                </span>{' '}
                →{' '}
                <span className="font-bold text-emerald-800">
                  {schools.find((s) => s.id === wizardSchoolId)?.name || 'Seçilmedi'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDirectWizardAssign}
                disabled={!wizardSchoolId || !wizardPrincipalId}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Atamayı Onayla & Tamamla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BÖLGE İSTATİSTİKLERİ                                               */}
      {/* ========================================================================= */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Kampüs Kapasite ve Kayıt Karşılaştırması</h3>
            <p className="text-xs text-slate-500 mb-6">Her bir kampüsteki kayıtlı öğrenci ve toplam kontenjan durumu</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schoolCapacityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Kapasite" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Kayıtlı" fill="#047857" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Öğretmen" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">İllere Göre Kampüs Dağılımı</h3>
              <p className="text-xs text-slate-500 mb-4">Bölge sorumluluğundaki şehir bazlı okul sayıları</p>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cityDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name || ''} (%${(((percent || 0) * 100)).toFixed(0)})`
                      }
                    >
                      {cityDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Bölgesel Yönetim Özeti</h3>
              <p className="text-xs text-slate-500 mb-4">Aktif eğitim ve kadro metrikleri</p>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Toplam Kampüs</span>
                  <span className="font-bold font-mono text-slate-900">{totalSchools}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Müdür Kadrosu Doluluğu</span>
                  <span className="font-bold font-mono text-emerald-800">
                    %{totalSchools > 0 ? Math.round(((totalSchools - unassignedSchools.length) / totalSchools) * 100) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Toplam Kapasite</span>
                  <span className="font-bold font-mono text-slate-900">{totalCapacity} Öğrenci</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">Kayıtlı Öğrenci</span>
                  <span className="font-bold font-mono text-slate-900">{totalEnrolled} Öğrenci</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DENETİM GÜNLÜĞÜ                                                    */}
      {/* ========================================================================= */}
      {currentTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bölge Denetim & İşlem Günlüğü</h3>
              <p className="text-xs text-slate-500">Okul açılışları, müdür kayıtları ve atama hareketleri</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Son İşlemler</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.length === 0 ? (
              <p className="text-slate-400 py-8 text-center">Henüz bir denetim kaydı bulunmuyor.</p>
            ) : (
              activityLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{log.action}</p>
                      <p className="text-slate-600 mt-0.5">{log.target_entity}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 block">{log.created_at}</span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.user_name}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Yeni Okul / Kampüs Aç */}
      {showNewSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Yeni Okul / Kampüs Açılışı</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sisteme yeni bir eğitim kampüsü tanımlayın</p>
              </div>
              <button
                onClick={() => setShowNewSchoolModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kampüs / Okul Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Özel Akademi Koleji — Çayyolu Kampüsü"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kampüs Kodu *</label>
                  <input
                    type="text"
                    required
                    placeholder="AKD-ANK-04"
                    value={schoolForm.code}
                    onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Öğrenci Kapasitesi</label>
                  <input
                    type="number"
                    min={50}
                    max={2000}
                    value={schoolForm.capacity}
                    onChange={(e) => setSchoolForm({ ...schoolForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">İl *</label>
                  <input
                    type="text"
                    required
                    placeholder="İstanbul, Ankara vb."
                    value={schoolForm.city}
                    onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Çankaya, Kadıköy vb."
                    value={schoolForm.district}
                    onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Açık Adres</label>
                <textarea
                  rows={2}
                  placeholder="Mahalle, cadde ve sokak bilgisi..."
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kampüs Telefonu</label>
                  <input
                    type="tel"
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">İletişim E-Posta</label>
                  <input
                    type="email"
                    placeholder="kampus@akademipro.k12.tr"
                    value={schoolForm.email}
                    onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">İlk Atanacak Okul Müdürü (Opsiyonel)</label>
                <select
                  value={schoolForm.principal_id}
                  onChange={(e) => setSchoolForm({ ...schoolForm, principal_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="">Daha sonra ata...</option>
                  {principals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.title}) {p.assigned_school_name ? `[Şu an: ${p.assigned_school_name}]` : '[Boşta]'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSchoolModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Okulu Aç & Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Yeni Müdür Ekle */}
      {showNewPrincipalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Yeni Okul Müdürü Kaydı</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sisteme yeni bir idari yönetici tanımlayın</p>
              </div>
              <button
                onClick={() => setShowNewPrincipalModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrincipal} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Müdür Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Çetin"
                  value={principalForm.full_name}
                  onChange={(e) => setPrincipalForm({ ...principalForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kurumsal E-Posta *</label>
                <input
                  type="email"
                  required
                  placeholder="ahmet.cetin@akademipro.k12.tr"
                  value={principalForm.email}
                  onChange={(e) => setPrincipalForm({ ...principalForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Bu e-posta ve '123456' varsayılan şifresiyle sisteme giriş yapabilecektir.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={principalForm.phone}
                    onChange={(e) => setPrincipalForm({ ...principalForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unvan</label>
                  <input
                    type="text"
                    value={principalForm.title}
                    onChange={(e) => setPrincipalForm({ ...principalForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Atanacağı Okul (Opsiyonel)</label>
                <select
                  value={principalForm.assigned_school_id}
                  onChange={(e) => setPrincipalForm({ ...principalForm, assigned_school_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="">Daha sonra ata...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) {s.principal_name ? `[Mevcut: ${s.principal_name}]` : '[Boşta]'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPrincipalModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Müdürü Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Okula Müdür Ata */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Okula Müdür Ataması Yap</h3>
                <p className="text-xs text-slate-500 mt-0.5">Seçilen müdüre hedef okulun idari yetkisini verin</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Müdür Seçiniz *</label>
                <select
                  required
                  value={assignState.principal_id}
                  onChange={(e) => setAssignState({ ...assignState, principal_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">Müdür seçin...</option>
                  {principals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.title}) {p.assigned_school_name ? `[Mevcut: ${p.assigned_school_name}]` : '[Boşta]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Atanacağı Okul / Kampüs *</label>
                <select
                  required
                  value={assignState.school_id}
                  onChange={(e) => setAssignState({ ...assignState, school_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">Okul seçin...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - {s.city}) {s.principal_name ? `[Mevcut: ${s.principal_name}]` : '[Boşta]'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                Bu atama onaylandığında, seçilen okul müdürü hedef okulun tek yetkili yöneticisi olacak,
                okulun öğretmenlerini, sınıflarını ve öğrencilerini yönetebilecektir.
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Atamayı Onayla & Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
