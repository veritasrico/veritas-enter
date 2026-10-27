import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  Sparkles,
  Users,
  Kanban,
  Calendar,
  FlaskConical,
  Activity,
  ShieldAlert,
  Package,
  CreditCard,
  FileSpreadsheet,
  Presentation,
  History,
  Settings,
  PhoneCall,
  Megaphone,
  FileText,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Award,
  Contact,
  UserCheck,
  BookOpen,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { TabKey } from './Sidebar';
import { VeritasLogo } from './VeritasLogo';

interface MobileMenuModalProps {
  isOpen: boolean;
  currentTab: TabKey;
  userRole?: string;
  allowedTabs?: TabKey[];
  onSelectTab: (tab: TabKey) => void;
  onClose: () => void;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
  isOpen,
  currentTab,
  userRole,
  allowedTabs,
  onSelectTab,
  onClose,
}) => {
  const menuSections = [
    {
      num: 1,
      title: '1. Executive Overview',
      items: [
        { key: 'dash' as TabKey, label: 'Dashboard Overview & KPI', icon: <LayoutDashboard className="h-4 w-4" /> },
        { key: 'slide_export' as TabKey, label: 'Slide Rapat Direksi (10 Slide)', icon: <Presentation className="h-4 w-4 text-amber-500" /> },
        { key: 'ai_analytics' as TabKey, label: 'Analitik AI Real-Time', icon: <Sparkles className="h-4 w-4 text-indigo-500" /> },
        { key: 'cal' as TabKey, label: 'Kalender Terpadu & Jadwal', icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      num: 2,
      title: '2. Sales & Customer',
      items: [
        { key: 'accounts' as TabKey, label: 'Kontak & Segmen CRM', icon: <Users className="h-4 w-4" /> },
        { key: 'deals' as TabKey, label: 'Papan Deal & Pipeline', icon: <Kanban className="h-4 w-4" /> },
        { key: 'quote' as TabKey, label: 'Penawaran Harga (Quotes)', icon: <FileText className="h-4 w-4" /> },
        { key: 'cat' as TabKey, label: 'Katalog Layanan & Tarif', icon: <BookOpen className="h-4 w-4 text-emerald-500" /> },
        { key: 'acts' as TabKey, label: 'Aktivitas Sales & Follow-up', icon: <PhoneCall className="h-4 w-4" /> },
      ],
    },
    {
      num: 3,
      title: '3. Marketing & Growth',
      items: [
        { key: 'mkt' as TabKey, label: 'Kampanye Digital & Leads', icon: <Megaphone className="h-4 w-4 text-emerald-500" /> },
      ],
    },
    {
      num: 4,
      title: '4. Laboratory Operations',
      items: [
        { key: 'labdash' as TabKey, label: 'Dashboard Lab (SID & Beban)', icon: <FlaskConical className="h-4 w-4 text-emerald-500" /> },
        { key: 'lab' as TabKey, label: 'Work Order & Pengujian', icon: <Activity className="h-4 w-4" /> },
        { key: 'insts' as TabKey, label: 'Master Instrumen & Kalibrasi', icon: <Cpu className="h-4 w-4 text-indigo-500" /> },
        { key: 'instr' as TabKey, label: 'Utilisasi & Downtime Alat', icon: <ShieldAlert className="h-4 w-4 text-amber-500" /> },
      ],
    },
    {
      num: 5,
      title: '5. Quality & Compliance',
      items: [
        { key: 'qcqa' as TabKey, label: 'Panel Mutu ISO/IEC 17025 & CAPA', icon: <ShieldCheck className="h-4 w-4 text-emerald-600" /> },
      ],
    },
    {
      num: 6,
      title: '6. Finance & Accounting',
      items: [
        { key: 'fin' as TabKey, label: 'Keuangan, Invoice & AR Aging', icon: <CreditCard className="h-4 w-4" /> },
        { key: 'monthly_report' as TabKey, label: 'Laporan Bulanan & API', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> },
      ],
    },
    {
      num: 7,
      title: '7. Logistics & Supply Chain',
      items: [
        { key: 'procurement' as TabKey, label: 'Pengadaan & Purchase Order (PO)', icon: <ShoppingCart className="h-4 w-4 text-emerald-500" /> },
        { key: 'inv' as TabKey, label: 'Stok Reagen & Konsumabel', icon: <Package className="h-4 w-4" /> },
        { key: 'sample_logistics' as TabKey, label: 'Logistik Sampel & Cold Chain', icon: <Truck className="h-4 w-4 text-blue-500" /> },
      ],
    },
    {
      num: 8,
      title: '8. People & Administration',
      items: [
        { key: 'competency' as TabKey, label: 'Matriks Kompetensi Analis (6.2)', icon: <Award className="h-4 w-4 text-amber-500" /> },
        { key: 'employees' as TabKey, label: 'Direktori Staf & Personel', icon: <Contact className="h-4 w-4" /> },
        { key: 'users' as TabKey, label: 'Manajemen Akun & Hak Akses', icon: <UserCheck className="h-4 w-4 text-emerald-600" />, roles: ['admin'] },
        { key: 'log' as TabKey, label: 'Log Book & Audit Trail', icon: <History className="h-4 w-4" /> },
        { key: 'set' as TabKey, label: 'Pengaturan & Reset Data', icon: <Settings className="h-4 w-4" />, roles: ['admin'] },
      ],
    },
  ];

  const visibleMenuSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.roles && userRole && !item.roles.includes(userRole)) return false;
        if (userRole === 'admin') return true;
        if (allowedTabs && allowedTabs.length > 0) {
          return allowedTabs.includes(item.key);
        }
        return true;
      }),
    }))
    .filter((s) => s.items.length > 0);

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    visibleMenuSections.forEach((s) => {
      const hasActive = s.items.some((i) => i.key === currentTab);
      initial[s.num] = hasActive || s.num === 1;
    });
    return initial;
  });

  if (!isOpen) return null;

  const toggleSection = (num: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <VeritasLogo className="h-6 w-6" />
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase text-emerald-400">
                VERITAS ENTER
              </h3>
              <p className="text-[10px] text-slate-300">Your Gateway to an Integrated Enterprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content list with collapsible accordions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {visibleMenuSections.map((section) => {
            const isExpanded = !!expandedSections[section.num];
            const hasActiveChild = section.items.some((i) => i.key === currentTab);

            return (
              <div
                key={section.num}
                className={`rounded-xl border transition ${
                  hasActiveChild
                    ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.num)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition"
                >
                  <span
                    className={`text-[11px] font-bold ${
                      hasActiveChild ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {section.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {section.items.length} menu
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-1 gap-1 px-2 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    {section.items.map((item) => {
                      const isActive = currentTab === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            onSelectTab(item.key);
                            onClose();
                          }}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
