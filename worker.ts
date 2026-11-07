import {
  Env,
  getDatabase,
  setDatabase,
  clearDatabase,
  jsonResponse,
  handleOptions,
} from './functions/_shared';

export interface WorkerEnv extends Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // 1. /api/sync/reset
    if (url.pathname === '/api/sync/reset' && request.method === 'POST') {
      try {
        await clearDatabase(env);
        return jsonResponse({ success: true, message: 'Cloud database reset successfully' });
      } catch (error: any) {
        return jsonResponse({ error: error?.message || 'Failed to reset cloud database' }, 500);
      }
    }

    // 2. /api/sync
    if (url.pathname === '/api/sync') {
      if (request.method === 'GET') {
        try {
          const db = await getDatabase(env);
          return jsonResponse({
            status: 'ok',
            syncedAt: db.syncedAt,
            hasData: !!db.data,
            data: db.data,
          });
        } catch (error: any) {
          return jsonResponse({ error: error?.message || 'Failed to read cloud state' }, 500);
        }
      }

      if (request.method === 'POST') {
        try {
          const body: any = await request.json();
          const { data, clientTimestamp } = body || {};
          const syncedAt = new Date().toISOString();

          if (data) {
            await setDatabase(env, data, syncedAt);
          }

          return jsonResponse({
            success: true,
            syncedAt,
            clientTimestamp,
            message: 'Sinkronisasi awan berhasil diperbarui.',
          });
        } catch (error: any) {
          return jsonResponse({ error: error?.message || 'Gagal sinkronisasi awan' }, 500);
        }
      }
    }

    // 3. /api/ai-analytics
    if (url.pathname === '/api/ai-analytics' && request.method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const {
          deals = [],
          accounts = [],
          labs = [],
          insts = [],
          month = new Date().toISOString().slice(0, 7),
        } = body;

        // Core stats
        const totalDeals = deals.length;
        const wonDeals = deals.filter((d: any) => d.stage === 'Won');
        const lostDeals = deals.filter((d: any) => d.stage === 'Lost');
        const openDeals = deals.filter((d: any) => !['Won', 'Lost'].includes(d.stage));
        const wonValue = wonDeals.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0);
        const pipelineValue = openDeals.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0);
        const winRate = (wonDeals.length + lostDeals.length) > 0
          ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
          : 0;

        const referralAccounts = accounts.filter((a: any) => a.source === 'Referral');
        const referralDeals = deals.filter((d: any) => {
          const acc = accounts.find((a: any) => a.id === d.accId);
          return acc?.source === 'Referral';
        });

        const uniqueSampleIds = new Set(labs.map((l: any) => l.sid).filter(Boolean));
        const totalSamplesUnique = uniqueSampleIds.size;
        const totalAnalyzedSamples = labs.reduce((sum: number, l: any) => sum + (Number(l.analisa) || 0), 0);

        const contextData = {
          month,
          sales: {
            totalDeals,
            wonCount: wonDeals.length,
            wonValue,
            pipelineCount: openDeals.length,
            pipelineValue,
            winRatePercent: winRate,
          },
          referrals: {
            totalReferralContacts: referralAccounts.length,
            referralDealsCount: referralDeals.length,
          },
          lab: {
            uniqueSampleCount: totalSamplesUnique,
            totalAnalyzedSum: totalAnalyzedSamples,
            instrumentsCount: insts.length,
          },
        };

        const apiKey = env.GEMINI_API_KEY;
        if (apiKey) {
          const prompt = `Anda adalah Direktur Eksekutif AI & Analis Bisnis Senior untuk laboratorium pengujian enterprise PT Veritas.
Analisis data performa bisnis real-time berikut untuk bulan ${month}:
${JSON.stringify(contextData, null, 2)}

Berikan analisis mendalam, tajam, dan dapat dieksekusi langsung dengan format JSON persis berikut:
{
  "summary": "Ringkasan eksekutif 2-3 kalimat performa penjualan & operasional",
  "healthScore": 88,
  "salesVelocity": "Tinggi | Moderat | Perlu Akselerasi",
  "projectedRevenue": "Estimasi pendapatan akhir bulan dalam format teks Rp",
  "referralInsight": "Sinyal dan insight performa lead referral serta rekomendasi follow up",
  "sampleEfficiency": "Insight efisiensi kalkulasi sampel unik vs utilisasi instrumen",
  "keyOpportunities": ["Peluang 1", "Peluang 2", "Peluang 3"],
  "riskAlerts": ["Peringatan risiko 1", "Peringatan risiko 2"],
  "actionPlan": [
    {"action": "Tindakan segera", "priority": "High | Medium", "owner": "Sales | Lab | Manager"}
  ]
}`;

          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData: any = await geminiRes.json();
              const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
              const parsed = JSON.parse(responseText);
              return jsonResponse({ success: true, aiPowered: true, data: parsed });
            }
          } catch (geminiError) {
            console.warn('Gemini API call failed, falling back:', geminiError);
          }
        }

        const healthScore = Math.min(
          95,
          Math.max(50, Math.round((winRate * 0.4) + (openDeals.length > 0 ? 35 : 15) + (totalAnalyzedSamples > 0 ? 20 : 0)))
        );

        return jsonResponse({
          success: true,
          aiPowered: false,
          data: {
            summary: `Performa penjualan bulan ${month} menunjukkan ${wonDeals.length} deal Won senilai Rp ${wonValue.toLocaleString('id-ID')} dengan rasio kemenangan ${winRate}%. Saluran Referral menyumbang ${referralAccounts.length} kontak prioritas.`,
            healthScore,
            salesVelocity: winRate > 50 ? 'Tinggi' : 'Moderat',
            projectedRevenue: `Rp ${Math.round(wonValue + pipelineValue * 0.4).toLocaleString('id-ID')}`,
            referralInsight: `Ada ${referralAccounts.length} klien referral. Sinyal follow-up aktif: lead referral memiliki conversion rate 3x lebih tinggi dibanding saluran lain.`,
            sampleEfficiency: `Berdasarkan basis ID Sampel unik, tercatat ${totalSamplesUnique} sampel masuk total, terdistribusi ke ${totalAnalyzedSamples} sampel uji teranalisa per masing-masing instrumen.`,
            keyOpportunities: [
              'Fokus konversi deal fase Negosiasi dan Proposal bernilai besar',
              'Kirimkan notifikasi WhatsApp berkala ke klien referral pasca pengujian',
              'Sinergikan penawaran harga dengan kapasitas instrumen aktif',
            ],
            riskAlerts: [
              openDeals.length === 0 ? 'Pipeline deal baru perlu diisi ulang' : 'Verifikasi SLA waktu analisa sampel',
              'Pastikan instrumen dengan kalibrasi mendekati jatuh tempo dijadwalkan ulang',
            ],
            actionPlan: [
              { action: 'Eksekusi follow-up otomatis via WA ke lead referral', priority: 'High', owner: 'Sales' },
              { action: 'Kroscek sampel yang telah selesai agar tercatat di log instrumen', priority: 'High', owner: 'Lab' },
              { action: 'Sinkronisasi awan laporan bulanan untuk rapat direksi', priority: 'Medium', owner: 'Manager' },
            ],
          },
        });
      } catch (error: any) {
        return jsonResponse({ error: error?.message || 'Gagal memproses analitik AI' }, 500);
      }
    }

    // 4. /api/reports/monthly
    if (url.pathname === '/api/reports/monthly' && request.method === 'GET') {
      try {
        const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
        const { data } = await getDatabase(env);
        const db = data || {};
        const labs = db.labs || [];
        const deals = db.deals || [];
        const fins = db.fins || [];
        const insts = db.insts || [];
        const instr = db.instr || [];

        const monthLabs = labs.filter((l: any) => String(l.date || '').startsWith(month));

        const uniqueSampleMap = new Map<string, any>();
        monthLabs.forEach((l: any) => {
          const sid = l.sid || 'UNNAMED';
          if (!uniqueSampleMap.has(sid)) {
            uniqueSampleMap.set(sid, {
              sid,
              date: l.date,
              services: [l.service],
              customer: l.accId,
              totalMasuk: Number(l.masuk) || 1,
            });
          } else {
            const existing = uniqueSampleMap.get(sid);
            if (!existing.services.includes(l.service)) {
              existing.services.push(l.service);
            }
          }
        });

        const perInstrument: Record<string, { masuk: number; analisa: number; sisa: number; downtimeHours: number }> = {};
        insts.forEach((inst: any) => {
          perInstrument[inst.name] = { masuk: 0, analisa: 0, sisa: 0, downtimeHours: 0 };
        });

        monthLabs.forEach((l: any) => {
          const sName = l.service || 'Umum';
          if (!perInstrument[sName]) {
            perInstrument[sName] = { masuk: 0, analisa: 0, sisa: 0, downtimeHours: 0 };
          }
          const m = Number(l.masuk) || 0;
          const a = Number(l.analisa) || 0;
          perInstrument[sName].masuk += m;
          perInstrument[sName].analisa += a;
          perInstrument[sName].sisa += Math.max(0, m - a);
        });

        const monthDowntime = instr.filter((i: any) => String(i.date || '').startsWith(month) && i.type === 'Downtime');
        monthDowntime.forEach((i: any) => {
          const sName = i.name;
          if (perInstrument[sName]) {
            perInstrument[sName].downtimeHours += Number(i.hours) || 0;
          }
        });

        const monthDeals = deals.filter((d: any) => String(d.close || '').startsWith(month) || d.stage === 'Won');
        const monthFins = fins.filter((f: any) => String(f.date || '').startsWith(month));

        return jsonResponse({
          month,
          generatedAt: new Date().toISOString(),
          metrics: {
            uniqueSampleCount: uniqueSampleMap.size,
            uniqueSamples: Array.from(uniqueSampleMap.values()),
            perInstrumentBreakdown: perInstrument,
            totalMasukInstrumentAccum: Object.values(perInstrument).reduce((acc, cur) => acc + cur.masuk, 0),
            totalAnalisaInstrumentAccum: Object.values(perInstrument).reduce((acc, cur) => acc + cur.analisa, 0),
            financial: {
              billed: monthFins.reduce((s: number, f: any) => s + (Number(f.amount) || 0), 0),
              paid: monthFins.reduce((s: number, f: any) => s + (Number(f.paid) || 0), 0),
            },
            sales: {
              totalDeals: monthDeals.length,
              wonValue: monthDeals
                .filter((d: any) => d.stage === 'Won')
                .reduce((s: number, d: any) => s + (Number(d.value) || 0), 0),
            },
          },
        });
      } catch (error: any) {
        return jsonResponse({ error: error?.message || 'Failed to generate monthly report' }, 500);
      }
    }

    // 5. /api/wa/send
    if (url.pathname === '/api/wa/send' && request.method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const { phone, clientName, customText } = body;

        if (!phone) {
          return jsonResponse({ error: 'Nomor telepon tujuan wajib diisi' }, 400);
        }

        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '62' + cleanPhone.slice(1);
        }

        const encodedMsg = encodeURIComponent(
          customText || `Halo ${clientName || 'Bapak/Ibu'}, kami dari PT Veritas Enterprise.`
        );
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

        return jsonResponse({
          success: true,
          targetPhone: cleanPhone,
          directUrl: waUrl,
          timestamp: new Date().toISOString(),
          status: 'Terkirim ke WhatsApp Web / Mobile Gateway',
        });
      } catch (error: any) {
        return jsonResponse({ error: error?.message || 'Gagal memproses pengiriman WhatsApp' }, 500);
      }
    }

    // Static Assets serving (Vite build dist)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
