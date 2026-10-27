import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Home, Calendar, Kanban, FlaskConical, Menu, Shield } from 'lucide-react';
import {
  AppState,
  Account,
  Deal,
  Activity,
  MarketingCampaign,
  Quote,
  LabWorkOrder,
  MasterInstrument,
  InstrumentEvent,
  InventoryItem,
  Invoice,
  ServiceCatalog,
  LogEntry,
  AiAnalyticsResult,
  AppNotification,
  Role,
  TabKey,
  ManagedUserAccount,
  ProcurementRecord,
  SampleDeliveryRecord,
  CompetencyRecord,
  EmployeeRecord,
} from './types';
import {
  getInitialSeed,
  today,
  uid,
  DEFAULT_MANAGED_USERS,
  DEFAULT_PROCUREMENTS,
  DEFAULT_DELIVERIES,
  DEFAULT_COMPETENCIES,
  DEFAULT_EMPLOYEES,
} from './utils/seedData';
import { loadLocalState, saveLocalState, syncToCloud, fetchFromCloud, clearAllLocalData, SyncStatus } from './utils/cloudSync';
import { generateReminders } from './utils/reminderService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { WaModal } from './components/WaModal';
import { SlideModal } from './components/SlideModal';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { MobileMenuModal } from './components/MobileMenuModal';
import { UserAccountModal, ActiveUser } from './components/UserAccountModal';
import { ShareAccessModal } from './components/ShareAccessModal';
import { ExcelExportModal } from './components/ExcelExportModal';
import { ExcelImportModal, ImportableModule } from './components/ExcelImportModal';
import { AdminConfirmModal, AdminActionType } from './components/AdminConfirmModal';
import { OverviewDashboardView } from './components/views/OverviewDashboardView';
import { AccountsView } from './components/views/AccountsView';
import { DealsView } from './components/views/DealsView';
import { LabDashboardView } from './components/views/LabDashboardView';
import { LabView } from './components/views/LabView';
import { QcQaView } from './components/views/QcQaView';
import { MasterInstrumentsView } from './components/views/MasterInstrumentsView';
import { MonthlyReportView } from './components/views/MonthlyReportView';
import { AiAnalyticsView } from './components/views/AiAnalyticsView';
import { CalendarView } from './components/views/CalendarView';
import { QuotesView } from './components/views/QuotesView';
import { FinanceView } from './components/views/FinanceView';
import { LogBookView } from './components/views/LogBookView';
import { UserManagementView } from './components/views/UserManagementView';
import { LogisticsModule } from './components/views/LogisticsModule';
import { PeopleModule } from './components/views/PeopleModule';
import {
  ActivitiesView,
  MarketingView,
  InstrumentsView,
  InventoryView,
  CatalogView,
  SettingsView,
} from './components/views/AdditionalViews';

export default function App() {
  // 1. Core State
  const [state, setState] = useState<AppState>(() => {
    const local = loadLocalState();
    return local || getInitialSeed();
  });

  const [currentTab, setCurrentTab] = useState<TabKey>('dash');

  // Active user on this specific laptop/browser session
  const [currentUser, setCurrentUser] = useState<ActiveUser>(() => {
    try {
      const saved = localStorage.getItem('veritas_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.allowedTabs && Array.isArray(parsed.allowedTabs)) {
          if (!parsed.allowedTabs.includes('insts')) parsed.allowedTabs.push('insts');
          if (!parsed.allowedTabs.includes('cat')) parsed.allowedTabs.push('cat');
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return {
      u: 'ricoh',
      role: 'admin',
      name: 'Ricoh Sutrisno',
      department: 'Laboratory Manager / GM',
      allowedTabs: DEFAULT_MANAGED_USERS[0].allowedTabs,
    };
  });

  // 2. Viewport Mode: Web vs Mobile Device
  const [viewportMode, setViewportMode] = useState<'web' | 'mobile'>('web');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 3. Cloud Sync State & Server Revision Tracking
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'synced',
    lastSyncedAt: new Date().toISOString(),
    latencyMs: 32,
    message: 'Data Terintegrasi',
  });

  const lastKnownServerSyncRef = useRef<string>('');
  const isSyncingRef = useRef<boolean>(false);

  // 4. UI Modals
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState<boolean>(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState<boolean>(false);
  const [importTargetModule, setImportTargetModule] = useState<ImportableModule>('accounts');
  const [adminConfirmModal, setAdminConfirmModal] = useState<{
    isOpen: boolean;
    actionType: AdminActionType;
    title: string;
    description: string;
    confirmKeyword?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    actionType: 'reset_all_data',
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [waTargetAccount, setWaTargetAccount] = useState<Account | null>(null);
  const [waTemplateId, setWaTemplateId] = useState<string>('referral_followup');
  const [waExtraData, setWaExtraData] = useState<any>(null);

  // Day detail modal state for calendar
  const [activeDayDate, setActiveDayDate] = useState<string | null>(null);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  // AI analytics cached result
  const [aiResult, setAiResult] = useState<AiAnalyticsResult | null>(null);

  // 5. Automated Reminders computation
  const notifications = useMemo(() => generateReminders(state), [state]);

  const referralAlertCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'referral').length;
  }, [notifications]);

  const overdueCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'calibration' || n.type === 'pm').length;
  }, [notifications]);

  // Cloud sync push trigger
  const performCloudSync = useCallback(async (customState?: AppState) => {
    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }));
    const toSync = customState || state;
    const res = await syncToCloud(toSync);
    if (res.success && res.syncedAt) {
      lastKnownServerSyncRef.current = res.syncedAt;
    }
    setSyncStatus({
      status: res.success ? 'synced' : 'error',
      lastSyncedAt: res.syncedAt,
      latencyMs: res.latencyMs,
      message: res.success ? 'Tersinkronisasi ke Awan' : 'Koneksi lokal (offline)',
    });
  }, [state]);

  // Manual immediate pull / check sync
  const handleManualSyncNow = async () => {
    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }));
    try {
      const cloud = await fetchFromCloud();
      if (cloud.hasData && cloud.data) {
        setState(cloud.data);
        saveLocalState(cloud.data);
        lastKnownServerSyncRef.current = cloud.syncedAt || '';
        setSyncStatus({
          status: 'synced',
          lastSyncedAt: cloud.syncedAt || new Date().toISOString(),
          latencyMs: 18,
          message: 'Data Sinkron dengan Seluruh Tim',
        });
      } else {
        await performCloudSync();
      }
    } catch (e) {
      setSyncStatus((prev) => ({ ...prev, status: 'error', message: 'Koneksi bermasalah' }));
    }
  };

  // Initial cloud sync & dynamic 10-second background polling for multi-laptop updates
  useEffect(() => {
    let isMounted = true;

    // 1. On mount: fetch existing shared database from server
    fetchFromCloud().then((cloud) => {
      if (!isMounted) return;
      if (cloud.hasData && cloud.data) {
        setState(cloud.data);
        saveLocalState(cloud.data);
        lastKnownServerSyncRef.current = cloud.syncedAt || '';
        setSyncStatus({
          status: 'synced',
          lastSyncedAt: cloud.syncedAt || new Date().toISOString(),
          latencyMs: 22,
          message: 'Data Terintegrasi',
        });
      } else {
        performCloudSync();
      }
    });

    // 2. Poll every 10 seconds: If another laptop updated data, automatically pull it in!
    const pollInterval = setInterval(async () => {
      if (isSyncingRef.current) return;
      try {
        const cloud = await fetchFromCloud();
        if (!isMounted) return;
        if (cloud.hasData && cloud.data && cloud.syncedAt) {
          // If server's revision is different from what we last knew, update local state!
          if (cloud.syncedAt !== lastKnownServerSyncRef.current) {
            lastKnownServerSyncRef.current = cloud.syncedAt;
            setState(cloud.data);
            saveLocalState(cloud.data);
            setSyncStatus({
              status: 'synced',
              lastSyncedAt: cloud.syncedAt,
              latencyMs: 25,
              message: 'Update Diterima dari Laptop Tim',
            });
          }
        }
      } catch (err) {
        console.warn('Background sync check warning:', err);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // System auto-logging helper
  const addLogEntry = useCallback(
    (action: LogEntry['action'], mod: string, ref: string, note: string) => {
      setState((prev) => {
        const newLog: LogEntry = {
          id: uid(),
          ts: Date.now(),
          user: currentUser.u,
          role: currentUser.role,
          action,
          mod,
          ref,
          note,
        };
        const updatedLogs = [newLog, ...prev.log].slice(0, 3000);
        const nextState = { ...prev, log: updatedLogs };
        saveLocalState(nextState);
        return nextState;
      });
    },
    [currentUser]
  );

  // State mutators
  const handleSaveAccount = (account: Account) => {
    setState((prev) => {
      const exists = prev.accounts.some((a) => a.id === account.id);
      const accounts = exists
        ? prev.accounts.map((a) => (a.id === account.id ? account : a))
        : [account, ...prev.accounts];
      const next = { ...prev, accounts };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Tambah', 'Kontak & Segmen', account.name, `Disimpan dengan segmen ${account.industry} (sumber ${account.source})`);
  };

  const handleDeleteAccount = (id: string) => {
    const acc = state.accounts.find((a) => a.id === id);
    setState((prev) => {
      const accounts = prev.accounts.filter((a) => a.id !== id);
      const next = { ...prev, accounts };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (acc) addLogEntry('Hapus', 'Kontak & Segmen', acc.name, 'Kontak dihapus');
  };

  const handleSaveDeal = (deal: Deal) => {
    setState((prev) => {
      const exists = prev.deals.some((d) => d.id === deal.id);
      const deals = exists
        ? prev.deals.map((d) => (d.id === deal.id ? deal : d))
        : [deal, ...prev.deals];
      const next = { ...prev, deals };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Ubah', 'Papan Deal', deal.title, `Tahap: ${deal.stage}, Nilai: Rp ${deal.value.toLocaleString('id-ID')}`);
  };

  const handleDeleteDeal = (id: string) => {
    const d = state.deals.find((x) => x.id === id);
    setState((prev) => {
      const deals = prev.deals.filter((x) => x.id !== id);
      const next = { ...prev, deals };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (d) addLogEntry('Hapus', 'Papan Deal', d.title, 'Deal dihapus');
  };

  // Lab Work Order Save with automated instrument completion logging!
  const handleSaveLab = (lab: LabWorkOrder, wasJustCompleted: boolean = false) => {
    setState((prev) => {
      const exists = prev.labs.some((l) => l.id === lab.id);
      const labs = exists
        ? prev.labs.map((l) => (l.id === lab.id ? lab : l))
        : [lab, ...prev.labs];

      let logs = prev.log;
      if (wasJustCompleted) {
        const autoCompletionLog: LogEntry = {
          id: uid(),
          ts: Date.now(),
          user: 'sistem',
          role: 'lab',
          action: 'Selesai Proses',
          mod: 'Laboratorium',
          ref: `${lab.service} (Sample ${lab.sid})`,
          note: `Sistem otomatis mencatat: ${lab.analisa} sampel selesai diproses oleh analis ${lab.analyst || '-'} pada instrumen ${lab.service}.`,
        };
        logs = [autoCompletionLog, ...logs].slice(0, 3000);
      }

      const next = { ...prev, labs, log: logs };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
  };

  const handleDeleteLab = (id: string) => {
    setState((prev) => {
      const labs = prev.labs.filter((l) => l.id !== id);
      const next = { ...prev, labs };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
  };

  // WhatsApp open helper
  const handleOpenWaModal = (acc?: Account | null, templateId: string = 'referral_followup', extraData?: any) => {
    setWaTargetAccount(acc || null);
    setWaTemplateId(templateId);
    setWaExtraData(extraData);
    setIsWaModalOpen(true);
  };

  const handleWaLogged = (recipient: string, messageSnippet: string) => {
    addLogEntry('Tambah', 'WhatsApp Layanan', recipient, `Pesan dikirim: ${messageSnippet.slice(0, 60)}...`);
  };

  // QC/QA GLP & ISO 17025 state mutator
  const handleSaveQcQa = (newQcQa: any) => {
    setState((prev) => {
      const next = { ...prev, qcqa: newQcQa };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Ubah', 'QC/QA & ISO 17025', 'Checklist & Tindakan', 'Pembaruan data checklist harian / CAPA / GAP assessment');
  };

  // Logistics & Supply Chain Mutators
  const handleSaveProcurement = (p: ProcurementRecord) => {
    setState((prev) => {
      const cur = prev.procurements || [];
      const exists = cur.some((x) => x.id === p.id);
      const procurements = exists ? cur.map((x) => (x.id === p.id ? p : x)) : [p, ...cur];
      const next = { ...prev, procurements };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Tambah', 'Pengadaan & PO', p.poNumber, `${p.itemDescription} (${p.qty} ${p.unit}) status: ${p.status}`);
  };

  const handleDeleteProcurement = (id: string) => {
    const p = (state.procurements || []).find((x) => x.id === id);
    setState((prev) => {
      const procurements = (prev.procurements || []).filter((x) => x.id !== id);
      const next = { ...prev, procurements };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (p) addLogEntry('Hapus', 'Pengadaan & PO', p.poNumber, `PO ${p.itemDescription} dihapus`);
  };

  const handleSaveDelivery = (d: SampleDeliveryRecord) => {
    setState((prev) => {
      const cur = prev.deliveries || [];
      const exists = cur.some((x) => x.id === d.id);
      const deliveries = exists ? cur.map((x) => (x.id === d.id ? d : x)) : [d, ...cur];
      const next = { ...prev, deliveries };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Tambah', 'Logistik Sampel', d.trackingNo, `${d.type} dari ${d.origin} via ${d.courier}`);
  };

  const handleDeleteDelivery = (id: string) => {
    const d = (state.deliveries || []).find((x) => x.id === id);
    setState((prev) => {
      const deliveries = (prev.deliveries || []).filter((x) => x.id !== id);
      const next = { ...prev, deliveries };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (d) addLogEntry('Hapus', 'Logistik Sampel', d.trackingNo, 'Resi pengiriman dihapus');
  };

  // People & Competency Mutators
  const handleSaveCompetency = (c: CompetencyRecord) => {
    setState((prev) => {
      const cur = prev.competencies || [];
      const exists = cur.some((x) => x.id === c.id);
      const competencies = exists ? cur.map((x) => (x.id === c.id ? c : x)) : [c, ...cur];
      const next = { ...prev, competencies };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Ubah', 'Kompetensi ISO 17025', c.employeeName, `Kualifikasi: ${c.role} (${c.status})`);
  };

  const handleDeleteCompetency = (id: string) => {
    const c = (state.competencies || []).find((x) => x.id === id);
    setState((prev) => {
      const competencies = (prev.competencies || []).filter((x) => x.id !== id);
      const next = { ...prev, competencies };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (c) addLogEntry('Hapus', 'Kompetensi ISO 17025', c.employeeName, 'Catatan kualifikasi dihapus');
  };

  const handleSaveEmployee = (e: EmployeeRecord) => {
    setState((prev) => {
      const cur = prev.employees || [];
      const exists = cur.some((x) => x.id === e.id);
      const employees = exists ? cur.map((x) => (x.id === e.id ? e : x)) : [e, ...cur];
      const next = { ...prev, employees };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    addLogEntry('Tambah', 'Direktori Karyawan', e.name, `${e.position} - ${e.department}`);
  };

  const handleDeleteEmployee = (id: string) => {
    const e = (state.employees || []).find((x) => x.id === id);
    setState((prev) => {
      const employees = (prev.employees || []).filter((x) => x.id !== id);
      const next = { ...prev, employees };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (e) addLogEntry('Hapus', 'Direktori Karyawan', e.name, 'Data karyawan dihapus');
  };

  // Universal Import Open & Complete
  const handleOpenImport = (moduleKey: ImportableModule) => {
    setImportTargetModule(moduleKey);
    setIsExcelImportModalOpen(true);
  };

  const handleUniversalImport = (moduleKey: ImportableModule, items: any[], mode: 'append' | 'replace') => {
    setState((prev) => {
      const updated = { ...prev };
      switch (moduleKey) {
        case 'accounts':
          updated.accounts = mode === 'replace' ? items : [...items, ...prev.accounts];
          break;
        case 'deals':
          updated.deals = mode === 'replace' ? items : [...items, ...prev.deals];
          break;
        case 'quotes':
          updated.quotes = mode === 'replace' ? items : [...items, ...prev.quotes];
          break;
        case 'labs':
          updated.labs = mode === 'replace' ? items : [...items, ...prev.labs];
          break;
        case 'fins':
          updated.fins = mode === 'replace' ? items : [...items, ...prev.fins];
          break;
        case 'mkt':
        case 'marketing':
          updated.mkt = mode === 'replace' ? items : [...items, ...prev.mkt];
          break;
        case 'procurement':
        case 'procurements':
          updated.procurements = mode === 'replace' ? items : [...items, ...(prev.procurements || [])];
          break;
        case 'deliveries':
          updated.deliveries = mode === 'replace' ? items : [...items, ...(prev.deliveries || [])];
          break;
        case 'competency':
        case 'competencies':
          updated.competencies = mode === 'replace' ? items : [...items, ...(prev.competencies || [])];
          break;
        case 'employees':
          updated.employees = mode === 'replace' ? items : [...items, ...(prev.employees || [])];
          break;
        case 'inv':
          updated.inv = mode === 'replace' ? items : [...items, ...prev.inv];
          break;
      }
      saveLocalState(updated);
      performCloudSync(updated);
      return updated;
    });
    addLogEntry('Impor', 'Sinkronisasi Excel', moduleKey, `Berhasil mengimpor ${items.length} entitas data (${mode})`);
  };

  // Reset / Clear all data handler (Khusus Admin - via AdminConfirmModal)
  const handleResetAllData = () => {
    if (currentUser.role !== 'admin') {
      alert('Akses Terbatas: Hanya Admin yang dapat mengosongkan seluruh data sistem.');
      return;
    }

    setAdminConfirmModal({
      isOpen: true,
      actionType: 'reset_all_data',
      title: 'Kosongkan Seluruh Data Transaksi & Operasional (0 Data)',
      description:
        'Perhatian: Seluruh data kontak pelanggan, deal penjualan, penawaran harga, pesanan lab, invoice, pengadaan, dan logistik akan dihapus bersih (0 data). Akun admin dan profil perusahaan tetap dipertahankan.',
      confirmKeyword: 'KOSONGKAN',
      onConfirm: () => {
        const initialBaseline = getInitialSeed();
        const emptyState: AppState = {
          accounts: [],
          deals: [],
          acts: [],
          mkt: [],
          quotes: [],
          labs: [],
          instr: [],
          insts: state.insts && state.insts.length > 0 ? state.insts : initialBaseline.insts,
          inv: [],
          fins: [],
          cat: state.cat && state.cat.length > 0 ? state.cat : initialBaseline.cat,
          qcqa: {
            checks: {},
            actions: [],
            gaps: {},
          },
          users: state.users && state.users.length > 0 ? state.users : initialBaseline.users,
          procurements: [],
          deliveries: [],
          competencies: state.competencies || DEFAULT_COMPETENCIES,
          employees: state.employees || DEFAULT_EMPLOYEES,
          log: [
            {
              id: uid(),
              ts: Date.now(),
              user: currentUser.u || 'admin',
              role: currentUser.role || 'admin',
              action: 'Hapus',
              mod: 'Sistem',
              ref: 'Kosongkan Semua Data',
              note: 'Seluruh data transaksi, pelanggan, deal, operasional lab, pengadaan, dan invoice dikosongkan oleh Admin.',
            },
          ],
          settings: {
            ...state.settings,
            co: state.settings?.co?.name ? state.settings.co : initialBaseline.settings.co,
          },
        };

        setState(emptyState);
        saveLocalState(emptyState);
        performCloudSync(emptyState);
      },
    });
  };

  // Clear Log Book history handler (Khusus Admin - via AdminConfirmModal)
  const handleClearLogs = () => {
    if (currentUser.role !== 'admin') {
      alert('Akses Terbatas: Hanya Admin yang dapat menghapus riwayat audit trail Log Book.');
      return;
    }

    setAdminConfirmModal({
      isOpen: true,
      actionType: 'clear_logbook',
      title: 'Hapus History & Riwayat Audit Trail Log Book',
      description:
        'Semua riwayat catatan audit trail aktivitas sistem akan dihapus permanen. Log baru akan dibuat untuk mencatat pembersihan ini.',
      confirmKeyword: 'HAPUS',
      onConfirm: () => {
        const resetLog: LogEntry[] = [
          {
            id: uid(),
            ts: Date.now(),
            user: currentUser.u || 'admin',
            role: currentUser.role || 'admin',
            action: 'Hapus',
            mod: 'Log Book',
            ref: 'History Log Book Dibersihkan',
            note: 'Seluruh riwayat audit trail sebelumnya telah dihapus dan direset oleh Admin.',
          },
        ];
        const updatedState = { ...state, log: resetLog };
        setState(updatedState);
        saveLocalState(updatedState);
        performCloudSync(updatedState);
      },
    });
  };

  // Active user management list (synchronized with cloud)
  const usersList = useMemo(() => {
    return state.users && state.users.length > 0 ? state.users : DEFAULT_MANAGED_USERS;
  }, [state.users]);

  const handleSaveUser = (user: ManagedUserAccount) => {
    setState((prev) => {
      const curUsers = prev.users && prev.users.length > 0 ? prev.users : DEFAULT_MANAGED_USERS;
      const exists = curUsers.some((u) => u.id === user.id);
      const updatedUsers = exists
        ? curUsers.map((u) => (u.id === user.id ? user : u))
        : [...curUsers, user];
      const next = { ...prev, users: updatedUsers };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });

    // If updating current active user on this laptop, refresh permissions immediately
    if (user.username === currentUser.u) {
      const updatedActive: ActiveUser = {
        u: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        allowedTabs: user.allowedTabs,
      };
      setCurrentUser(updatedActive);
      try {
        localStorage.setItem('veritas_active_user', JSON.stringify(updatedActive));
      } catch (e) {}
    }
    addLogEntry('Ubah', 'Manajemen Pengguna', user.name, `Akun @${user.username} diperbarui (${user.allowedTabs.length} modul diizinkan)`);
  };

  const handleDeleteUser = (id: string) => {
    const target = usersList.find((u) => u.id === id);
    setState((prev) => {
      const curUsers = prev.users && prev.users.length > 0 ? prev.users : DEFAULT_MANAGED_USERS;
      const updatedUsers = curUsers.filter((u) => u.id !== id);
      const next = { ...prev, users: updatedUsers };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
    if (target) {
      addLogEntry('Hapus', 'Manajemen Pengguna', target.name, `Akun @${target.username} dihapus`);
    }
  };

  const handleToggleUserStatus = (id: string) => {
    setState((prev) => {
      const curUsers = prev.users && prev.users.length > 0 ? prev.users : DEFAULT_MANAGED_USERS;
      const updatedUsers = curUsers.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
      const next = { ...prev, users: updatedUsers };
      saveLocalState(next);
      performCloudSync(next);
      return next;
    });
  };

  // Notification action handler
  const handleNotificationAction = (notif: AppNotification) => {
    setIsNotifDrawerOpen(false);
    if (notif.actionType === 'wa') {
      const acc = state.accounts.find((a) => a.id === notif.relatedId);
      handleOpenWaModal(acc, notif.type === 'referral' ? 'referral_followup' : 'invoice_reminder');
    } else if (notif.actionType === 'view_lab') {
      setCurrentTab('labdash');
    } else if (notif.actionType === 'view_acc') {
      setCurrentTab('accounts');
    }
  };

  // Active View Renderer shared between Web View & Mobile Simulator
  const renderActiveView = () => {
    // Role-based access restriction check (admin always has unrestricted access)
    if (
      currentUser.role !== 'admin' &&
      currentUser.allowedTabs &&
      currentUser.allowedTabs.length > 0 &&
      !currentUser.allowedTabs.includes(currentTab)
    ) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
          <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Akses Modul Dibatasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Akun Anda (<strong>{currentUser.name}</strong> - {currentUser.role.toUpperCase()}) tidak memiliki izin akses ke modul ini. Hubungi Administrator (Ricoh Sutrisno) untuk membuka akses akun Anda.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('dash')}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            Kembali ke Dashboard Utama
          </button>
        </div>
      );
    }

    switch (currentTab) {
      case 'dash':
        return (
          <OverviewDashboardView
            state={state}
            selectedYear={calendarYear}
            onYearChange={setCalendarYear}
            onNavigate={(t) => setCurrentTab(t)}
            onOpenWa={(a, tmpl) => handleOpenWaModal(a, tmpl)}
            onOpenSlide={() => setIsSlideModalOpen(true)}
          />
        );
      case 'ai_analytics':
        return (
          <AiAnalyticsView
            state={state}
            aiResult={aiResult}
            onUpdateAiResult={(res) => setAiResult(res)}
          />
        );
      case 'accounts':
        return (
          <AccountsView
            accounts={state.accounts}
            deals={state.deals}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenWa={(a, tmpl) => handleOpenWaModal(a, tmpl)}
            onOpenImportExcel={() => handleOpenImport('accounts')}
            isMobile={viewportMode === 'mobile'}
          />
        );
      case 'deals':
        return (
          <DealsView
            deals={state.deals}
            accounts={state.accounts}
            fins={state.fins}
            labs={state.labs}
            insts={state.insts}
            quotes={state.quotes}
            onSaveDeal={handleSaveDeal}
            onDeleteDeal={handleDeleteDeal}
            onOpenImportExcel={() => handleOpenImport('deals')}
            isMobile={viewportMode === 'mobile'}
          />
        );
      case 'labdash':
        return (
          <LabDashboardView
            labs={state.labs}
            insts={state.insts}
            instr={state.instr}
            accounts={state.accounts}
            log={state.log}
          />
        );
      case 'lab':
        return (
          <LabView
            labs={state.labs}
            insts={state.insts}
            accounts={state.accounts}
            quotes={state.quotes}
            catalog={state.cat}
            onSaveLab={handleSaveLab}
            onDeleteLab={handleDeleteLab}
            onOpenWa={(a, tmpl, extra) => handleOpenWaModal(a, tmpl, extra)}
            onOpenImportExcel={() => handleOpenImport('labs')}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'qcqa':
        return (
          <QcQaView
            qcqa={state.qcqa}
            onSaveQcQa={handleSaveQcQa}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'insts':
        return (
          <MasterInstrumentsView
            insts={state.insts}
            onSaveInstrument={(inst) => {
              setState((prev) => {
                const exists = prev.insts.some((i) => i.id === inst.id);
                const insts = exists
                  ? prev.insts.map((i) => (i.id === inst.id ? inst : i))
                  : [inst, ...prev.insts];
                const next = { ...prev, insts };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteInstrument={(id) => {
              setState((prev) => {
                const insts = prev.insts.filter((i) => i.id !== id);
                const next = { ...prev, insts };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
          />
        );
      case 'cal':
        return (
          <CalendarView
            state={state}
            selectedYear={calendarYear}
            onYearChange={setCalendarYear}
            onSaveActivity={(act) => {
              setState((prev) => {
                const acts = [act, ...prev.acts.filter((a) => a.id !== act.id)];
                const next = { ...prev, acts };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
              addLogEntry('Tambah', 'Kalender & Agenda Sales', act.type, `Agenda sales untuk tanggal ${act.date}`);
            }}
            onDeleteActivity={(id) => {
              setState((prev) => {
                const acts = prev.acts.filter((a) => a.id !== id);
                const next = { ...prev, acts };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onSaveMkt={(m) => {
              setState((prev) => {
                const mkt = [m, ...prev.mkt.filter((x) => x.id !== m.id)];
                const next = { ...prev, mkt };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
              addLogEntry('Tambah', 'Kalender & Marketing', m.name, `Campaign marketing untuk tanggal ${m.date}`);
            }}
            onDeleteMkt={(id) => {
              setState((prev) => {
                const mkt = prev.mkt.filter((x) => x.id !== id);
                const next = { ...prev, mkt };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onSaveLab={handleSaveLab}
            onDeleteLab={handleDeleteLab}
            onSaveInstrumentEvent={(evt) => {
              setState((prev) => {
                const instr = [evt, ...prev.instr.filter((i) => i.id !== evt.id)];
                const next = { ...prev, instr };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
              addLogEntry('Tambah', 'Kalender & Lab Instrumen', evt.name, `${evt.type} pada instrumen ${evt.name}`);
            }}
            onDeleteInstrumentEvent={(id) => {
              setState((prev) => {
                const instr = prev.instr.filter((i) => i.id !== id);
                const next = { ...prev, instr };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onSaveCat={(item) => {
              setState((prev) => {
                const exists = prev.cat.some((x) => x.id === item.id);
                const cat = exists
                  ? prev.cat.map((x) => (x.id === item.id ? item : x))
                  : [item, ...prev.cat];
                const next = { ...prev, cat };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
              addLogEntry('Ubah', 'Katalog Layanan & Kalender', item.d, `Status layanan: ${item.status || 'Tersedia'}`);
            }}
            onSaveAccount={handleSaveAccount}
          />
        );
      case 'quote':
        return (
          <QuotesView
            quotes={state.quotes}
            accounts={state.accounts}
            deals={state.deals}
            catalog={state.cat}
            onSaveQuote={(quote) => {
              setState((prev) => {
                const exists = prev.quotes.some((q) => q.id === quote.id);
                const quotes = exists
                  ? prev.quotes.map((q) => (q.id === quote.id ? quote : q))
                  : [quote, ...prev.quotes];
                const next = { ...prev, quotes };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteQuote={(id) => {
              setState((prev) => {
                const quotes = prev.quotes.filter((q) => q.id !== id);
                const next = { ...prev, quotes };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onOpenWa={(a, tmpl, extra) => handleOpenWaModal(a, tmpl, extra)}
            onOpenImportExcel={() => handleOpenImport('quotes')}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'fin':
        return (
          <FinanceView
            fins={state.fins}
            accounts={state.accounts}
            deals={state.deals}
            quotes={state.quotes}
            labs={state.labs}
            onSaveInvoice={(inv) => {
              setState((prev) => {
                const exists = prev.fins.some((f) => f.id === inv.id);
                const fins = exists
                  ? prev.fins.map((f) => (f.id === inv.id ? inv : f))
                  : [inv, ...prev.fins];
                const next = { ...prev, fins };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteInvoice={(id) => {
              setState((prev) => {
                const fins = prev.fins.filter((f) => f.id !== id);
                const next = { ...prev, fins };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onOpenWa={(a, tmpl, extra) => handleOpenWaModal(a, tmpl, extra)}
            onOpenImportExcel={() => handleOpenImport('fins')}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'slide_export':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 text-white shadow-lg border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Executive Cockpit &bull; 10 Slide Komprehensif
                </span>
                <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                  <span>Slide Rapat Direksi PT NUSA VERITAS INSPEKTAMA</span>
                </h2>
              </div>
              <button
                onClick={() => setIsSlideModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 shrink-0"
              >
                <span>Buka Presentasi 10 Slide</span>
              </button>
            </div>
            <MonthlyReportView state={state} onOpenSlide={() => setIsSlideModalOpen(true)} />
          </div>
        );
      case 'procurement':
      case 'sample_logistics':
        return (
          <LogisticsModule
            procurements={state.procurements || []}
            deliveries={state.deliveries || []}
            activeSubTab={currentTab === 'procurement' ? 'procurement' : 'sample_logistics'}
            userRole={currentUser.role}
            onSaveProcurement={handleSaveProcurement}
            onDeleteProcurement={handleDeleteProcurement}
            onSaveDelivery={handleSaveDelivery}
            onDeleteDelivery={handleDeleteDelivery}
            onOpenExcelImport={(key) => handleOpenImport(key)}
          />
        );
      case 'competency':
      case 'employees':
        return (
          <PeopleModule
            competencies={state.competencies || []}
            employees={state.employees || []}
            activeSubTab={currentTab === 'competency' ? 'competency' : 'employees'}
            userRole={currentUser.role}
            onSaveCompetency={handleSaveCompetency}
            onDeleteCompetency={handleDeleteCompetency}
            onSaveEmployee={handleSaveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onOpenExcelImport={(key) => handleOpenImport(key)}
          />
        );
      case 'monthly_report':
        return (
          <MonthlyReportView
            state={state}
            onOpenSlide={() => setIsSlideModalOpen(true)}
          />
        );
      case 'log':
        return (
          <LogBookView
            logs={state.log}
            isAdmin={currentUser.role === 'admin'}
            onClearLogs={handleClearLogs}
          />
        );
      case 'acts':
        return (
          <ActivitiesView
            acts={state.acts}
            accounts={state.accounts}
            onSaveActivity={(act) => {
              setState((prev) => {
                const exists = prev.acts.some((a) => a.id === act.id);
                const acts = exists
                  ? prev.acts.map((a) => (a.id === act.id ? act : a))
                  : [act, ...prev.acts];
                const next = { ...prev, acts };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteActivity={(id) => {
              setState((prev) => {
                const acts = prev.acts.filter((a) => a.id !== id);
                const next = { ...prev, acts };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
          />
        );
      case 'mkt':
        return (
          <MarketingView
            mkt={state.mkt}
            onSaveMkt={(m) => {
              setState((prev) => {
                const exists = prev.mkt.some((x) => x.id === m.id);
                const mkt = exists
                  ? prev.mkt.map((x) => (x.id === m.id ? m : x))
                  : [m, ...prev.mkt];
                const next = { ...prev, mkt };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteMkt={(id) => {
              setState((prev) => {
                const mkt = prev.mkt.filter((x) => x.id !== id);
                const next = { ...prev, mkt };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onOpenImportExcel={() => handleOpenImport('mkt')}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'instr':
        return (
          <InstrumentsView
            events={state.instr}
            insts={state.insts}
            onSaveEvent={(ev) => {
              setState((prev) => {
                const exists = prev.instr.some((x) => x.id === ev.id);
                const instr = exists
                  ? prev.instr.map((x) => (x.id === ev.id ? ev : x))
                  : [ev, ...prev.instr];
                const next = { ...prev, instr };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteEvent={(id) => {
              setState((prev) => {
                const instr = prev.instr.filter((i) => i.id !== id);
                const next = { ...prev, instr };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'inv':
        return (
          <InventoryView
            inv={state.inv}
            insts={state.insts}
            onSaveInv={(item) => {
              setState((prev) => {
                const exists = prev.inv.some((x) => x.id === item.id);
                const inv = exists
                  ? prev.inv.map((x) => (x.id === item.id ? item : x))
                  : [item, ...prev.inv];
                const next = { ...prev, inv };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteInv={(id) => {
              setState((prev) => {
                const inv = prev.inv.filter((x) => x.id !== id);
                const next = { ...prev, inv };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
          />
        );
      case 'cat':
        return (
          <CatalogView
            cat={state.cat}
            onSaveCat={(item) => {
              setState((prev) => {
                const exists = prev.cat.some((x) => x.id === item.id);
                const cat = exists
                  ? prev.cat.map((x) => (x.id === item.id ? item : x))
                  : [item, ...prev.cat];
                const next = { ...prev, cat };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onDeleteCat={(id) => {
              setState((prev) => {
                const cat = prev.cat.filter((x) => x.id !== id);
                const next = { ...prev, cat };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
          />
        );
      case 'set':
        if (currentUser.role !== 'admin') {
          return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
              <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Akses Ditolak - Khusus Administrator</h3>
              <p className="text-xs text-slate-500 max-w-md">Modul Pengaturan Sistem & Database hanya dapat diakses dan diubah oleh akun dengan peran Administrator (Admin).</p>
            </div>
          );
        }
        return (
          <SettingsView
            settings={state.settings}
            onSaveSettings={(s) => {
              setState((prev) => {
                const next = { ...prev, settings: s };
                saveLocalState(next);
                performCloudSync(next);
                return next;
              });
            }}
            onSyncNow={() => performCloudSync()}
            onExportJson={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Veritas_Backup_${today()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            onImportJson={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (evt) => {
                try {
                  const parsed = JSON.parse(evt.target?.result as string);
                  if (parsed && parsed.accounts) {
                    setState(parsed);
                    saveLocalState(parsed);
                    performCloudSync(parsed);
                    alert('Data berhasil dipulihkan dari cadangan JSON.');
                  }
                } catch (err) {
                  alert('Format file JSON tidak valid.');
                }
              };
              reader.readAsText(file);
            }}
            onResetAllData={handleResetAllData}
            onClearLogs={handleClearLogs}
            onExportExcel={() => setIsExcelModalOpen(true)}
            isAdmin={currentUser.role === 'admin'}
          />
        );
      case 'users':
        if (currentUser.role !== 'admin') {
          return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
              <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Akses Ditolak - Khusus Administrator</h3>
              <p className="text-xs text-slate-500 max-w-md">Modul Manajemen Pengguna & Hak Akses hanya dapat dikelola oleh akun dengan peran Administrator (Admin).</p>
            </div>
          );
        }
        return (
          <UserManagementView
            users={usersList}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
          />
        );
      default:
        return null;
    }
  };

  const handleSelectUser = (user: ActiveUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('veritas_active_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save active user:', e);
    }
    addLogEntry('Ubah', 'Sistem & Pengguna', user.name, `Pengguna laptop ini beralih ke peran ${user.role} (${user.department || '-'})`);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header with Web vs Mobile Viewport Switcher */}
      <Header
        user={currentUser}
        syncStatus={syncStatus}
        notifications={notifications}
        viewportMode={viewportMode}
        onToggleViewportMode={(mode) => setViewportMode(mode)}
        onSyncNow={handleManualSyncNow}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenWa={() => handleOpenWaModal()}
        onOpenSlide={() => setIsSlideModalOpen(true)}
        onOpenAiAnalytics={() => setCurrentTab('ai_analytics')}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenExcelExport={() => setIsExcelModalOpen(true)}
        onLogout={() => {
          setIsUserModalOpen(true);
        }}
      />

      {/* Main View Area: Conditionally Renders Web View or Mobile Device Simulator */}
      {viewportMode === 'web' ? (
        /* 1. Tampilan Web Desktop (dengan penyesuaian responsif layar HP langsung) */
        <div className="flex flex-1 overflow-hidden relative">
          {/* Navigation Sidebar: disembunyikan di layar HP agar konten tidak tergeser */}
          <div className="hidden md:block shrink-0 h-full">
            <Sidebar
              currentTab={currentTab}
              userRole={currentUser.role}
              allowedTabs={currentUser.allowedTabs}
              referralAlertCount={referralAlertCount}
              overdueCount={overdueCount}
              onSelectTab={(tab) => {
                if (tab === 'slide_export') {
                  setIsSlideModalOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
            />
          </div>

          {/* Viewport Content Area: Lebar penuh di HP tanpa tumpang tindih */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="mx-auto max-w-7xl animate-fadeIn">
              {renderActiveView()}
            </div>
          </main>

          {/* Mobile Bottom Dock untuk layar kecil */}
          <div className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md flex items-center justify-around px-2 z-40">
            <button
              onClick={() => setCurrentTab('dash')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'dash'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setCurrentTab('cal')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'cal'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Kalender</span>
            </button>

            <button
              onClick={() => setCurrentTab('deals')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'deals'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span>Deal</span>
            </button>

            <button
              onClick={() => setCurrentTab('labdash')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'labdash'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>Lab</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center gap-0.5 text-[9px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. Tampilan Mobile Device Simulator & Live Adjustments */
        <div className="flex-1 overflow-y-auto">
          <MobileDeviceFrame
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'slide_export') {
                setIsSlideModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenWa={() => handleOpenWaModal()}
            onOpenMenu={() => setIsMobileMenuOpen(true)}
          >
            {renderActiveView()}
          </MobileDeviceFrame>
        </div>
      )}

      {/* User Account & Role Switcher Modal */}
      <UserAccountModal
        isOpen={isUserModalOpen}
        currentUser={currentUser}
        managedUsers={usersList}
        onSelectUser={handleSelectUser}
        onOpenManageUsers={() => setCurrentTab('users')}
        onClose={() => setIsUserModalOpen(false)}
      />

      {/* Share Multi-Laptop Team Access Modal */}
      <ShareAccessModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Integrated Excel Export Modal */}
      <ExcelExportModal
        isOpen={isExcelModalOpen}
        state={state}
        onClose={() => setIsExcelModalOpen(false)}
      />

      {/* Mobile Drawer Menu Modal for Secondary Items */}
      <MobileMenuModal
        isOpen={isMobileMenuOpen}
        currentTab={currentTab}
        userRole={currentUser.role}
        allowedTabs={currentUser.allowedTabs}
        onSelectTab={(tab) => {
          if (tab === 'slide_export') {
            setIsSlideModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide Presentation Modal */}
      <SlideModal
        isOpen={isSlideModalOpen}
        state={state}
        onClose={() => setIsSlideModalOpen(false)}
      />

      {/* Instant Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        notifications={notifications}
        onClose={() => setIsNotifDrawerOpen(false)}
        onActionClick={handleNotificationAction}
      />

      {/* WhatsApp Integrated Modal */}
      <WaModal
        isOpen={isWaModalOpen}
        accounts={state.accounts}
        initialAccount={waTargetAccount}
        initialTemplate={waTemplateId}
        initialData={waExtraData}
        onClose={() => setIsWaModalOpen(false)}
        onLogged={handleWaLogged}
      />

      {/* Universal Excel Import & Database Synchronization Modal */}
      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        targetModule={importTargetModule}
        onClose={() => setIsExcelImportModalOpen(false)}
        onImportComplete={handleUniversalImport}
      />

      {/* Dedicated Admin Action Confirmation Modal (Iframe-Safe & Clean) */}
      <AdminConfirmModal
        isOpen={adminConfirmModal.isOpen}
        actionType={adminConfirmModal.actionType}
        title={adminConfirmModal.title}
        description={adminConfirmModal.description}
        confirmTextKeyword={adminConfirmModal.confirmKeyword}
        onClose={() => setAdminConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={adminConfirmModal.onConfirm}
      />
    </div>
  );
}
