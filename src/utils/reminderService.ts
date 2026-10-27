import { AppNotification, AppState } from '../types';
import { today } from './seedData';

export function generateReminders(state: AppState): AppNotification[] {
  const notifs: AppNotification[] = [];
  const curDate = today();

  // 1. Referral Follow-up Signals (High Priority CRM notifications)
  state.accounts
    .filter((a) => a.source === 'Referral')
    .forEach((acc) => {
      // Check if there is any completed follow-up activity today
      const hasRecentActivity = state.acts.some(
        (act) => act.accId === acc.id && act.date >= curDate
      );

      if (!hasRecentActivity) {
        notifs.push({
          id: `ref-${acc.id}`,
          type: 'referral',
          title: `Sinyal Follow-Up Referral: ${acc.name}`,
          message: `Klien referral dari ${acc.pic} (${acc.industry || 'Segmen Umum'}). Segera hubungi untuk menjaga konversi lead referral yang bernilai tinggi.`,
          date: curDate,
          urgency: 'high',
          relatedId: acc.id,
          actionLabel: 'Hubungi via WA',
          actionType: 'wa',
        });
      }
    });

  // 2. Instrument Calibration Due / Overdue
  state.insts.forEach((inst) => {
    let nextCalDate = inst.next;
    if (!nextCalDate && inst.last && inst.int > 0) {
      const d = new Date(inst.last + 'T00:00:00');
      d.setDate(d.getDate() + inst.int);
      nextCalDate = d.toISOString().slice(0, 10);
    }

    if (nextCalDate) {
      const diffDays = Math.round(
        (new Date(nextCalDate + 'T00:00:00').getTime() - new Date(curDate + 'T00:00:00').getTime()) / 864e5
      );

      if (diffDays < 0) {
        notifs.push({
          id: `cal-overdue-${inst.id}`,
          type: 'calibration',
          title: `Kalibrasi Terlambat: ${inst.name}`,
          message: `Instrumen ${inst.name} (${inst.brand}) telah melewati batas kalibrasi (${Math.abs(diffDays)} hari lalu). KAN/ISO 17025 mewajibkan re-kalibrasi.`,
          date: nextCalDate,
          urgency: 'high',
          relatedId: inst.id,
          actionLabel: 'Lihat Master Instrumen',
          actionType: 'view_lab',
        });
      } else if (diffDays <= 30) {
        notifs.push({
          id: `cal-soon-${inst.id}`,
          type: 'calibration',
          title: `Pengingat Kalibrasi: ${inst.name}`,
          message: `Instrumen ${inst.name} jatuh tempo kalibrasi dalam ${diffDays} hari (${nextCalDate}). Harap koordinasi dengan PIC (${inst.pic || '-'}).`,
          date: nextCalDate,
          urgency: diffDays <= 7 ? 'high' : 'medium',
          relatedId: inst.id,
          actionLabel: 'Jadwalkan Kalibrasi',
          actionType: 'view_lab',
        });
      }
    }

    // 3. Preventive Maintenance (PM) Due
    let nextPm = inst.pmNext;
    if (!nextPm && inst.pmLast && inst.pmInt > 0) {
      const d = new Date(inst.pmLast + 'T00:00:00');
      d.setDate(d.getDate() + inst.pmInt);
      nextPm = d.toISOString().slice(0, 10);
    }

    if (nextPm) {
      const diffDays = Math.round(
        (new Date(nextPm + 'T00:00:00').getTime() - new Date(curDate + 'T00:00:00').getTime()) / 864e5
      );
      if (diffDays <= 15) {
        notifs.push({
          id: `pm-${inst.id}`,
          type: 'pm',
          title: `Jadwal PM Instrumen: ${inst.name}`,
          message: `Preventive Maintenance untuk ${inst.name} jatuh tempo ${diffDays < 0 ? `${Math.abs(diffDays)} hari lalu` : `dalam ${diffDays} hari`}.`,
          date: nextPm,
          urgency: diffDays < 0 ? 'high' : 'medium',
          relatedId: inst.id,
          actionLabel: 'Periksa Jadwal PM',
          actionType: 'view_lab',
        });
      }
    }
  });

  // 4. Overdue Invoices & Pending Billing
  state.fins.forEach((inv) => {
    const sisa = (Number(inv.amount) || 0) - (Number(inv.paid) || 0);
    if (sisa > 0 && inv.due && inv.due < curDate) {
      const diff = Math.round(
        (new Date(curDate + 'T00:00:00').getTime() - new Date(inv.due + 'T00:00:00').getTime()) / 864e5
      );
      const client = state.accounts.find((a) => a.id === inv.accId);
      notifs.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        title: `Invoice Jatuh Tempo: ${inv.no}`,
        message: `Tagihan untuk ${client?.name || 'Customer'} senilai Rp ${sisa.toLocaleString('id-ID')} telah jatuh tempo ${diff} hari. Kirim pengingat pembayaran otomatis via WhatsApp.`,
        date: inv.due,
        urgency: 'high',
        relatedId: inv.id,
        actionLabel: 'Kirim WA Reminder',
        actionType: 'wa',
      });
    }
  });

  // 5. Low Inventory Consumables
  state.inv.forEach((item) => {
    if ((Number(item.stock) || 0) <= (Number(item.min) || 0)) {
      notifs.push({
        id: `invm-${item.id}`,
        type: 'reminder',
        title: `Stok Kritis: ${item.name}`,
        message: `Sisa stok: ${item.stock} ${item.unit} (Batas minimum: ${item.min} ${item.unit}) untuk instrumen ${item.inst || 'Umum'}.`,
        date: curDate,
        urgency: 'medium',
        relatedId: item.id,
      });
    }
  });

  // 6. Lab Pending Backlog
  const pendingLabs = state.labs.filter((l) => (Number(l.masuk) || 0) > (Number(l.analisa) || 0));
  if (pendingLabs.length > 0) {
    const totalSisa = pendingLabs.reduce((s, l) => s + Math.max(0, (Number(l.masuk) || 0) - (Number(l.analisa) || 0)), 0);
    notifs.push({
      id: `lab-backlog-${curDate}`,
      type: 'lab',
      title: `Antrean Sampel Lab: ${totalSisa} Sampel Belum Teranalisa`,
      message: `Terdapat ${pendingLabs.length} work order dengan total sisa ${totalSisa} sampel dalam proses running atau menunggu giliran instrumen.`,
      date: curDate,
      urgency: totalSisa > 10 ? 'high' : 'medium',
      actionLabel: 'Lihat Dashboard Lab',
      actionType: 'view_lab',
    });
  }

  // Sort by urgency: high first
  const weight = { high: 0, medium: 1, low: 2 };
  return notifs.sort((a, b) => weight[a.urgency] - weight[b.urgency]);
}
