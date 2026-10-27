import React, { useState } from 'react';
import {
  Smartphone,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Type,
  Battery,
  Wifi,
  Signal,
  Home,
  Users,
  FlaskConical,
  Menu,
  MessageCircle,
  Sliders,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { TabKey } from './Sidebar';
import { VeritasLogo } from './VeritasLogo';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenWa: () => void;
  onOpenMenu: () => void;
}

export type MobileDeviceModel = 'iphone16' | 'galaxy' | 'compact' | 'responsive';

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  currentTab,
  onSelectTab,
  onOpenWa,
  onOpenMenu,
}) => {
  const [deviceModel, setDeviceModel] = useState<MobileDeviceModel>('iphone16');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scale, setScale] = useState<number>(0.92);
  // Default font scale: 0.72 (72%) for comfortable, compact mobile reading
  const [fontScale, setFontScale] = useState<number>(0.72);
  const [density, setDensity] = useState<'compact' | 'normal'>('compact');
  const [showBezel, setShowBezel] = useState<boolean>(true);

  // Dimensions based on model
  const dimensions = {
    iphone16: { w: 393, h: 852, name: 'iPhone 16 Pro (393x852)' },
    galaxy: { w: 412, h: 915, name: 'Galaxy S24 (412x915)' },
    compact: { w: 360, h: 780, name: 'Compact Phone (360x780)' },
    responsive: { w: 430, h: 880, name: 'Layar Penuh Ponsel' },
  };

  const curDim = dimensions[deviceModel];
  const width = orientation === 'portrait' ? curDim.w : curDim.h;
  const height = orientation === 'portrait' ? curDim.h : curDim.w;

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fontPresets = [
    { label: 'Mikro (55%)', value: 0.55 },
    { label: 'Ekstra Kecil (65%)', value: 0.65 },
    { label: 'Kompak (72% Rekomendasi)', value: 0.72 },
    { label: 'Sedang (80%)', value: 0.8 },
    { label: 'Standar (100%)', value: 1.0 },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-full py-2.5 px-2 bg-slate-900/10 dark:bg-slate-950">
      {/* Mobile Adjustment Control Bar */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 shadow-md dark:border-slate-800 dark:bg-slate-900 w-full max-w-5xl">
        {/* Title & Status */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs dark:border-slate-800 dark:bg-slate-800">
            <VeritasLogo className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Penyesuaian Mobile
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300">
                Ukuran Font: {Math.round(fontScale * 100)}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Pengaturan ukuran font &amp; kepadatan khusus tampilan layar ponsel
            </span>
          </div>
        </div>

        {/* Adjustments: Device model, Orientation, Zoom, Font Size, Density, Bezel */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* FONT SIZE ADJUSTMENT CONTROLLER (PRIMARY) */}
          <div className="flex items-center rounded-xl border border-emerald-300 bg-emerald-50/70 p-1 dark:border-emerald-800 dark:bg-emerald-950/40">
            <Type className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 ml-1 mr-1" />
            
            {/* Quick buttons A- / A+ */}
            <button
              onClick={() => setFontScale((f) => Math.max(0.5, Math.round((f - 0.05) * 100) / 100))}
              className="flex h-6 w-6 items-center justify-center rounded-md font-bold text-xs text-emerald-900 hover:bg-emerald-200/80 active:scale-95 dark:text-emerald-200 dark:hover:bg-emerald-900 transition"
              title="Perkecil Font (-5%)"
            >
              A-
            </button>
            
            <span className="min-w-10 text-center font-mono text-[11px] font-black text-emerald-900 dark:text-emerald-300">
              {Math.round(fontScale * 100)}%
            </span>

            <button
              onClick={() => setFontScale((f) => Math.min(1.2, Math.round((f + 0.05) * 100) / 100))}
              className="flex h-6 w-6 items-center justify-center rounded-md font-bold text-xs text-emerald-900 hover:bg-emerald-200/80 active:scale-95 dark:text-emerald-200 dark:hover:bg-emerald-900 transition"
              title="Perbesar Font (+5%)"
            >
              A+
            </button>

            {/* Quick Presets Dropdown */}
            <select
              value={fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
              className="ml-1 rounded-md border border-emerald-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-900 dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
            >
              {fontPresets.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Font Size Buttons for instant 1-click adjustment */}
          <div className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/60">
            {[0.6, 0.68, 0.72, 0.8, 1.0].map((val) => (
              <button
                key={val}
                onClick={() => setFontScale(val)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                  fontScale === val
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {Math.round(val * 100)}%
              </button>
            ))}
          </div>

          {/* Density Toggle (Kerapatan Tata Letak) */}
          <button
            onClick={() => setDensity((d) => (d === 'compact' ? 'normal' : 'compact'))}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
              density === 'compact'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800'
            }`}
            title="Kerapatan Margin &amp; Padding Layar"
          >
            <Sliders className="h-3 w-3" />
            <span>{density === 'compact' ? 'Kerapatan: Ekstra Kompak' : 'Kerapatan: Normal'}</span>
          </button>

          {/* Device Model Picker */}
          <select
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value as MobileDeviceModel)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="iphone16">iPhone 16 (393px)</option>
            <option value="galaxy">Galaxy S24 (412px)</option>
            <option value="compact">Compact (360px)</option>
            <option value="responsive">Layar Penuh (430px)</option>
          </select>

          {/* Orientation */}
          <button
            onClick={() => setOrientation((o) => (o === 'portrait' ? 'landscape' : 'portrait'))}
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Putar Orientasi Ponsel"
          >
            <RotateCw className="h-3 w-3" />
            <span className="hidden sm:inline">{orientation === 'portrait' ? 'Potret' : 'Lanskap'}</span>
          </button>

          {/* Scale Frame Zoom */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setScale((s) => Math.max(0.65, Math.round((s - 0.05) * 100) / 100))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l"
              title="Perkecil Kanvas HP"
            >
              <ZoomOut className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            </button>
            <span className="px-1 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(1.05, Math.round((s + 0.05) * 100) / 100))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r"
              title="Perbesar Kanvas HP"
            >
              <ZoomIn className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Bezel Toggle */}
          <button
            onClick={() => setShowBezel((b) => !b)}
            className={`rounded-lg border px-2 py-1 text-xs font-medium transition ${
              showBezel
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800'
            }`}
            title="Toggle Bingkai Handphone"
          >
            {showBezel ? 'Bezel ON' : 'Bezel OFF'}
          </button>
        </div>
      </div>

      {/* Realistic Device Shell with Dynamic Font Sizing & Compact Density */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'all 0.2s ease-out',
        }}
        className="relative"
      >
        <div
          style={{ width: `${width}px`, height: `${height}px` }}
          className={`relative flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-all ${
            showBezel
              ? 'rounded-[44px] border-[12px] border-slate-900 shadow-2xl shadow-slate-950/60 ring-1 ring-slate-800/20'
              : 'rounded-2xl border border-slate-300 shadow-xl dark:border-slate-800'
          }`}
        >
          {/* Mobile Status Bar */}
          <div className="flex h-10 w-full items-center justify-between px-5 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-semibold z-40 select-none border-b border-slate-100 dark:border-slate-800">
            <span className="font-mono text-[11px]">{currentTime}</span>

            {/* Dynamic Island / Notch */}
            {orientation === 'portrait' && showBezel && (
              <div className="absolute left-1/2 top-2 -translate-x-1/2 flex items-center justify-center h-5 w-24 rounded-full bg-slate-950 px-2 shadow-inner">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                <span className="text-[8px] text-emerald-400 font-mono tracking-tight">Veritas HP</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[10px]">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Mobile App Canvas Content Area with Scalable Font Size & Density Overrides */}
          <div
            className={`flex-1 overflow-y-auto px-3 py-2 pb-16 select-text mobile-font-wrapper ${
              density === 'compact' ? 'mobile-density-compact' : ''
            }`}
            style={
              {
                '--mobile-font-scale': fontScale,
                fontSize: `calc(13px * ${fontScale})`,
              } as React.CSSProperties
            }
          >
            {children}
          </div>

          {/* Bottom Dock Navigation for Mobile Device */}
          <div className="absolute bottom-0 inset-x-0 h-14 bg-white/95 border-t border-slate-200 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-around px-2 z-40">
            <button
              onClick={() => onSelectTab('dash')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'dash'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => onSelectTab('accounts')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'accounts'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Kontak</span>
            </button>

            {/* Quick WA Floating Button */}
            <button
              onClick={onOpenWa}
              className="flex h-9 w-9 -mt-3 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-95"
              title="Kirim Pesan WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>

            <button
              onClick={() => onSelectTab('labdash')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold transition ${
                currentTab === 'labdash'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Lab</span>
            </button>

            <button
              onClick={onOpenMenu}
              className="flex flex-col items-center gap-0.5 text-[9px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400"
            >
              <Menu className="h-3.5 w-3.5" />
              <span>Menu</span>
            </button>
          </div>

          {/* Home Bar Indicator (iOS style) */}
          {showBezel && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-28 rounded-full bg-slate-300 dark:bg-slate-700 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};
