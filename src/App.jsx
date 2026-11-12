import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, ExternalLink, BarChart3, Filter, Award, Search, 
  RefreshCw, AlertCircle, Layers, Sparkles, Compass, Share2, Users 
} from 'lucide-react';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxRnaoBJbf4B_dKDoeFDXAy2ZhJ32u9eQ1yPsz1YEHK36JEVmEPDOVW9PxoI_fMinzN/exec";
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSChLkaPJrSjfFtM1vTWbkl2uffjadl-oV5qCdkTIIqsE7kVU_3eh3Vp4suNJfjUltlcT1t00Pi9KIP/pub?gid=2048510077&single=true&output=csv";

function TeamSpeedometer({ title, target, attained, commit, likely, pool }) {
  const path = commit + (likely * 0.5);
  const gap = Math.max(0, target - attained);
  const percentage = target > 0 ? Math.min(100, Math.round((attained / target) * 100)) : 0;
  const coveragePercent = target > 0 ? Math.min(100, Math.round((pool / target) * 100)) : 0;
  const pathPercent = target > 0 ? Math.min(100, Math.round((path / target) * 100)) : 0;

  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 95;

  const clampedVal = Math.min(Math.max(attained, 0), target);
  const ratio = target > 0 ? clampedVal / target : 0;
  const needleAngle = -90 + ratio * 180;

  const formatShort = (num) => {
    if (num >= 1000000) return `USD ${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `USD ${Math.round(num / 1000)}K`;
    return `USD ${Math.round(num)}`;
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1.0].map((t) => {
    const angleRad = Math.PI * (1 - t);
    const textR = radius - 20;
    const tickR1 = radius - 7;
    const tickR2 = radius - 1;
    return {
      label: formatShort(target * t),
      x1: cx + tickR1 * Math.cos(angleRad),
      y1: cy - tickR1 * Math.sin(angleRad),
      x2: cx + tickR2 * Math.cos(angleRad),
      y2: cy - tickR2 * Math.sin(angleRad),
      tx: cx + textR * Math.cos(angleRad),
      ty: cy - textR * Math.sin(angleRad),
    };
  });

  let statusColor = "text-rose-600";
  if (percentage >= 70) statusColor = "text-emerald-600";
  else if (percentage >= 40) statusColor = "text-amber-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-xs tracking-tight">{title}</h3>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          Target: {formatShort(target)}
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-center my-1">
        <svg viewBox="0 0 220 115" className="w-full max-w-[210px] overflow-visible">
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius * Math.cos(Math.PI * (1 - 0.45))} ${cy - radius * Math.sin(Math.PI * (1 - 0.45))}`}
            fill="none"
            stroke="#BD322B"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx + radius * Math.cos(Math.PI * (1 - 0.45))} ${cy - radius * Math.sin(Math.PI * (1 - 0.45))} A ${radius} ${radius} 0 0 1 ${cx + radius * Math.cos(Math.PI * (1 - 0.80))} ${cy - radius * Math.sin(Math.PI * (1 - 0.80))}`}
            fill="none"
            stroke="#F2A03F"
            strokeWidth={strokeWidth}
          />
          <path
            d={`M ${cx + radius * Math.cos(Math.PI * (1 - 0.80))} ${cy - radius * Math.sin(Math.PI * (1 - 0.80))} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#006D68"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {ticks.map((t, idx) => (
            <g key={idx}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#CBD5E1" strokeWidth="1.5" />
              <text x={t.tx} y={t.ty + (idx === 0 || idx === 4 ? 4 : 0)} textAnchor="middle" fontSize="6" fill="#64748B" fontWeight="500">
                {t.label}
              </text>
            </g>
          ))}

          <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`}>
            <polygon points={`${cx - 2},${cy} ${cx - 0.5},${cy - radius + 4} ${cx + 0.5},${cy - radius + 4} ${cx + 2},${cy}`} fill="#1E293B" />
            <circle cx={cx} cy={cy} r="5.5" fill="#1E293B" />
            <circle cx={cx} cy={cy} r="2" fill="#FFFFFF" />
          </g>
        </svg>

        <div className={`text-center font-black text-lg mt-0.5 ${statusColor}`}>
          {formatShort(attained)} ({percentage}%)
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600">
          <span>Working Coverage: {coveragePercent}%</span>
          <span>Gap: {formatShort(gap)}</span>
        </div>
        
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, target > 0 ? (commit / target) * 100 : 0)}%` }} 
          />
          <div 
            className="bg-indigo-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, target > 0 ? (likely / target) * 100 : 0)}%` }} 
          />
        </div>

        <div className="flex justify-between items-center text-[9.5px] text-slate-500 pt-0.5">
          <span>Path: <strong className="text-slate-800">{formatShort(path)}</strong> ({pathPercent}%)</span>
          <span>Pool: <strong className="text-slate-800">{formatShort(pool)}</strong></span>
        </div>
      </div>
    </div>
  );
}

// Full RFC-4180 CSV parser that handles multi-line quoted cells safely
function parseFullCSV(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cur.trim());
        cur = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(cur.trim());
        rows.push(row);
        row = [];
        cur = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(cur.trim());
        rows.push(row);
        row = [];
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    rows.push(row);
  }
  return rows;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRep, setSelectedRep] = useState(null);
  const [selectedEcosystemPartner, setSelectedEcosystemPartner] = useState(null);
  const [crossbeamPartnerFilter, setCrossbeamPartnerFilter] = useState('ALL');
  const [crossbeamRepFilter, setCrossbeamRepFilter] = useState('ALL');

  const [deals, setDeals] = useState([]);
  const [sheetSummary, setSheetSummary] = useState({
    totalTarget: 18710000,
    marketingTarget: 9000000,
    bdrTarget: 10820000,
    teams: {
      'ANZ ENT':   { target: 9650000, attained: 0,       commit: 450000, likely: 0 },
      'ANZ Scale': { target: 4980000, attained: 100000,  commit: 0,      likely: 0 },
      'ANZ SMB':   { target: 1280000, attained: 150000,  commit: 0,      likely: 0 },
      'ANZ AM':    { target: 2800000, attained: 1240000, commit: 0,      likely: 0 }
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Loading...');
  const [errorMsg, setErrorMsg] = useState(null);

  const getDaysUntilClose = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return 999;
    const clean = dateStr.trim();
    if (!clean) return 999;

    let targetDate = null;
    const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (dmyMatch) {
      let p1 = parseInt(dmyMatch[1], 10);
      let p2 = parseInt(dmyMatch[2], 10);
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000;
      targetDate = (p1 > 12 && p2 <= 12) ? new Date(year, p2 - 1, p1) : new Date(year, p1 - 1, p2);
    } else {
      targetDate = new Date(clean);
    }

    if (!targetDate || isNaN(targetDate.getTime())) return 999;
    const today = new Date();
    return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  };

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);

    // 1. Try Apps Script JSON Endpoint first
    try {
      const jsonRes = await fetch(`${WEB_APP_URL}?_t=${Date.now()}`);
      if (jsonRes.ok) {
        const payload = await jsonRes.json();
        if (payload && payload.status === 'ok' && Array.isArray(payload.deals)) {
          setDeals(payload.deals);
          if (payload.summary) setSheetSummary(payload.summary);
          setLastUpdated(payload.summary?.lastUpdated || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setIsRefreshing(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Apps Script JSON feed unavailable, falling back to published CSV...', e);
    }

    // 2. Fallback to Published Google Sheet CSV
    const rawUrl = `${SHEET_CSV_URL}&_t=${Date.now()}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;

    try {
      let res;
      try {
        res = await fetch(rawUrl);
        if (!res.ok) throw new Error('Direct fetch failed');
      } catch {
        res = await fetch(proxyUrl);
      }

      const csvText = await res.text();
      const rows = parseFullCSV(csvText);

      const parseMoney = (str) => {
        const s = String(str || '0').trim();
        const num = parseFloat(s.replace(/[^0-9.-]/g, '')) || 0;
        return s.toUpperCase().includes('M') ? num * 1000000 : num;
      };

      const parsedTeams = {
        'ANZ ENT':   { target: 9650000, attained: 0,       commit: 450000, likely: 0 },
        'ANZ Scale': { target: 4980000, attained: 100000,  commit: 0,      likely: 0 },
        'ANZ SMB':   { target: 1280000, attained: 150000,  commit: 0,      likely: 0 },
        'ANZ AM':    { target: 2800000, attained: 1240000, commit: 0,      likely: 0 }
      };

      rows.slice(0, 25).forEach(row => {
        const label = String(row[0] || '').trim();
        if (label.includes('ANZ SMB Target'))   { parsedTeams['ANZ SMB'].target = parseMoney(row[1]); parsedTeams['ANZ SMB'].attained = parseMoney(row[2]); }
        if (label.includes('ANZ Scale Target')) { parsedTeams['ANZ Scale'].target = parseMoney(row[1]); parsedTeams['ANZ Scale'].attained = parseMoney(row[2]); }
        if (label.includes('ANZ ENT Target'))   { parsedTeams['ANZ ENT'].target = parseMoney(row[1]); parsedTeams['ANZ ENT'].attained = parseMoney(row[2]); }
        if (label.includes('ANZ AM Target'))    { parsedTeams['ANZ AM'].target = parseMoney(row[1]); parsedTeams['ANZ AM'].attained = parseMoney(row[2]); }

        if (label.includes('ANZ SMB - Commit'))   parsedTeams['ANZ SMB'].commit = parseMoney(row[1]);
        if (label.includes('ANZ Scale - Commit')) parsedTeams['ANZ Scale'].commit = parseMoney(row[1]);
        if (label.includes('ANZ ENT - Commit'))   parsedTeams['ANZ ENT'].commit = parseMoney(row[1]);
        if (label.includes('ANZ AM - Commit'))    parsedTeams['ANZ AM'].commit = parseMoney(row[1]);
      });

      let headerIdx = rows.findIndex(r => {
        const joined = r.join('|').toLowerCase();
        return joined.includes('opportunity') && joined.includes('stage');
      });

      if (headerIdx !== -1) {
        const parsedDeals = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const cols = rows[i];
          const colA = String(cols[0] || '').trim();
          const colB = String(cols[1] || '').trim();
          if (!colA && !colB) continue;
          if (colA.toLowerCase().includes('total') || colB.toLowerCase().includes('total')) continue;

          if (colA.startsWith('006')) {
            let oppName = colB;
            if (oppName.includes('HYPERLINK(')) {
              const nameMatch = oppName.match(/,"([^"]+)"\)/);
              if (nameMatch) oppName = nameMatch[1];
            }

            const rawSource = String(cols[22] || '').toLowerCase();
            const source = (rawSource.includes('inbound') || rawSource.includes('marketing')) ? 'Marketing Sourced' : 'BDR Sourced';
            const sourcedDetail = String(cols[9] || '').trim();

            parsedDeals.push({
              id: colA,
              name: oppName || colA,
              team: String(cols[2] || 'ANZ ENT').trim(),
              stage: String(cols[3] || 'Qualifying').trim(),
              acv: parseMoney(cols[4]),
              ae: String(cols[5] || 'Unassigned').trim(),
              bdr: String(cols[6] || '').trim(),
              crossbeamPartners: String(cols[7] || '').trim(),
              partnerAttached: String(cols[8] || '').toLowerCase() === 'yes',
              partnerSourcedDetail: sourcedDetail,
              isPartnerSourced: sourcedDetail.toLowerCase().includes('sourced'),
              commitStatus: String(cols[18] || 'Non Commit').trim() || 'Non Commit',
              closeDate: String(cols[20] || '').trim(),
              source: source,
              partnerInfluence: String(cols[24] || '').trim(),
              sourcePartner: String(cols[25] || '').trim()
            });
          } else {
            // Manual prospecting rows (Col A = Account Name, Col B = Team, Col C = Stage, Col D = ACV, Col E = AE)
            parsedDeals.push({
              id: `manual-${i}`,
              name: colA,
              team: colB || 'ANZ Scale',
              stage: String(cols[2] || 'Prospecting').trim(),
              acv: parseMoney(cols[3]),
              ae: String(cols[4] || 'Unassigned').trim(),
              bdr: String(cols[5] || '').trim(),
              crossbeamPartners: String(cols[6] || '').trim(),
              partnerAttached: String(cols[7] || '').toLowerCase() === 'yes',
              partnerSourcedDetail: String(cols[8] || '').trim(),
              isPartnerSourced: String(cols[8] || '').toLowerCase().includes('sourced'),
              commitStatus: String(cols[11] || 'Non Commit').trim() || 'Non Commit',
              closeDate: '',
              source: 'BDR Sourced',
              partnerInfluence: '',
              sourcePartner: ''
            });
          }
        }
        setDeals(parsedDeals);
        setSheetSummary(prev => ({ ...prev, teams: parsedTeams }));
      }
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Failed to load sheet data:", err);
      setErrorMsg("Could not reach Google Sheet. Ensure the sheet is published to the web or the Apps Script Web App is deployed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchLiveData(); }, []);

  const activeMetrics = useMemo(() => {
    let relevantDeals = deals;
    if (sourceFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => d.source === sourceFilter);
    }

    let target = sheetSummary.totalTarget || 18710000;
    if (sourceFilter === 'Marketing Sourced') target = sheetSummary.marketingTarget || 9000000;
    else if (sourceFilter === 'BDR Sourced') target = sheetSummary.bdrTarget || 10820000;
    else if (teamFilter !== 'ALL') target = sheetSummary.teams[teamFilter]?.target || target;

    if (teamFilter === 'ALL') {
      const attained = Object.values(sheetSummary.teams).reduce((sum, t) => sum + (t.attained || 0), 0);
      const commit = Object.values(sheetSummary.teams).reduce((sum, t) => sum + (t.commit || 0), 0);
      const pool = relevantDeals.reduce((sum, d) => sum + (d.acv || 0), 0);
      return {
        target,
        attained,
        commit,
        likely: 0,
        path: commit,
        gapToPath: Math.max(0, target - commit),
        remainingGap: Math.max(0, target - attained),
        pool,
        percentage: target > 0 ? ((attained / target) * 100).toFixed(1) : '0.0'
      };
    } else {
      const tm = sheetSummary.teams[teamFilter] || { target: 0, attained: 0, commit: 0, likely: 0 };
      const teamDeals = relevantDeals.filter(d => (d.team || '').includes(teamFilter.replace('ANZ ', '')));
      const pool = teamDeals.reduce((sum, d) => sum + (d.acv || 0), 0);
      return {
        target: tm.target,
        attained: tm.attained,
        commit: tm.commit,
        likely: 0,
        path: tm.commit,
        gapToPath: Math.max(0, tm.target - tm.commit),
        remainingGap: Math.max(0, tm.target - tm.attained),
        pool,
        percentage: tm.target > 0 ? ((tm.attained / tm.target) * 100).toFixed(1) : '0.0'
      };
    }
  }, [teamFilter, sourceFilter, sheetSummary, deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (d.name || '').toLowerCase().includes(q) || 
                            (d.ae || '').toLowerCase().includes(q) ||
                            (d.crossbeamPartners || '').toLowerCase().includes(q) ||
                            (d.partnerInfluence || '').toLowerCase().includes(q);
      const matchesTeam = teamFilter === 'ALL' || (d.team || '').includes(teamFilter.replace('ANZ ', ''));
      const matchesSource = sourceFilter === 'ALL' || d.source === sourceFilter;
      return matchesSearch && matchesTeam && matchesSource;
    });
  }, [deals, searchQuery, teamFilter, sourceFilter]);

  const partnerData = useMemo(() => {
    let relevantDeals = deals;
    if (teamFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => (d.team || '').includes(teamFilter.replace('ANZ ', '')));
    }
    if (sourceFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => d.source === sourceFilter);
    }

    const counts = {};
    relevantDeals.forEach(d => {
      if (d.partnerInfluence) {
        const parts = d.partnerInfluence.split(';').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (!counts[p]) {
            counts[p] = { name: p, count: 0, acv: 0, attachedCount: 0, attachedAcv: 0, sourcedCount: 0, sourcedAcv: 0, deals: [] };
          }
          counts[p].count += 1;
          counts[p].acv += (d.acv || 0);
          counts[p].deals.push(d);
          if (d.partnerAttached) {
            counts[p].attachedCount += 1;
            counts[p].attachedAcv += (d.acv || 0);
          }
          if (d.isPartnerSourced || (d.sourcePartner && d.sourcePartner.toLowerCase().includes(p.toLowerCase()))) {
            counts[p].sourcedCount += 1;
            counts[p].sourcedAcv += (d.acv || 0);
          }
        });
      }
    });
    return Object.values(counts).sort((a, b) => b.acv - a.acv || b.count - a.count);
  }, [deals, teamFilter, sourceFilter]);

  const crossbeamData = useMemo(() => {
    const list = [];
    deals.forEach(d => {
      if (d.crossbeamPartners) {
        const parts = d.crossbeamPartners.split(';').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          list.push({
            partner: p,
            dealName: d.name,
            dealId: d.id,
            ae: d.ae,
            team: d.team,
            acv: d.acv || 0,
            stage: d.stage,
            commitStatus: d.commitStatus,
            source: d.source,
            closeDate: d.closeDate
          });
        });
      }
    });
    return list;
  }, [deals]);

  const crossbeamPartnersList = useMemo(() => Array.from(new Set(crossbeamData.map(i => i.partner))).sort(), [crossbeamData]);
  const crossbeamRepsList = useMemo(() => Array.from(new Set(crossbeamData.map(i => i.ae))).sort(), [crossbeamData]);

  const filteredCrossbeamData = useMemo(() => {
    return crossbeamData.filter(item => {
      const matchesPartner = crossbeamPartnerFilter === 'ALL' || item.partner === crossbeamPartnerFilter;
      const matchesRep = crossbeamRepFilter === 'ALL' || item.ae === crossbeamRepFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = (item.dealName || '').toLowerCase().includes(q) || 
                            (item.partner || '').toLowerCase().includes(q) ||
                            (item.ae || '').toLowerCase().includes(q);
      return matchesPartner && matchesRep && matchesSearch;
    });
  }, [crossbeamData, crossbeamPartnerFilter, crossbeamRepFilter, searchQuery]);

  const priorityDeals = useMemo(() => {
    let baseDeals = deals;
    if (teamFilter !== 'ALL') {
      baseDeals = baseDeals.filter(d => (d.team || '').includes(teamFilter.replace('ANZ ', '')));
    }
    if (sourceFilter !== 'ALL') {
      baseDeals = baseDeals.filter(d => d.source === sourceFilter);
    }

    return baseDeals.map(d => {
      const days = getDaysUntilClose(d.closeDate);
      let tier = null;
      let badgeColor = '';

      if (days <= 90) {
        tier = 'Tier 1: High Priority (0–90 Days)';
        badgeColor = days < 0 
          ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold' 
          : 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (days <= 180) {
        tier = 'Tier 2: Second Priority (91–180 Days)';
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      }

      return { ...d, days, tier, badgeColor };
    }).filter(d => d.tier !== null)
      .sort((a, b) => a.days - b.days);
  }, [deals, teamFilter, sourceFilter]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 font-sans">
      <header className="bg-[#1B0B3B] text-white px-6 py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF595A] to-[#635BFF] flex items-center justify-center p-2 shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Braze ANZ Q4 Pipeline Forecast & Target Dashboard</h1>
              <p className="text-xs text-indigo-200">Source: Marketing Sourced vs BDR Sourced · Live Sheet Sync</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#2D1B54] px-3 py-1.5 rounded-lg border border-indigo-900/50 text-xs text-indigo-200">
              Last updated: <span className="font-medium text-white">{lastUpdated}</span>
            </div>
            <button onClick={fetchLiveData} className="flex items-center gap-1.5 text-xs bg-[#FF595A] hover:bg-[#e04849] px-3 py-2 rounded-lg font-medium text-white shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 border-t border-indigo-900/60 pt-3 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'overview' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'}`}>
            <BarChart3 className="w-3.5 h-3.5" /> Pipeline Overview
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'}`}>
            <Award className="w-3.5 h-3.5" /> Rep Pipeline Leaderboard
          </button>
          <button onClick={() => setActiveTab('partners')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'partners' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'}`}>
            <Users className="w-3.5 h-3.5" /> Partner Ecosystem
          </button>
          <button onClick={() => setActiveTab('crossbeam')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'crossbeam' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'}`}>
            <Share2 className="w-3.5 h-3.5" /> Crossbeam Overlaps
          </button>
          <button onClick={() => setActiveTab('focus')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'focus' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'}`}>
            <Compass className="w-3.5 h-3.5" /> Focus Opportunities (0–90 & 91–180d)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Team:
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              {['ALL', 'ANZ ENT', 'ANZ Scale', 'ANZ SMB', 'ANZ AM'].map(tm => (
                <button key={tm} onClick={() => setTeamFilter(tm)} className={`px-3 py-1.5 rounded-md transition ${teamFilter === tm ? 'bg-[#1B0B3B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                  {tm}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              {['ALL', 'Marketing Sourced', 'BDR Sourced'].map(src => (
                <button key={src} onClick={() => setSourceFilter(src)} className={`px-3 py-1.5 rounded-md transition ${sourceFilter === src ? 'bg-[#FF595A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                  {src}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>{sourceFilter !== 'ALL' ? sourceFilter : teamFilter} TARGET</span>
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">${(activeMetrics.target / 1000000).toFixed(2)}M</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>PG ATTAINED</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">${(activeMetrics.attained / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">{activeMetrics.percentage}% of Target</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>COMMIT / LIKELY PATH</span>
                  <Layers className="w-4 h-4 text-[#FF595A]" />
                </div>
                <div className="text-2xl font-bold text-[#1B0B3B]">${(activeMetrics.path / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Gap to path:</span>
                  <span className="font-bold text-amber-700">${(activeMetrics.gapToPath / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>REMAINING GAP</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-rose-600">${(activeMetrics.remainingGap / 1000000).toFixed(2)}M</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {['ANZ ENT', 'ANZ Scale', 'ANZ SMB', 'ANZ AM'].map(tm => (
                <TeamSpeedometer
                  key={tm}
                  title={`${tm} NB Pipe Pacing`}
                  target={sheetSummary.teams[tm]?.target || 0}
                  attained={sheetSummary.teams[tm]?.attained || 0}
                  commit={sheetSummary.teams[tm]?.commit || 0}
                  likely={sheetSummary.teams[tm]?.likely || 0}
                  pool={deals.filter(d => (d.team || '').includes(tm.replace('ANZ ', ''))).reduce((s, d) => s + (d.acv || 0), 0)}
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-sm">Opportunities ({filteredDeals.length})</h3>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs border rounded-lg px-3 py-1.5 focus:outline-none"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                      <th className="py-3 px-4">Opportunity</th>
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-3">Stage</th>
                      <th className="py-3 px-3">Source</th>
                      <th className="py-3 px-3 text-right">ACV</th>
                      <th className="py-3 px-3">AE</th>
                      <th className="py-3 px-3">Commit Status</th>
                      <th className="py-3 px-3">Crossbeam Partners</th>
                      <th className="py-3 px-3">Close Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDeals.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-indigo-600">
                          {d.id.startsWith('006') ? (
                            <a href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                              {d.name} <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="text-slate-900">{d.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{d.team}</td>
                        <td className="py-3 px-3 font-medium">{d.stage}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            d.source === 'Marketing Sourced' 
                              ? 'bg-sky-50 text-sky-700 border-sky-200' 
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {d.source}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">${(d.acv || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-600">{d.ae}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.commitStatus === 'Attained' ? 'bg-teal-100 text-teal-800' :
                            d.commitStatus === 'Commit' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {d.commitStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate" title={d.crossbeamPartners}>{d.crossbeamPartners || '—'}</td>
                        <td className="py-3 px-3 text-slate-500">{d.closeDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Rep Pipeline Leaderboard {teamFilter !== 'ALL' ? `(${teamFilter})` : ''}
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                    <th className="py-3 px-4">Account Executive</th>
                    <th className="py-3 px-4 text-right">Attained</th>
                    <th className="py-3 px-4 text-right">Commit</th>
                    <th className="py-3 px-4 text-right">Total Working Pool</th>
                    <th className="py-3 px-4 text-center">Deals</th>
                    <th className="py-3 px-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const repMap = {};
                    filteredDeals.forEach(d => {
                      const rep = d.ae || 'Unassigned';
                      if (!repMap[rep]) repMap[rep] = { name: rep, attained: 0, commit: 0, pool: 0, deals: [] };
                      repMap[rep].pool += (d.acv || 0);
                      repMap[rep].deals.push(d);
                      if (d.commitStatus === 'Attained') repMap[rep].attained += (d.acv || 0);
                      else if (d.commitStatus === 'Commit') repMap[rep].commit += (d.acv || 0);
                    });

                    return Object.values(repMap).sort((a, b) => b.attained - a.attained || b.commit - a.commit).map(r => {
                      const isExpanded = selectedRep === r.name;
                      return (
                        <React.Fragment key={r.name}>
                          <tr className={`hover:bg-slate-50 cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : ''}`} onClick={() => setSelectedRep(isExpanded ? null : r.name)}>
                            <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                            <td className="py-3 px-4 text-right font-black text-emerald-600">${r.attained.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-semibold text-emerald-700">${r.commit.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-medium">${r.pool.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">{r.deals.length}</td>
                            <td className="py-3 px-4 text-center">
                              <button className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                                {isExpanded ? 'Collapse' : 'View Deals'}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/90">
                              <td colSpan="6" className="p-4 border-y-2 border-indigo-200">
                                <div className="bg-white rounded-xl border p-3 space-y-2">
                                  <h4 className="font-bold text-xs">Deals for {r.name}</h4>
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b text-slate-500 font-semibold">
                                        <th className="py-2 text-left">Opportunity</th>
                                        <th className="py-2 text-left">Team</th>
                                        <th className="py-2 text-left">Source</th>
                                        <th className="py-2 text-right">ACV</th>
                                        <th className="py-2 text-center">Likelihood</th>
                                        <th className="py-2 text-left">Close Date</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {r.deals.map(d => (
                                        <tr key={d.id}>
                                          <td className="py-2 font-medium text-indigo-600">{d.name}</td>
                                          <td className="py-2">{d.team}</td>
                                          <td className="py-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">{d.source}</span></td>
                                          <td className="py-2 text-right font-bold">${(d.acv || 0).toLocaleString()}</td>
                                          <td className="py-2 text-center">{d.commitStatus}</td>
                                          <td className="py-2 text-slate-500">{d.closeDate}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Partner Ecosystem Leaderboard (Partner Influence)
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                    <th className="py-3 px-4">Partner</th>
                    <th className="py-3 px-4 text-center">Tagged Deals</th>
                    <th className="py-3 px-4 text-center">Attached</th>
                    <th className="py-3 px-4 text-right">Influenced ACV</th>
                    <th className="py-3 px-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerData.slice(0, 20).map((p, idx) => {
                    const isExpanded = selectedEcosystemPartner === p.name;
                    return (
                      <React.Fragment key={p.name}>
                        <tr className={`hover:bg-slate-50 cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : ''}`} onClick={() => setSelectedEcosystemPartner(isExpanded ? null : p.name)}>
                          <td className="py-3 px-4 font-bold text-slate-900">{idx + 1}. {p.name}</td>
                          <td className="py-3 px-4 text-center">{p.count}</td>
                          <td className="py-3 px-4 text-center text-indigo-700 font-bold">{p.attachedCount}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">${p.acv.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <button className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                              {isExpanded ? 'Collapse' : 'View Deals'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/90">
                            <td colSpan="5" className="p-4 border-y-2 border-indigo-200">
                              <div className="bg-white rounded-xl border p-3 space-y-2">
                                <h4 className="font-bold text-xs">Deals influenced by {p.name}</h4>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b text-slate-500 font-semibold">
                                      <th className="py-2 text-left">Opportunity</th>
                                      <th className="py-2 text-left">AE</th>
                                      <th className="py-2 text-left">Source</th>
                                      <th className="py-2 text-right">ACV</th>
                                      <th className="py-2 text-center">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {p.deals.map(d => (
                                      <tr key={d.id}>
                                        <td className="py-2 font-medium text-indigo-600">{d.name}</td>
                                        <td className="py-2">{d.ae}</td>
                                        <td className="py-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">{d.source}</span></td>
                                        <td className="py-2 text-right font-bold">${(d.acv || 0).toLocaleString()}</td>
                                        <td className="py-2 text-center">{d.commitStatus}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'crossbeam' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#635BFF]" /> Crossbeam Partner Overlaps (Column H)
            </h2>
            <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border">
              <select value={crossbeamPartnerFilter} onChange={(e) => setCrossbeamPartnerFilter(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white">
                <option value="ALL">All Partners ({crossbeamPartnersList.length})</option>
                {crossbeamPartnersList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={crossbeamRepFilter} onChange={(e) => setCrossbeamRepFilter(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white">
                <option value="ALL">All Reps ({crossbeamRepsList.length})</option>
                {crossbeamRepsList.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                    <th className="py-3 px-4">Partner</th>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-3">AE</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3 text-right">ACV</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Close Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCrossbeamData.slice(0, 50).map((i, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{i.partner}</td>
                      <td className="py-3 px-4 font-medium text-indigo-600">{i.dealName}</td>
                      <td className="py-3 px-3">{i.ae}</td>
                      <td className="py-3 px-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">{i.source}</span></td>
                      <td className="py-3 px-3 text-right font-bold">${i.acv.toLocaleString()}</td>
                      <td className="py-3 px-3">{i.stage}</td>
                      <td className="py-3 px-3 text-slate-500">{i.closeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#FF595A]" /> Focus Priorities (0–180 Days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Tier 1', 'Tier 2'].map(tierKey => (
                <div key={tierKey} className="space-y-3">
                  <div className={`${tierKey === 'Tier 1' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'} p-3 rounded-xl border font-bold text-xs flex justify-between`}>
                    <span>{tierKey === 'Tier 1' ? 'Tier 1: High Priority (0–90 Days)' : 'Tier 2: Second Priority (91–180 Days)'}</span>
                    <span>{priorityDeals.filter(d => d.tier.includes(tierKey)).length} Deals</span>
                  </div>
                  {priorityDeals.filter(d => d.tier.includes(tierKey)).map(d => (
                    <div key={d.id} className="p-3 border rounded-xl bg-white shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-indigo-600">{d.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${d.badgeColor}`}>{d.days}d to close</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>{d.team} · <strong className="text-slate-800">{d.source}</strong></span>
                        <span className="font-black text-slate-900">${(d.acv || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
