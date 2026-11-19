import React, { useState, useEffect, useMemo } from 'react';
import {
  Target, ExternalLink, BarChart3, Filter, Award, Search,
  RefreshCw, AlertCircle, Layers, Sparkles, Compass, Share2, Users,
  Trophy, Medal
} from 'lucide-react';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxRnaoBJbf4B_dKDoeFDXAy2ZhJ32u9eQ1yPsz1YEHK36JEVmEPDOVW9PxoI_fMinzN/exec";
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSChLkaPJrSjfFtM1vTWbkl2uffjadl-oV5qCdkTIIqsE7kVU_3eh3Vp4suNJfjUltlcT1t00Pi9KIP/pub?gid=2048510077&single=true&output=csv";
const PROSPECTING_GVIZ_CSV_URL = "https://docs.google.com/spreadsheets/d/109jy9sFdx0s0aZq5CdxbgQnMH5INkUUKvjvhTYoZ8OA/gviz/tq?tqx=out:csv&sheet=ANZ%20Prospecting";

function normalizeTeamLabel(rawTeam) {
  const s = String(rawTeam || '').toLowerCase().trim();
  if (!s) return '';
  if (s.includes('ent')) return 'ANZ ENT';
  if (s.includes('scale')) return 'ANZ Scale';
  if (s.includes('smb')) return 'ANZ SMB';
  if (s.includes('am')) return 'ANZ AM';
  return String(rawTeam || '').trim();
}

function TeamSpeedometer({ title, target, attained, commit, likely, pool, isMaster = false }) {
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
    <div className={`rounded-2xl border shadow-sm p-4 flex flex-col justify-between ${isMaster ? 'bg-gradient-to-b from-indigo-50/60 to-white border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className={`font-bold tracking-tight ${isMaster ? 'text-indigo-950 text-sm' : 'text-slate-800 text-xs'}`}>
          {title}
        </h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isMaster ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
          Target: {formatShort(target)}
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-center my-1">
        <svg viewBox="0 0 220 115" className={`w-full overflow-visible ${isMaster ? 'max-w-[250px]' : 'max-w-[205px]'}`}>
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

        <div className={`text-center font-black mt-0.5 ${isMaster ? 'text-xl' : 'text-lg'} ${statusColor}`}>
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

function PodiumCards({ items, filterKey, metricLabel, subMetricLabel, formatValue, formatSubValue, onSelect }) {
  const top3 = items.slice(0, 3);
  if (top3.length === 0) return null;

  const styles = [
    {
      rank: '1st Place',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      card: 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-300 ring-1 ring-amber-200/60',
      iconColor: 'text-amber-500',
      valColor: 'text-amber-950'
    },
    {
      rank: '2nd Place',
      badge: 'bg-slate-200 text-slate-800 border-slate-300',
      card: 'bg-gradient-to-br from-slate-50 via-white to-slate-100/50 border-slate-300',
      iconColor: 'text-slate-500',
      valColor: 'text-slate-900'
    },
    {
      rank: '3rd Place',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      card: 'bg-gradient-to-br from-orange-50/70 via-white to-orange-50/30 border-orange-200',
      iconColor: 'text-orange-500',
      valColor: 'text-orange-950'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {top3.map((item, idx) => {
        const st = styles[idx];
        return (
          <div
            key={`${filterKey}-${idx}-${item.name}`}
            onClick={() => onSelect && onSelect(item.name)}
            className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition hover:shadow-md ${onSelect ? 'cursor-pointer' : ''} ${st.card}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${st.badge}`}>
                {idx === 0 ? <Trophy className={`w-3.5 h-3.5 ${st.iconColor}`} /> : <Medal className={`w-3.5 h-3.5 ${st.iconColor}`} />}
                {st.rank}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">{item.deals?.length || item.count || 0} Deals</span>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 truncate" title={item.name}>{item.name}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">{metricLabel}</div>
              <div className={`text-2xl font-black mt-0.5 ${st.valColor}`}>{formatValue(item)}</div>
            </div>
            {subMetricLabel && (
              <div className="mt-3 pt-2 border-t border-slate-200/70 flex justify-between items-center text-[11px] text-slate-600">
                <span>{subMetricLabel}:</span>
                <span className="font-bold text-slate-800">{formatSubValue(item)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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

function parseMoneyHelper(str) {
  const s = String(str || '0').trim();
  const num = parseFloat(s.replace(/[^0-9.-]/g, '')) || 0;
  return s.toUpperCase().includes('M') ? num * 1000000 : num;
}

function parseProspectingCsvRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  let headerIdx = rows.findIndex(r => {
    const joined = r.join('|').toLowerCase();
    return (joined.includes('account') || joined.includes('opportunity')) && (joined.includes('stage') || joined.includes('team'));
  });

  const startIdx = headerIdx !== -1 ? headerIdx + 1 : 0;
  const headerRow = headerIdx !== -1 ? rows[headerIdx].map(h => String(h || '').toLowerCase()) : [];
  const acctColIdx = headerRow[0] && headerRow[0].includes('account') ? 0 : (headerRow[1] && headerRow[1].includes('account') ? 1 : 0);

  const parsed = [];
  for (let i = startIdx; i < rows.length; i++) {
    const cols = rows[i];
    const acctName = String(cols[acctColIdx] || '').trim();
    if (!acctName) continue;
    const low = acctName.toLowerCase();
    if (low === 'total' || low === 'cotal' || low.includes('how to use') || low.includes('last updated') || low.includes('refreshed')) continue;

    if (headerIdx === -1 && i < 27) continue;

    const teamVal = String(cols[acctColIdx + 1] || '').trim();
    const stageVal = String(cols[acctColIdx + 2] || 'Prospecting').trim();
    if (!teamVal && !stageVal) continue;
    if (stageVal.toLowerCase() === 'already in pipe') continue;

    parsed.push({
      id: `prosp-${i}`,
      name: acctName,
      team: teamVal,
      stage: stageVal,
      acv: parseMoneyHelper(cols[acctColIdx + 3]),
      ae: String(cols[acctColIdx + 4] || '').trim(),
      bdr: String(cols[acctColIdx + 5] || '').trim(),
      crossbeamPartners: String(cols[acctColIdx + 6] || '').trim(),
      partnerAttached: String(cols[acctColIdx + 7] || '').trim(),
      partnerSourced: String(cols[acctColIdx + 8] || '').trim(),
      nextSteps: String(cols[acctColIdx + 20] || '').trim(),
      partnerInfluence: String(cols[23] || '').trim(),
      sourcePartner: String(cols[24] || '').trim()
    });
  }
  return parsed;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Leaderboard states
  const [leaderboardSortBy, setLeaderboardSortBy] = useState('attained');
  const [selectedRep, setSelectedRep] = useState(null);

  // Partner Ecosystem states
  const [selectedEcosystemPartner, setSelectedEcosystemPartner] = useState(null);
  const [partnerSourceFilter, setPartnerSourceFilter] = useState('ALL');
  const [partnerInfluenceFilter, setPartnerInfluenceFilter] = useState('ALL');

  // Crossbeam states
  const [crossbeamPartnerFilter, setCrossbeamPartnerFilter] = useState('ALL');
  const [crossbeamRepFilter, setCrossbeamRepFilter] = useState('ALL');
  const [crossbeamBdFilter, setCrossbeamBdFilter] = useState('ALL');
  const [crossbeamStageFilter, setCrossbeamStageFilter] = useState('ALL');

  // Focus Opportunities states
  const [focusSearch, setFocusSearch] = useState('');

  const [deals, setDeals] = useState([]);
  const [prospectingRecords, setProspectingRecords] = useState([]);
  const [sheetSummary, setSheetSummary] = useState({
    totalTarget: 18710000,
    marketingTarget: 9300000,
    bdrTarget: 10300000,
    teams: {
      'ANZ ENT':   { target: 9650000, attained: 0,       commit: 0, likely: 0 },
      'ANZ Scale': { target: 4980000, attained: 100000,  commit: 0, likely: 0 },
      'ANZ SMB':   { target: 1280000, attained: 164753,  commit: 0, likely: 0 },
      'ANZ AM':    { target: 2800000, attained: 1694119, commit: 0, likely: 0 }
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
    today.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  };

  const fetchProspectingTabFallback = async () => {
    const rawUrl = `${PROSPECTING_GVIZ_CSV_URL}&_t=${Date.now()}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;
    try {
      let res;
      try {
        res = await fetch(rawUrl);
        if (!res.ok) throw new Error('Direct gviz fetch failed');
      } catch {
        res = await fetch(proxyUrl);
      }
      if (!res.ok) return [];
      const csvText = await res.text();
      const rows = parseFullCSV(csvText);
      return parseProspectingCsvRows(rows);
    } catch (e) {
      console.warn('Fallback ANZ Prospecting fetch failed:', e);
      return [];
    }
  };

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);

    try {
      const jsonRes = await fetch(`${WEB_APP_URL}?_t=${Date.now()}`);
      if (jsonRes.ok) {
        const payload = await jsonRes.json();
        if (payload && payload.status === 'ok' && Array.isArray(payload.deals)) {
          setDeals(payload.deals);
          if (Array.isArray(payload.prospecting) && payload.prospecting.length > 0) {
            setProspectingRecords(payload.prospecting);
          } else {
            const fallbackProsp = await fetchProspectingTabFallback();
            if (fallbackProsp.length > 0) setProspectingRecords(fallbackProsp);
          }
          if (payload.summary) setSheetSummary(payload.summary);
          setLastUpdated(payload.summary?.lastUpdated || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setIsRefreshing(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Apps Script JSON feed unavailable, falling back to published CSV...', e);
    }

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

      const parsedTeams = {
        'ANZ ENT':   { target: 9650000, attained: 0, commit: 0, likely: 0 },
        'ANZ Scale': { target: 4980000, attained: 0, commit: 0, likely: 0 },
        'ANZ SMB':   { target: 1280000, attained: 0, commit: 0, likely: 0 },
        'ANZ AM':    { target: 2800000, attained: 0, commit: 0, likely: 0 }
      };

      rows.slice(0, 25).forEach(row => {
        const label = String(row[0] || '').trim();
        if (label.includes('ANZ SMB Target'))   { parsedTeams['ANZ SMB'].target = parseMoneyHelper(row[1]); parsedTeams['ANZ SMB'].attained = parseMoneyHelper(row[2]); }
        if (label.includes('ANZ Scale Target')) { parsedTeams['ANZ Scale'].target = parseMoneyHelper(row[1]); parsedTeams['ANZ Scale'].attained = parseMoneyHelper(row[2]); }
        if (label.includes('ANZ ENT Target'))   { parsedTeams['ANZ ENT'].target = parseMoneyHelper(row[1]); parsedTeams['ANZ ENT'].attained = parseMoneyHelper(row[2]); }
        if (label.includes('ANZ AM Target'))    { parsedTeams['ANZ AM'].target = parseMoneyHelper(row[1]); parsedTeams['ANZ AM'].attained = parseMoneyHelper(row[2]); }

        if (label.includes('ANZ SMB - Commit'))   parsedTeams['ANZ SMB'].commit = parseMoneyHelper(row[1]);
        if (label.includes('ANZ Scale - Commit')) parsedTeams['ANZ Scale'].commit = parseMoneyHelper(row[1]);
        if (label.includes('ANZ ENT - Commit'))   parsedTeams['ANZ ENT'].commit = parseMoneyHelper(row[1]);
        if (label.includes('ANZ AM - Commit'))    parsedTeams['ANZ AM'].commit = parseMoneyHelper(row[1]);

        if (label.includes('ANZ SMB - Likely'))   parsedTeams['ANZ SMB'].likely = parseMoneyHelper(row[1]);
        if (label.includes('ANZ Scale - Likely')) parsedTeams['ANZ Scale'].likely = parseMoneyHelper(row[1]);
        if (label.includes('ANZ ENT - Likely'))   parsedTeams['ANZ ENT'].likely = parseMoneyHelper(row[1]);
        if (label.includes('ANZ AM - Likely'))    parsedTeams['ANZ AM'].likely = parseMoneyHelper(row[1]);
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
              acv: parseMoneyHelper(cols[4]),
              ae: String(cols[5] || 'Unassigned').trim(),
              bdr: String(cols[6] || '').trim(),
              crossbeamPartners: String(cols[7] || '').trim(),
              partnerAttached: String(cols[8] || '').toLowerCase() === 'yes',
              partnerSourcedDetail: sourcedDetail,
              isPartnerSourced: sourcedDetail.toLowerCase().includes('sourced'),
              commitStatus: String(cols[18] || 'Non Commit').trim() || 'Non Commit',
              closeDate: String(cols[20] || '').trim(),
              nextSteps: String(cols[21] || '').trim(),
              source: source,
              partnerInfluence: String(cols[24] || '').trim(),
              sourcePartner: String(cols[25] || '').trim()
            });
          }
        }
        setDeals(parsedDeals);
        setSheetSummary(prev => ({ ...prev, teams: parsedTeams }));
      }

      const fallbackProsp = await fetchProspectingTabFallback();
      if (fallbackProsp.length > 0) setProspectingRecords(fallbackProsp);

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Failed to load sheet data:", err);
      setErrorMsg("Could not reach Google Sheet. Ensure the sheet is published to the web or the Apps Script Web App is deployed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchLiveData(); }, []);

  useEffect(() => {
    setSelectedRep(null);
  }, [teamFilter, sourceFilter, leaderboardSortBy, searchQuery]);

  useEffect(() => {
    setSelectedEcosystemPartner(null);
  }, [teamFilter, partnerSourceFilter, partnerInfluenceFilter]);

  const computeSliceMetrics = (teamKey, sourceKey) => {
    let sliceDeals = deals;
    if (sourceKey !== 'ALL') {
      sliceDeals = sliceDeals.filter(d => d.source === sourceKey);
    }
    if (teamKey !== 'ALL') {
      sliceDeals = sliceDeals.filter(d => normalizeTeamLabel(d.team) === teamKey);
    }

    let target = sheetSummary.totalTarget || 18710000;
    if (teamKey !== 'ALL') {
      target = sheetSummary.teams[teamKey]?.target || 0;
    } else if (sourceKey === 'Marketing Sourced') {
      target = sheetSummary.marketingTarget || 9300000;
    } else if (sourceKey === 'BDR Sourced') {
      target = sheetSummary.bdrTarget || 10300000;
    }

    const attained = sliceDeals
      .filter(d => String(d.commitStatus || '').trim().toLowerCase() === 'attained')
      .reduce((sum, d) => sum + (d.acv || 0), 0);

    const commit = sliceDeals
      .filter(d => String(d.commitStatus || '').trim().toLowerCase() === 'commit')
      .reduce((sum, d) => sum + (d.acv || 0), 0);

    const likely = sliceDeals
      .filter(d => String(d.commitStatus || '').trim().toLowerCase() === 'likely')
      .reduce((sum, d) => sum + (d.acv || 0), 0);

    const pool = sliceDeals.reduce((sum, d) => sum + (d.acv || 0), 0);
    const path = commit + (likely * 0.5);
    const remainingGap = Math.max(0, target - attained);
    const gapToPath = Math.max(0, target - (attained + path));

    return {
      target,
      attained,
      commit,
      likely,
      path,
      pool,
      remainingGap,
      gapToPath,
      percentage: target > 0 ? ((attained / target) * 100).toFixed(1) : '0.0'
    };
  };

  const activeMetrics = useMemo(
    () => computeSliceMetrics(teamFilter, sourceFilter),
    [teamFilter, sourceFilter, sheetSummary, deals]
  );

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
                            (d.name || '').toLowerCase().includes(q) ||
                            (d.ae || '').toLowerCase().includes(q) ||
                            (d.bdr || '').toLowerCase().includes(q) ||
                            (d.crossbeamPartners || '').toLowerCase().includes(q) ||
                            (d.partnerInfluence || '').toLowerCase().includes(q);
      const matchesTeam = teamFilter === 'ALL' || normalizeTeamLabel(d.team) === teamFilter;
      const matchesSource = sourceFilter === 'ALL' || d.source === sourceFilter;
      return matchesSearch && matchesTeam && matchesSource;
    });
  }, [deals, searchQuery, teamFilter, sourceFilter]);

  const leaderboardData = useMemo(() => {
    const repMap = {};
    filteredDeals.forEach(d => {
      const rep = String(d.ae || 'Unassigned').trim() || 'Unassigned';
      if (!repMap[rep]) repMap[rep] = { name: rep, attained: 0, commit: 0, likely: 0, pool: 0, deals: [] };
      const acv = Number(d.acv) || 0;
      const status = String(d.commitStatus || '').trim().toLowerCase();

      repMap[rep].pool += acv;
      repMap[rep].deals.push(d);
      if (status === 'attained') repMap[rep].attained += acv;
      else if (status === 'commit') repMap[rep].commit += acv;
      else if (status === 'likely') repMap[rep].likely += acv;
    });

    return Object.values(repMap)
      .filter(r => (leaderboardSortBy === 'commit' ? r.commit > 0 : r.attained > 0))
      .sort((a, b) => {
        if (leaderboardSortBy === 'commit') {
          return b.commit - a.commit || b.attained - a.attained;
        }
        return b.attained - a.attained || b.commit - a.commit;
      });
  }, [filteredDeals, leaderboardSortBy]);

  const partnerSourceOptions = useMemo(() => {
    const set = new Set();
    deals.forEach(d => {
      if (d.sourcePartner) {
        d.sourcePartner.split(';').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s));
      }
    });
    return Array.from(set).sort();
  }, [deals]);

  const partnerInfluenceOptions = useMemo(() => {
    const set = new Set();
    deals.forEach(d => {
      if (d.partnerInfluence) {
        d.partnerInfluence.split(';').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s));
      }
    });
    return Array.from(set).sort();
  }, [deals]);

  const partnerData = useMemo(() => {
    let relevantDeals = deals;
    if (teamFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => normalizeTeamLabel(d.team) === teamFilter);
    }
    if (partnerSourceFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d =>
        (d.sourcePartner || '').split(';').map(s => s.trim()).includes(partnerSourceFilter)
      );
    }
    if (partnerInfluenceFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d =>
        (d.partnerInfluence || '').split(';').map(s => s.trim()).includes(partnerInfluenceFilter)
      );
    }

    const counts = {};
    relevantDeals.forEach(d => {
      const combinedPartners = new Set();
      if (d.partnerInfluence) {
        d.partnerInfluence.split(';').map(p => p.trim()).filter(Boolean).forEach(p => combinedPartners.add(p));
      }
      if (d.sourcePartner) {
        d.sourcePartner.split(';').map(p => p.trim()).filter(Boolean).forEach(p => combinedPartners.add(p));
      }

      combinedPartners.forEach(p => {
        if (!counts[p]) {
          counts[p] = { name: p, count: 0, acv: 0, attachedCount: 0, sourcedCount: 0, deals: [] };
        }
        counts[p].count += 1;
        counts[p].acv += (d.acv || 0);
        counts[p].deals.push(d);
        if (d.partnerAttached) counts[p].attachedCount += 1;
        if (d.isPartnerSourced || (d.sourcePartner && d.sourcePartner.toLowerCase().includes(p.toLowerCase()))) {
          counts[p].sourcedCount += 1;
        }
      });
    });

    return Object.values(counts).sort((a, b) => b.acv - a.acv || b.count - a.count);
  }, [deals, teamFilter, partnerSourceFilter, partnerInfluenceFilter]);

  const crossbeamData = useMemo(() => {
    const list = [];
    deals.forEach(d => {
      if (teamFilter !== 'ALL' && normalizeTeamLabel(d.team) !== teamFilter) return;
      if (sourceFilter !== 'ALL' && d.source !== sourceFilter) return;

      if (d.crossbeamPartners) {
        const parts = d.crossbeamPartners.split(';').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          list.push({
            partner: p,
            dealName: d.name,
            dealId: d.id,
            ae: d.ae || 'Unassigned',
            bdr: d.bdr || 'Unassigned',
            team: d.team,
            acv: d.acv || 0,
            stage: d.stage || 'Qualifying',
            commitStatus: d.commitStatus,
            source: d.source,
            closeDate: d.closeDate
          });
        });
      }
    });
    return list;
  }, [deals, teamFilter, sourceFilter]);

  const crossbeamPartnersList = useMemo(() => Array.from(new Set(crossbeamData.map(i => i.partner))).sort(), [crossbeamData]);
  const crossbeamRepsList = useMemo(() => Array.from(new Set(crossbeamData.map(i => i.ae).filter(Boolean))).sort(), [crossbeamData]);
  const crossbeamBdsList = useMemo(() => Array.from(new Set(crossbeamData.map(i => i.bdr).filter(b => b && b !== 'Unassigned'))).sort(), [crossbeamData]);
  const crossbeamStagesList = useMemo(() => Array.from(new Set(crossbeamData.map(i => i.stage).filter(Boolean))).sort(), [crossbeamData]);

  const filteredCrossbeamData = useMemo(() => {
    return crossbeamData.filter(item => {
      const matchesPartner = crossbeamPartnerFilter === 'ALL' || item.partner === crossbeamPartnerFilter;
      const matchesRep = crossbeamRepFilter === 'ALL' || item.ae === crossbeamRepFilter;
      const matchesBd = crossbeamBdFilter === 'ALL' || item.bdr === crossbeamBdFilter;
      const matchesStage = crossbeamStageFilter === 'ALL' || item.stage === crossbeamStageFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
                            (item.dealName || '').toLowerCase().includes(q) ||
                            (item.partner || '').toLowerCase().includes(q) ||
                            (item.ae || '').toLowerCase().includes(q) ||
                            (item.bdr || '').toLowerCase().includes(q);
      return matchesPartner && matchesRep && matchesBd && matchesStage && matchesSearch;
    });
  }, [crossbeamData, crossbeamPartnerFilter, crossbeamRepFilter, crossbeamBdFilter, crossbeamStageFilter, searchQuery]);

  // Focus Opportunities:
  // First Column (LHS): PQL & MQL Accounts (ANZ Prospecting Tab)
  // Second Column (RHS): Qualifying Opportunities Closing in 0-90 Days (ANZ Tab)
  const focusProspectingFirstCol = useMemo(() => {
    const q = focusSearch.toLowerCase();
    return prospectingRecords
      .filter(p => {
        if (teamFilter !== 'ALL' && normalizeTeamLabel(p.team) !== teamFilter) return false;
        const st = (p.stage || '').toLowerCase();
        if (st === 'already in pipe') return false;
        const isMqlOrPql = st.includes('mql') || st.includes('pql');
        if (!isMqlOrPql) return false;
        if (q) {
          return (p.name || '').toLowerCase().includes(q) ||
                 (p.ae || '').toLowerCase().includes(q) ||
                 (p.bdr || '').toLowerCase().includes(q) ||
                 (p.crossbeamPartners || '').toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const aIsMql = (a.stage || '').toLowerCase().includes('mql') ? 0 : 1;
        const bIsMql = (b.stage || '').toLowerCase().includes('mql') ? 0 : 1;
        if (aIsMql !== bIsMql) return aIsMql - bIsMql;
        return (b.acv || 0) - (a.acv || 0);
      });
  }, [prospectingRecords, teamFilter, focusSearch]);

  const focusQualifyingSecondCol = useMemo(() => {
    const q = focusSearch.toLowerCase();
    return deals
      .map(d => ({ ...d, days: getDaysUntilClose(d.closeDate) }))
      .filter(d => {
        if (teamFilter !== 'ALL' && normalizeTeamLabel(d.team) !== teamFilter) return false;
        if (sourceFilter !== 'ALL' && d.source !== sourceFilter) return false;
        const isQualifying = (d.stage || '').trim().toLowerCase() === 'qualifying';
        if (!isQualifying) return false;
        if (d.days < 0 || d.days > 90) return false;
        if (q) {
          return (d.name || '').toLowerCase().includes(q) ||
                 (d.ae || '').toLowerCase().includes(q) ||
                 (d.bdr || '').toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => a.days - b.days);
  }, [deals, teamFilter, sourceFilter, focusSearch]);

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
            <Compass className="w-3.5 h-3.5" /> Focus Opportunities
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Team:
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold flex-wrap">
              {['ALL', 'ANZ ENT', 'ANZ Scale', 'ANZ SMB', 'ANZ AM'].map(tm => (
                <button key={tm} onClick={() => setTeamFilter(tm)} className={`px-3 py-1.5 rounded-md transition ${teamFilter === tm ? 'bg-[#1B0B3B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                  {tm}
                </button>
              ))}
            </div>
          </div>

          {activeTab !== 'partners' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                {['ALL', 'Marketing Sourced', 'BDR Sourced'].map(src => (
                  <button key={src} onClick={() => setSourceFilter(src)} className={`px-3 py-1.5 rounded-md transition ${sourceFilter === src ? 'bg-[#FF595A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                    {src}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1st Card: TARGET */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>{teamFilter !== 'ALL' ? teamFilter : (sourceFilter !== 'ALL' ? sourceFilter : 'TOTAL ANZ')} TARGET</span>
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">${(activeMetrics.target / 1000000).toFixed(2)}M</div>
                {sourceFilter !== 'ALL' && teamFilter !== 'ALL' && (
                  <div className="text-[11px] text-slate-500 mt-1">Filtered by {sourceFilter}</div>
                )}
              </div>

              {/* 2nd Card: PG ATTAINED */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>PG ATTAINED</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">${(activeMetrics.attained / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">{activeMetrics.percentage}% of Target</div>
              </div>

              {/* 3rd Card: REMAINING GAP */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>REMAINING GAP</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-rose-600">${(activeMetrics.remainingGap / 1000000).toFixed(2)}M</div>
              </div>

              {/* 4th Card: COMMIT / LIKELY PATH */}
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
            </div>

            {teamFilter === 'ALL' ? (
              <div className="space-y-4">
                <div className="max-w-xl mx-auto">
                  <TeamSpeedometer
                    isMaster={true}
                    title={`Master Total ANZ Pipeline Pacing${sourceFilter !== 'ALL' ? ` (${sourceFilter})` : ''}`}
                    target={activeMetrics.target}
                    attained={activeMetrics.attained}
                    commit={activeMetrics.commit}
                    likely={activeMetrics.likely}
                    pool={activeMetrics.pool}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {['ANZ ENT', 'ANZ Scale', 'ANZ SMB', 'ANZ AM'].map(tm => {
                    const m = computeSliceMetrics(tm, sourceFilter);
                    return (
                      <TeamSpeedometer
                        key={tm}
                        title={`${tm} Pacing${sourceFilter !== 'ALL' ? ` (${sourceFilter.replace(' Sourced', '')})` : ''}`}
                        target={m.target}
                        attained={m.attained}
                        commit={m.commit}
                        likely={m.likely}
                        pool={m.pool}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                <TeamSpeedometer
                  isMaster={true}
                  title={`${teamFilter} Pipeline Pacing${sourceFilter !== 'ALL' ? ` (${sourceFilter})` : ''}`}
                  target={activeMetrics.target}
                  attained={activeMetrics.attained}
                  commit={activeMetrics.commit}
                  likely={activeMetrics.likely}
                  pool={activeMetrics.pool}
                />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-sm">Opportunities ({filteredDeals.length})</h3>
                <input
                  type="text"
                  placeholder="Search opportunity, rep, BDR, partner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs border rounded-lg px-3 py-1.5 focus:outline-none w-64"
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Rep Pipeline Leaderboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {teamFilter === 'ALL' ? 'All ANZ Teams' : teamFilter} · {sourceFilter === 'ALL' ? 'All Sources' : sourceFilter} · Ranked by {leaderboardSortBy === 'commit' ? 'Most in Commit' : 'Pipeline Attained'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter rep or deal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none w-48"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rank By:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                    <button
                      onClick={() => setLeaderboardSortBy('attained')}
                      className={`px-3 py-1.5 rounded-md transition ${leaderboardSortBy === 'attained' ? 'bg-[#1B0B3B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Pipeline Attained
                    </button>
                    <button
                      onClick={() => setLeaderboardSortBy('commit')}
                      className={`px-3 py-1.5 rounded-md transition ${leaderboardSortBy === 'commit' ? 'bg-[#FF595A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Most in Commit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {leaderboardData.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                No reps have {leaderboardSortBy === 'commit' ? 'Commit' : 'Pipeline Attained'} deals for {teamFilter === 'ALL' ? 'All Teams' : teamFilter} ({sourceFilter === 'ALL' ? 'All Sources' : sourceFilter}).
              </div>
            ) : (
              <>
                <PodiumCards
                  items={leaderboardData}
                  filterKey={`${teamFilter}-${sourceFilter}-${leaderboardSortBy}-${searchQuery}`}
                  metricLabel={leaderboardSortBy === 'commit' ? 'Total Commit ACV' : 'Pipeline Attained ACV'}
                  subMetricLabel={leaderboardSortBy === 'commit' ? 'Pipeline Attained' : 'Commit ACV'}
                  formatValue={(r) => `$${(leaderboardSortBy === 'commit' ? r.commit : r.attained).toLocaleString()}`}
                  formatSubValue={(r) => `$${(leaderboardSortBy === 'commit' ? r.attained : r.commit).toLocaleString()}`}
                  onSelect={(repName) => setSelectedRep(prev => prev === repName ? null : repName)}
                />

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                        <th className="py-3 px-4">Rank & Account Executive</th>
                        <th className="py-3 px-4 text-right">Attained</th>
                        <th className="py-3 px-4 text-right">Commit</th>
                        <th className="py-3 px-4 text-right">Total Working Pool</th>
                        <th className="py-3 px-4 text-center">Deals</th>
                        <th className="py-3 px-4 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboardData.map((r, idx) => {
                        const isExpanded = selectedRep === r.name;
                        const matchingDeals = r.deals.filter(d => {
                          const st = String(d.commitStatus || '').trim().toLowerCase();
                          return leaderboardSortBy === 'commit' ? st === 'commit' : st === 'attained';
                        });
                        return (
                          <React.Fragment key={r.name}>
                            <tr className={`hover:bg-slate-50 cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : ''}`} onClick={() => setSelectedRep(isExpanded ? null : r.name)}>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                <span className="inline-block w-6 text-slate-400">#{idx + 1}</span> {r.name}
                              </td>
                              <td className={`py-3 px-4 text-right font-black ${leaderboardSortBy === 'attained' ? 'text-emerald-600' : 'text-slate-700'}`}>${r.attained.toLocaleString()}</td>
                              <td className={`py-3 px-4 text-right font-bold ${leaderboardSortBy === 'commit' ? 'text-indigo-700' : 'text-slate-600'}`}>${r.commit.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right font-medium">${r.pool.toLocaleString()}</td>
                              <td className="py-3 px-4 text-center">{matchingDeals.length}</td>
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
                                    <h4 className="font-bold text-xs">
                                      {leaderboardSortBy === 'commit' ? 'Commit' : 'Attained'} Deals for {r.name}
                                    </h4>
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
                                        {matchingDeals.map(d => (
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
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Partner Ecosystem Leaderboard
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Partner Source (Col Z):</span>
                  <select
                    value={partnerSourceFilter}
                    onChange={(e) => setPartnerSourceFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 font-medium"
                  >
                    <option value="ALL">All Source Partners ({partnerSourceOptions.length})</option>
                    {partnerSourceOptions.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Partner Influence (Col Y):</span>
                  <select
                    value={partnerInfluenceFilter}
                    onChange={(e) => setPartnerInfluenceFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 font-medium"
                  >
                    <option value="ALL">All Partner Influence ({partnerInfluenceOptions.length})</option>
                    {partnerInfluenceOptions.map(pi => <option key={pi} value={pi}>{pi}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <PodiumCards
              items={partnerData}
              filterKey={`${teamFilter}-${partnerSourceFilter}-${partnerInfluenceFilter}`}
              metricLabel="Partner ACV"
              subMetricLabel="Attached / Sourced Deals"
              formatValue={(p) => `$${p.acv.toLocaleString()}`}
              formatSubValue={(p) => `${p.attachedCount} Attached · ${p.sourcedCount} Sourced`}
              onSelect={(pName) => setSelectedEcosystemPartner(prev => prev === pName ? null : pName)}
            />

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                    <th className="py-3 px-4">Partner</th>
                    <th className="py-3 px-4 text-center">Tagged Deals</th>
                    <th className="py-3 px-4 text-center">Attached</th>
                    <th className="py-3 px-4 text-center">Sourced</th>
                    <th className="py-3 px-4 text-right">Total Partner ACV</th>
                    <th className="py-3 px-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerData.map((p, idx) => {
                    const isExpanded = selectedEcosystemPartner === p.name;
                    return (
                      <React.Fragment key={p.name}>
                        <tr className={`hover:bg-slate-50 cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : ''}`} onClick={() => setSelectedEcosystemPartner(isExpanded ? null : p.name)}>
                          <td className="py-3 px-4 font-bold text-slate-900">{idx + 1}. {p.name}</td>
                          <td className="py-3 px-4 text-center">{p.count}</td>
                          <td className="py-3 px-4 text-center text-indigo-700 font-bold">{p.attachedCount}</td>
                          <td className="py-3 px-4 text-center text-emerald-700 font-bold">{p.sourcedCount}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">${p.acv.toLocaleString()}</td>
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
                                <h4 className="font-bold text-xs">Deals associated with {p.name}</h4>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b text-slate-500 font-semibold">
                                      <th className="py-2 text-left">Opportunity</th>
                                      <th className="py-2 text-left">AE</th>
                                      <th className="py-2 text-left">Partner Source (Col Z)</th>
                                      <th className="py-2 text-left">Partner Influence (Col Y)</th>
                                      <th className="py-2 text-right">ACV</th>
                                      <th className="py-2 text-center">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {p.deals.map(d => (
                                      <tr key={d.id}>
                                        <td className="py-2 font-medium text-indigo-600">{d.name}</td>
                                        <td className="py-2">{d.ae}</td>
                                        <td className="py-2 text-slate-600">{d.sourcePartner || '—'}</td>
                                        <td className="py-2 text-slate-600">{d.partnerInfluence || '—'}</td>
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
              <Share2 className="w-5 h-5 text-[#635BFF]" /> Crossbeam Partner Overlaps ({filteredCrossbeamData.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border">
              <select value={crossbeamRepFilter} onChange={(e) => setCrossbeamRepFilter(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium">
                <option value="ALL">All Reps / AEs ({crossbeamRepsList.length})</option>
                {crossbeamRepsList.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={crossbeamBdFilter} onChange={(e) => setCrossbeamBdFilter(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium">
                <option value="ALL">All BDs / BDRs ({crossbeamBdsList.length})</option>
                {crossbeamBdsList.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={crossbeamPartnerFilter} onChange={(e) => setCrossbeamPartnerFilter(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium">
                <option value="ALL">All Partners ({crossbeamPartnersList.length})</option>
                {crossbeamPartnersList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={crossbeamStageFilter} onChange={(e) => setCrossbeamStageFilter(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium">
                <option value="ALL">All Stages ({crossbeamStagesList.length})</option>
                {crossbeamStagesList.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                    <th className="py-3 px-4">Partner</th>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-3">AE (Rep)</th>
                    <th className="py-3 px-3">BD (BDR)</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3 text-right">ACV</th>
                    <th className="py-3 px-3">Close Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCrossbeamData.map((i, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{i.partner}</td>
                      <td className="py-3 px-4 font-medium text-indigo-600">{i.dealName}</td>
                      <td className="py-3 px-3">{i.ae}</td>
                      <td className="py-3 px-3 text-slate-600">{i.bdr}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {i.stage}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold">${i.acv.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-500">{i.closeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: FOCUS OPPORTUNITIES                                          */}
        {/*   First Column (LHS): PQL & MQL Accounts (ANZ Prospecting Tab)      */}
        {/*   Second Column (RHS): Qualifying Opportunities Closing in 0-90d    */}
        {/* =================================================================== */}
        {activeTab === 'focus' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#FF595A]" /> Focus Opportunities
              </h2>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  placeholder="Filter accounts, AEs, BDRs..."
                  value={focusSearch}
                  onChange={(e) => setFocusSearch(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Column (LHS): ANZ Prospecting Accounts (MQL & PQL) */}
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-3 rounded-xl font-bold text-xs flex justify-between items-center">
                  <span>ANZ Prospecting Accounts (MQL & PQL)</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[11px]">{focusProspectingFirstCol.length} Accounts</span>
                </div>

                <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
                  {focusProspectingFirstCol.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                      No Prospecting | MQL or Prospecting | PQL accounts match the current filter.
                    </div>
                  ) : (
                    focusProspectingFirstCol.map(p => {
                      const isMql = (p.stage || '').toLowerCase().includes('mql');
                      return (
                        <div key={p.id} className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-xs hover:border-indigo-300 transition space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-xs text-slate-900">{p.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                              isMql
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {p.stage}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>{p.team || 'ANZ'} · AE: <strong className="text-slate-800">{p.ae || 'Unassigned'}</strong>{p.bdr ? ` · BDR: ${p.bdr}` : ''}</span>
                            <span className="font-black text-slate-900">${(p.acv || 0).toLocaleString()}</span>
                          </div>
                          {p.crossbeamPartners && (
                            <div className="text-[11px] text-indigo-700 font-medium">
                              Partner: {p.crossbeamPartners}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Second Column (RHS): Qualifying Opportunities in ANZ Tab closing in 0-90 days */}
              <div className="space-y-3">
                <div className="bg-rose-50 border border-rose-200 text-rose-950 p-3 rounded-xl font-bold text-xs flex justify-between items-center">
                  <span>Qualifying Opportunities Closing in 0–90 Days</span>
                  <span className="bg-[#FF595A] text-white px-2 py-0.5 rounded-full text-[11px]">{focusQualifyingSecondCol.length} Deals</span>
                </div>

                <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
                  {focusQualifyingSecondCol.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                      No Qualifying stage opportunities closing within 0–90 days match the current filter.
                    </div>
                  ) : (
                    focusQualifyingSecondCol.map(d => (
                      <div key={d.id} className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-xs hover:border-rose-300 transition space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          {d.id.startsWith('006') ? (
                            <a href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`} target="_blank" rel="noreferrer" className="font-bold text-xs text-indigo-600 hover:underline flex items-center gap-1">
                              {d.name} <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="font-bold text-xs text-slate-900">{d.name}</span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 whitespace-nowrap">
                            {d.days}d ({d.closeDate})
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{d.team} · AE: <strong className="text-slate-800">{d.ae}</strong> · <span className="font-medium">{d.source}</span></span>
                          <span className="font-black text-slate-900">${(d.acv || 0).toLocaleString()}</span>
                        </div>
                        {d.nextSteps && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 truncate" title={d.nextSteps}>
                            Next: {d.nextSteps}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
