import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, ExternalLink, Check, Copy } from 'lucide-react';
import { Account } from '../types';
import { WA_TEMPLATES, buildWaUrl, sendWaNotice } from '../utils/waService';

interface WaModalProps {
  isOpen: boolean;
  accounts: Account[];
  initialAccount?: Account | null;
  initialTemplate?: string;
  initialData?: any;
  onClose: () => void;
  onLogged: (recipient: string, message: string) => void;
}

export const WaModal: React.FC<WaModalProps> = ({
  isOpen,
  accounts,
  initialAccount,
  initialTemplate = 'referral_followup',
  initialData,
  onClose,
  onLogged,
}) => {
  const [selectedAccId, setSelectedAccId] = useState<string>(initialAccount?.id || '');
  const [phone, setPhone] = useState<string>(initialAccount?.phone || '');
  const [clientName, setClientName] = useState<string>(initialAccount?.name || '');
  const [templateId, setTemplateId] = useState<string>(initialTemplate);
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string>('');

  useEffect(() => {
    if (initialAccount) {
      setSelectedAccId(initialAccount.id);
      setPhone(initialAccount.phone);
      setClientName(initialAccount.name);
    } else if (accounts.length > 0 && !selectedAccId) {
      const first = accounts[0];
      setSelectedAccId(first.id);
      setPhone(first.phone);
      setClientName(first.name);
    }
  }, [initialAccount, accounts]);

  useEffect(() => {
    const acc = accounts.find((a) => a.id === selectedAccId);
    const tmpl = WA_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      const mergedData = {
        name: acc?.name || clientName || 'Bapak/Ibu',
        pic: acc?.pic || '',
        email: acc?.email || '',
        phone: acc?.phone || phone,
        quoteNo: initialData?.quoteNo || 'QT-2026-001',
        perihal: initialData?.perihal || 'Pengujian Laboratorium',
        amount: initialData?.amount || 16095000,
        sid: initialData?.sid || 'SMP-VRT-2026-001',
        service: initialData?.service || 'XRD & SEM',
        invoiceNo: initialData?.invoiceNo || 'INV-2026-002',
        due: initialData?.due || '2026-10-15',
        bank: 'Bank Mandiri No. Rek: 133-00-987654-1 a.n. PT NUSA VERITAS INSPEKTAMA',
      };
      setMessageText(tmpl.template(mergedData));
    }
  }, [selectedAccId, templateId, clientName, phone, accounts, initialData]);

  if (!isOpen) return null;

  const handleAccountChange = (id: string) => {
    setSelectedAccId(id);
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      setPhone(acc.phone);
      setClientName(acc.name);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWaWeb = () => {
    const url = buildWaUrl(phone, messageText);
    window.open(url, '_blank');
    onLogged(clientName || phone, messageText);
    setDispatchStatus('WhatsApp Web terbuka di tab baru & tercatat di Log');
  };

  const handleSendApi = async () => {
    setSending(true);
    setDispatchStatus('Menghubungkan ke Gateway WhatsApp...');
    try {
      const res = await sendWaNotice({
        phone,
        clientName,
        templateId,
        customText: messageText,
      });
      setSending(false);
      setDispatchStatus(`Terkirim via WhatsApp Gateway: ${res.directUrl || 'Sukses'}`);
      onLogged(clientName || phone, messageText);
    } catch (e: any) {
      setSending(false);
      setDispatchStatus('Gagal melalui gateway, membuka WhatsApp Web secara langsung...');
      handleOpenWaWeb();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Integrasi Layanan WhatsApp Veritas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kirim follow-up referral, notifikasi penawaran, update lab &amp; tagihan secara instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Pilih Kontak / Customer
              </label>
              <select
                value={selectedAccId}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">- Kontak Manual / Custom -</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.pic || a.industry}) - {a.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nomor WhatsApp Tujuan
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 082284176470 atau 62812..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Pilih Template Pesan Cepat
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {WA_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setTemplateId(tmpl.id)}
                  className={`rounded-lg border p-2 text-left text-xs font-medium transition ${
                    templateId === tmpl.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Isi Pesan WhatsApp
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Tersalin' : 'Salin Teks'}
              </button>
            </div>
            <textarea
              rows={7}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-900 font-sans dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
            />
          </div>

          {dispatchStatus && (
            <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {dispatchStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
          >
            Tutup
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendApi}
              disabled={sending || !phone}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sending ? 'Mengirim...' : 'Kirim via API Gateway'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenWaWeb}
              disabled={!phone}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka di WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
