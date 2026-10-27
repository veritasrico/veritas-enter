import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Presentation,
  Sparkles,
  Calendar,
  Users,
  Kanban,
  FileText,
  PhoneCall,
  Megaphone,
  FlaskConical,
  Activity,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  ShoppingCart,
  Package,
  Truck,
  Award,
  Contact,
  UserCheck,
  History,
  Settings,
  BookOpen,
  Cpu,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { Role, TabKey } from '../types';
import { VeritasLogo } from './VeritasLogo';

export type { TabKey };

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  roles?: Role[];
}

interface NavSection {
  title: string;
  categoryNumber: number;
  items: NavItem[];
}

interface SidebarProps {
  currentTab: TabKey;
  userRole: Role;
  allowedTabs?: TabKey[];
  referralAlertCount: number;
  overdueCount: number;
  onSelectTab: (tab: TabKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  userRole,
  allowedTabs,
  referralAlertCount,
  overdueCount,
  onSelectTab,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Executive Overview',
      categoryNumber: 1,
      items: [
        {
          key: 'dash',
          label: 'Dashboard Overview & KPI',
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          key: 'slide_export',
          label: 'Slide Rapat Direksi (10 Slide)',
          icon: <Presentation className="h-4 w-4 text-amber-500" />,
          badge: '10 Slide',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        },
        {
          key: 'ai_analytics',
          label: 'Analitik AI Real-Time',
          icon: <Sparkles className="h-4 w-4 text-indigo-500" />,
          badge: 'AI',
          badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
        },
        {
          key: 'cal',
          label: 'Kalender Terpadu & Jadwal',
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Sales & Customer',
      categoryNumber: 2,
      items: [
        {
          key: 'accounts',
          label: 'Kontak & Segmen CRM',
          icon: <Users className="h-4 w-4" />,
          badge: referralAlertCount > 0 ? `${referralAlertCount} Ref` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        },
        {
          key: 'deals',
          label: 'Papan Deal & Pipeline',
          icon: <Kanban className="h-4 w-4" />,
        },
        {
          key: 'quote',
          label: 'Penawaran Harga (Quotes)',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          key: 'cat',
          label: 'Katalog Layanan & Tarif',
          icon: <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
        },
        {
          key: 'acts',
          label: 'Aktivitas Sales & Follow-up',
          icon: <PhoneCall className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Marketing & Growth',
      categoryNumber: 3,
      items: [
        {
          key: 'mkt',
          label: 'Kampanye Digital & Leads',
          icon: <Megaphone className="h-4 w-4 text-emerald-500" />,
        },
      ],
    },
    {
      title: 'Laboratory Operations',
      categoryNumber: 4,
      items: [
        {
          key: 'labdash',
          label: 'Dashboard Lab (SID & Beban)',
          icon: <FlaskConical className="h-4 w-4 text-emerald-500" />,
          badge: 'SID',
          badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
        },
        {
          key: 'lab',
          label: 'Work Order & Pengujian',
          icon: <Activity className="h-4 w-4" />,
        },
        {
          key: 'insts',
          label: 'Master Instrumen & Kalibrasi',
          icon: <Cpu className="h-4 w-4 text-indigo-500" />,
          badge: overdueCount > 0 ? `${overdueCount}` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        },
        {
          key: 'instr',
          label: 'Utilisasi & Downtime Alat',
          icon: <ShieldAlert className="h-4 w-4 text-amber-500" />,
          badge: overdueCount > 0 ? `${overdueCount}` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        },
      ],
    },
    {
      title: 'Quality & Compliance',
      categoryNumber: 5,
      items: [
        {
          key: 'qcqa',
          label: 'Panel Mutu ISO/IEC 17025 & CAPA',
          icon: <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
          badge: 'KAN',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        },
      ],
    },
    {
      title: 'Finance & Accounting',
      categoryNumber: 6,
      items: [
        {
          key: 'fin',
          label: 'Keuangan, Invoice & AR Aging',
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          key: 'monthly_report',
          label: 'Laporan Bulanan & API',
          icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" />,
          badge: 'API',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        },
      ],
    },
    {
      title: 'Logistics & Supply Chain',
      categoryNumber: 7,
      items: [
        {
          key: 'procurement',
          label: 'Pengadaan & Purchase Order (PO)',
          icon: <ShoppingCart className="h-4 w-4 text-emerald-500" />,
        },
        {
          key: 'inv',
          label: 'Stok Reagen & Konsumabel',
          icon: <Package className="h-4 w-4" />,
        },
        {
          key: 'sample_logistics',
          label: 'Logistik Sampel & Cold Chain',
          icon: <Truck className="h-4 w-4 text-blue-500" />,
        },
      ],
    },
    {
      title: 'People & Administration',
      categoryNumber: 8,
      items: [
        {
          key: 'competency',
          label: 'Matriks Kompetensi Analis (6.2)',
          icon: <Award className="h-4 w-4 text-amber-500" />,
          badge: 'ISO',
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        },
        {
          key: 'employees',
          label: 'Direktori Staf & Personel',
          icon: <Contact className="h-4 w-4" />,
        },
        {
          key: 'users',
          label: 'Manajemen Akun & Hak Akses',
          icon: <UserCheck className="h-4 w-4 text-emerald-600" />,
          badge: 'Admin',
          badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
          roles: ['admin'],
        },
        {
          key: 'log',
          label: 'Log Book & Audit Trail',
          icon: <History className="h-4 w-4" />,
        },
        {
          key: 'set',
          label: 'Pengaturan & Reset Data',
          icon: <Settings className="h-4 w-4" />,
          roles: ['admin'],
        },
      ],
    },
  ];

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.roles && !item.roles.includes(userRole)) return false;
        if (userRole === 'admin') return true;
        if (allowedTabs && allowedTabs.length > 0) {
          return allowedTabs.includes(item.key);
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Initialize expanded state: active category expanded by default
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = { 1: true, 2: true };
    const activeSec = visibleSections.find((s) => s.items.some((i) => i.key === currentTab));
    if (activeSec) {
      initial[activeSec.categoryNumber] = true;
    }
    return initial;
  });

  // Auto-expand category when currentTab changes
  useEffect(() => {
    const activeSec = visibleSections.find((s) => s.items.some((i) => i.key === currentTab));
    if (activeSec) {
      setExpandedSections((prev) => ({
        ...prev,
        [activeSec.categoryNumber]: true,
      }));
    }
  }, [currentTab]);

  const toggleSection = (categoryNumber: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [categoryNumber]: !prev[categoryNumber],
    }));
  };

  const handleToggleAll = () => {
    const allExpanded = visibleSections.every((s) => expandedSections[s.categoryNumber]);
    const next: Record<number, boolean> = {};
    visibleSections.forEach((s) => {
      next[s.categoryNumber] = !allExpanded;
    });
    setExpandedSections(next);
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 h-full overflow-y-auto select-none pb-20 scrollbar-thin">
      {/* Brand Banner: VERITAS ENTER - Your Gateway to an Integrated Enterprise */}
      <div className="mb-3.5 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-sm border border-slate-700/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-400/30 p-1 shrink-0">
          <VeritasLogo className="h-6 w-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wide text-white uppercase">
              VERITAS ENTER
            </span>
          </div>
          <span className="text-[9px] text-emerald-300 font-medium truncate leading-tight">
            Your Gateway to an Integrated Enterprise
          </span>
        </div>
      </div>

      {/* Accordion / Collapse Controls */}
      <div className="mb-2 flex items-center justify-between px-1 text-[10px] text-slate-400 dark:text-slate-500">
        <span className="font-semibold uppercase tracking-wider text-[9.5px]">
          8 Menu Utama ({visibleSections.length})
        </span>
        <button
          onClick={handleToggleAll}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          title="Buka atau Tutup Seluruh Menu"
        >
          <ChevronsUpDown className="h-3 w-3" />
          <span>Toggle Semua</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {visibleSections.map((section) => {
          const isExpanded = !!expandedSections[section.categoryNumber];
          const hasActiveChild = section.items.some((i) => i.key === currentTab);

          return (
            <div
              key={section.categoryNumber}
              className={`rounded-xl border transition-all duration-150 ${
                hasActiveChild
                  ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/50 dark:bg-emerald-950/10'
                  : 'border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/30'
              }`}
            >
              {/* Category Header (Clickable to Collapse / Expand) */}
              <button
                type="button"
                onClick={() => toggleSection(section.categoryNumber)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl transition hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-[9px] font-extrabold ${
                      hasActiveChild
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {section.categoryNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold truncate ${
                      hasActiveChild
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {section.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-medium text-slate-400">
                    {section.items.length}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </div>
              </button>

              {/* Sub-items list (Collapsible) */}
              {isExpanded && (
                <nav className="space-y-0.5 px-1.5 pb-2 pt-0.5 animate-fadeIn">
                  {section.items.map((item) => {
                    const isActive = currentTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => onSelectTab(item.key)}
                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs font-semibold dark:bg-emerald-600'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span
                            className={
                              isActive
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200 shrink-0'
                            }
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
