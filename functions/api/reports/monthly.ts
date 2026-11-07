import { Env, getDatabase, jsonResponse, handleOptions } from '../../_shared';

export const onRequestOptions = () => handleOptions();

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const { data } = await getDatabase(context.env);
    const db = data || {};
    const labs = db.labs || [];
    const deals = db.deals || [];
    const fins = db.fins || [];
    const insts = db.insts || [];
    const instr = db.instr || [];

    const monthLabs = labs.filter((l: any) => String(l.date || '').startsWith(month));

    // Calculate unique sample ID basis
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

    // Calculate per-instrument analyzed sample count
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

    // Downtime per instrument
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
};
