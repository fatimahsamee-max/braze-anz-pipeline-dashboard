import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Target, ExternalLink, BarChart3, Filter, Award, Search, 
  RefreshCw, CheckCircle2, AlertCircle, Layers, X, Sparkles, Compass, Share2, Users, ChevronRight
} from 'lucide-react';

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSChLkaPJrSjfFtM1vTWbkl2uffjadl-oV5qCdkTIIqsE7kVU_3eh3Vp4suNJfjUltlcT1t00Pi9KIP/pub?gid=2048510077&single=true&output=csv";
const HISTORY_CSV_URL = ""; // Optional: Published CSV URL of 'Pipeline_History' tab

const INITIAL_TARGETS = {
  total: 18710000,
  inbound: 10000000,
  outbound: 10820000,
  teams: {
    'ANZ ENT': 9650000,
    'ANZ Scale': 4980000,
    'ANZ SMB': 1280000,
    'ANZ AM': 2800000
  }
};

// Executive Summary: Day-over-Day and Week-over-Week Pipeline Velocity
function ExecutiveMovementSummary({ historyData, deals, targets, activeTeamFilter }) {
  const [timeframe, setTimeframe] = useState('DoD');
  const [selectedTeam, setSelectedTeam] = useState(activeTeamFilter || 'ALL');

  useEffect(() => {
    if (activeTeamFilter) {
      setSelectedTeam(activeTeamFilter);
    }
  }, [activeTeamFilter]);

  const currentTeamMetrics = useMemo(() => {
    let filteredDeals = deals;
    let target = targets.total;

    if (selectedTeam !== 'ALL') {
      filteredDeals = deals.filter(d => {
        const t = (d.team || '').toUpperCase();
        if (selectedTeam === 'ANZ ENT') return t.includes('ENT');
        if (selectedTeam === 'ANZ Scale') return t.includes('SCALE');
        if (selectedTeam === 'ANZ SMB') return t.includes('SMB');
        if (selectedTeam === 'ANZ AM') return t.includes('AM') || t.includes('STRATEGIC');
        return false;
      });
      target = targets.teams[selectedTeam] || 0;
    }

    const pool = filteredDeals.reduce((sum, d) => sum + d.acv, 0);
    const attained = filteredDeals.filter(d => d.commitStatus === 'Attained' || d.stage === 'Closed Won').reduce((sum, d) => sum + d.acv, 0);
    const commit = filteredDeals.filter(d => d.commitStatus === 'Commit').reduce((sum, d) => sum + d.acv, 0);
    const likely = filteredDeals.filter(d => d.commitStatus === 'Likely').reduce((sum, d) => sum + d.acv, 0);
    const path = commit + (likely * 0.5);
    const gap = Math.max(0, target - attained);

    return { pool, attained, commit, likely, path, gap, target };
  }, [deals, targets, selectedTeam]);

  const deltas = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return { attained: 0, commit: 0, likely: 0, pool: 0, gap: 0, baselineDate: 'Awaiting daily snapshot' };
    }

    const teamHistory = historyData
      .filter(h => (h.team || 'ALL').toUpperCase() === selectedTeam.toUpperCase())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (teamHistory.length === 0) {
      return { attained: 0, commit: 0, likely: 0, pool: 0, gap: 0, baselineDate: 'No prior data' };
    }

    let baseline = teamHistory[teamHistory.length - 2];
    if (timeframe === 'WoW') {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 7);
      baseline = teamHistory.find(h => new Date(h.date) <= targetDate) || teamHistory[0];
    }

    if (!baseline) {
      baseline = teamHistory[teamHistory.length - 1];
    }

    return {
      attained: currentTeamMetrics.attained - (baseline.attained || 0),
      commit: currentTeamMetrics.commit - (baseline.commit || 0),
      likely: currentTeamMetrics.likely - (baseline.likely || 0),
      pool: currentTeamMetrics.pool - (baseline.pool || 0),
      gap: currentTeamMetrics.gap - (baseline.gap || 0),
      baselineDate: baseline.date
    };
  }, [historyData, currentTeamMetrics, selectedTeam, timeframe]);

  const formatDelta = (val, reverseColor = false) => {
    const isPositive = val > 0;
    const isZero = val === 0;
    const absStr = `$${(Math.abs(val) / 1000).toLocaleString()}k`;

    let color = isPositive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200';
    if (reverseColor) {
      color = isPositive ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
    if (isZero) color = 'text-slate-600 bg-slate-50 border-slate-200';

    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${color}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : !isZero ? <TrendingDown className="w-3 h-3" /> : null}
        {isPositive ? `+${absStr}` : !isZero ? `-${absStr}` : '$0'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF595A]" /> Executive Pipeline Movement & Velocity
          </h2>
          <p className="text-[11px] text-slate-500">
            Movement baseline: <strong className="text-slate-700">{deltas.baselineDate}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            {['ALL', 'ANZ ENT', 'ANZ Scale', 'ANZ SMB', 'ANZ AM'].map(tm => (
              <button
                key={tm}
                onClick={() => setSelectedTeam(tm)}
                className={`px-2.5 py-1 rounded-md transition ${
                  selectedTeam === tm ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tm}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTimeframe('DoD')}
              className={`px-3 py-1 rounded-md transition ${
                timeframe === 'DoD' ? 'bg-[#1B0B3B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              DoD
            </button>
            <button
              onClick={() => setTimeframe('WoW')}
              className={`px-3 py-1 rounded-md transition ${
                timeframe === 'WoW' ? 'bg-[#1B0B3B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              WoW
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">PG Attained (S2+)</div>
          <div className="text-lg font-black text-slate-900">${(currentTeamMetrics.attained / 1000000).toFixed(2)}M</div>
          <div className="mt-2">{formatDelta(deltas.attained)}</div>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Commit Stage</div>
          <div className="text-lg font-black text-slate-900">${(currentTeamMetrics.commit / 1000000).toFixed(2)}M</div>
          <div className="mt-2">{formatDelta(deltas.commit)}</div>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Likely Stage</div>
          <div className="text-lg font-black text-slate-900">${(currentTeamMetrics.likely / 1000000).toFixed(2)}M</div>
          <div className="mt-2">{formatDelta(deltas.likely)}</div>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Working Pool</div>
          <div className="text-lg font-black text-slate-900">${(currentTeamMetrics.pool / 1000000).toFixed(2)}M</div>
          <div className="mt-2">{formatDelta(deltas.pool)}</div>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 col-span-2 md:col-span-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Attained Gap</div>
          <div className="text-lg font-black text-rose-600">${(currentTeamMetrics.gap / 1000000).toFixed(2)}M</div>
          <div className="mt-2">{formatDelta(deltas.gap, true)}</div>
        </div>
      </div>
    </div>
  );
}

// Speedometer Gauge: Needle moves strictly based on Pipeline Generation (Attained)
function TeamSpeedometer({ title, target, deals }) {
  const teamPool = deals.reduce((sum, d) => sum + d.acv, 0);
  
  const attained = deals
    .filter(d => d.commitStatus === 'Attained' || d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.acv, 0);

  const commit = deals.filter(d => d.commitStatus === 'Commit').reduce((sum, d) => sum + d.acv, 0);
  const likely = deals.filter(d => d.commitStatus === 'Likely').reduce((sum, d) => sum + d.acv, 0);
  const path = commit + (likely * 0.5);
  
  const gap = Math.max(0, target - attained);
  const percentage = target > 0 ? Math.min(100, Math.round((attained / target) * 100)) : 0;
  const coveragePercent = target > 0 ? Math.min(100, Math.round((teamPool / target) * 100)) : 0;
  const pathPercent = target > 0 ? Math.min(100, Math.round((path / target) * 100)) : 0;

  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 95;

  const clampedVal = Math.min(Math.max(attained, 0), target);
  const ratio = target > 0 ? clampedVal / target : 0;
  const needleAngle = -90 + ratio * 180;

  const formatShort = (num) => {
    if (num >= 1000000) return `USD ${(num / 1000000).toFixed(1)}M`;
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
              <text
                x={t.tx}
                y={t.ty + (idx === 0 || idx === 4 ? 4 : 0)}
                textAnchor="middle"
                fontSize="6"
                fill="#64748B"
                fontWeight="500"
              >
                {t.label}
              </text>
            </g>
          ))}

          <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`}>
            <polygon
              points={`${cx - 2},${cy} ${cx - 0.5},${cy - radius + 4} ${cx + 0.5},${cy - radius + 4} ${cx + 2},${cy}`}
              fill="#1E293B"
            />
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
            title={`Commit: ${formatShort(commit)}`}
          />
          <div 
            className="bg-indigo-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, target > 0 ? (likely / target) * 100 : 0)}%` }} 
            title={`Likely: ${formatShort(likely)}`}
          />
          <div 
            className="bg-slate-300 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, target > 0 ? Math.max(0, (teamPool - commit - likely) / target) * 100 : 0)}%` }} 
            title={`Other Pipeline: ${formatShort(Math.max(0, teamPool - commit - likely))}`}
          />
        </div>

        <div className="flex justify-between items-center text-[9.5px] text-slate-500 pt-0.5">
          <span>Path: <strong className="text-slate-800">{formatShort(path)}</strong> ({pathPercent}%)</span>
          <span>Pool: <strong className="text-slate-800">{formatShort(teamPool)}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [motionFilter, setMotionFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Rep Filter for Leaderboard
  const [selectedRep, setSelectedRep] = useState('ALL');

  // Interactive Partner Filter for Partner Ecosystem Tab
  const [selectedEcosystemPartner, setSelectedEcosystemPartner] = useState('ALL');

  // Crossbeam Overlaps Tab filters
  const [crossbeamPartnerFilter, setCrossbeamPartnerFilter] = useState('ALL');
  const [crossbeamRepFilter, setCrossbeamRepFilter] = useState('ALL');

  const [deals, setDeals] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Loading...');

  // Australian Date Parser (DD/MM/YYYY)
  const getDaysUntilClose = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return 999;
    const clean = dateStr.trim();
    if (!clean) return 999;

    let targetDate = null;
    const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (dmyMatch) {
      const p1 = parseInt(dmyMatch[1], 10);
      const p2 = parseInt(dmyMatch[2], 10);
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000;

      if (p1 > 12 && p2 <= 12) {
        targetDate = new Date(year, p2 - 1, p1);
      } else if (p2 > 12 && p1 <= 12) {
        targetDate = new Date(year, p1 - 1, p2);
      } else {
        targetDate = new Date(year, p2 - 1, p1);
      }
    } else {
      targetDate = new Date(clean);
    }

    if (!targetDate || isNaN(targetDate.getTime())) return 999;

    const today = new Date('2026-11-03');
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const parseCSVRow = (text) => {
    let p = '', row = [''], r = 0, q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (q && p === '"') { row[r] += '"'; }
        q = !q;
      } else if (c === ',' && !q) {
        r++;
        row[r] = '';
      } else {
        row[r] += c;
      }
      p = c;
    }
    return row.map(v => v ? v.trim().replace(/^"|"$/g, '') : '');
  };

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    const timestamp = Date.now();
    const rawUrl = `${SHEET_CSV_URL}&_t=${timestamp}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;

    try {
      let res;
      try {
        res = await fetch(rawUrl);
        if (!res.ok) throw new Error('Direct fetch failed');
      } catch (e) {
        res = await fetch(proxyUrl);
      }

      const csvText = await res.text();
      const rawLines = csvText.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');

      let headerIdx = -1;
      for (let i = 0; i < Math.min(rawLines.length, 50); i++) {
        const lineLower = rawLines[i].toLowerCase();
        if (lineLower.includes('opportunity') || lineLower.includes('account / opportunity')) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx !== -1) {
        const headers = parseCSVRow(rawLines[headerIdx]).map(h => h.toLowerCase());
        
        const getIdx = (keys) => {
          for (const k of keys) {
            const found = headers.findIndex(h => h.includes(k));
            if (found !== -1) return found;
          }
          return -1;
        };

        const idCol = getIdx(['opportunity id', 'id']);
        const nameCol = getIdx(['account / opportunity', 'opportunity name', 'name']);
        const teamCol = getIdx(['team', 'territory']);
        const stageCol = headers.findIndex(h => h === 'stage');
        const acvCol = getIdx(['acv', 'amount']);
        const aeCol = getIdx(['ae', 'owner']);
        const bdrCol = getIdx(['bdr']);
        
        // Column H: Partner (s)
        const partnersCol = headers.findIndex(h => h.includes('partner (s)') || (h.includes('partner') && !h.includes('attached') && !h.includes('sourced') && !h.includes('crossbeam')));
        
        const attachedCol = getIdx(['partner attached', 'attached']);
        const sourcedCol = getIdx(['partner sourced', 'sourced']);
        const commitCol = getIdx(['liklihood', 'likelihood', 'stage 1 commit', 'commit']);
        const dateCol = getIdx(['close date']);
        const motionCol = getIdx(['inbound/outbound', 'motion']);
        const typeCol = headers.findIndex(h => h === 'type');
        
        // Column Y: Crossbeam Partners
        const crossbeamCol = headers.findIndex(h => h.includes('crossbeam'));

        const parsedDeals = [];

        for (let i = headerIdx + 1; i < rawLines.length; i++) {
          const cols = parseCSVRow(rawLines[i]);
          const oppId = cols[idCol !== -1 ? idCol : 0];
          let oppName = cols[nameCol !== -1 ? nameCol : 1];

          if (!oppName || oppName.toLowerCase().includes('total')) continue;

          if (oppName.includes('HYPERLINK(')) {
            const match = oppName.match(/,"([^"]+)"\)/);
            if (match) oppName = match[1];
          }

          const rawAcv = cols[acvCol !== -1 ? acvCol : 4] || '0';
          const cleanAcv = parseFloat(rawAcv.replace(/[^0-9.-]/g, '')) || 0;
          
          const attachedVal = (cols[attachedCol !== -1 ? attachedCol : 8] || '').toLowerCase();
          const isAttached = attachedVal === 'yes' || attachedVal === '1' || attachedVal === 'true';

          const sourcedVal = String(cols[sourcedCol !== -1 ? sourcedCol : 9] || '').trim();
          const isSourced = sourcedVal.toLowerCase() === 'yes' || 
                            sourcedVal.toLowerCase().includes('sourced') || 
                            sourcedVal.toLowerCase() === '1';

          let rawCommit = cols[commitCol !== -1 ? commitCol : 18] || 'Non Commit';
          if (!rawCommit || rawCommit.trim() === '') rawCommit = 'Non Commit';

          parsedDeals.push({
            id: oppId || `deal-${i}`,
            name: oppName,
            team: cols[teamCol !== -1 ? teamCol : 2] || 'ANZ ENT',
            stage: cols[stageCol !== -1 ? stageCol : 3] || 'Qualifying',
            acv: cleanAcv,
            ae: cols[aeCol !== -1 ? aeCol : 5] || 'Unassigned',
            bdr: cols[bdrCol !== -1 ? bdrCol : 6] || '',
            // Column H: Partner (s)
            partners: cols[partnersCol !== -1 ? partnersCol : 7] || '',
            // Column Y: Crossbeam Partners
            crossbeamPartners: cols[crossbeamCol !== -1 ? crossbeamCol : 24] || '',
            partnerAttached: isAttached,
            partnerSourcedDetail: sourcedVal,
            isPartnerSourced: isSourced,
            commitStatus: rawCommit,
            closeDate: cols[dateCol !== -1 ? dateCol : 20] || '',
            motion: cols[motionCol !== -1 ? motionCol : 22] || 'Outbound',
            type: cols[typeCol !== -1 ? typeCol : 23] || 'New Business'
          });
        }

        if (parsedDeals.length > 0) {
          setDeals(parsedDeals);
        }
      }

      if (HISTORY_CSV_URL && !HISTORY_CSV_URL.includes("PASTE_")) {
        try {
          const hUrl = `${HISTORY_CSV_URL}&_t=${Date.now()}`;
          const hProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(hUrl)}`;
          let hRes;
          try { hRes = await fetch(hUrl); } catch (e) { hRes = await fetch(hProxy); }
          if (hRes.ok) {
            const hText = await hRes.text();
            const hLines = hText.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');
            const parsedH = hLines.slice(1).map(l => {
              const c = l.split(',');
              return {
                date: c[0],
                team: c[1] || 'ALL',
                attained: parseFloat(c[2]) || 0,
                commit: parseFloat(c[3]) || 0,
                likely: parseFloat(c[4]) || 0,
                path: parseFloat(c[5]) || 0,
                pool: parseFloat(c[6]) || 0,
                gap: parseFloat(c[7]) || 0
              };
            });
            setHistoryData(parsedH);
          }
        } catch (err) {
          console.warn("Could not load history CSV:", err);
        }
      }

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn("Could not sync live deals from GSheet:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const metrics = useMemo(() => {
    let relevantDeals = deals;
    
    if (teamFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => {
        const t = (d.team || '').toUpperCase();
        if (teamFilter === 'ANZ ENT') return t.includes('ENT');
        if (teamFilter === 'ANZ Scale') return t.includes('SCALE');
        if (teamFilter === 'ANZ SMB') return t.includes('SMB');
        if (teamFilter === 'ANZ AM') return t.includes('AM') || t.includes('STRATEGIC');
        return false;
      });
    }

    if (motionFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => d.motion === motionFilter);
    }

    const qualifyingPipe = relevantDeals.filter(d => d.stage === 'Qualifying' || d.stage === 'Discovery+').reduce((sum, d) => sum + d.acv, 0);
    const prospectingPipe = relevantDeals.filter(d => d.stage.toLowerCase().includes('prospect')).reduce((sum, d) => sum + d.acv, 0);
    const totalWorkingPool = qualifyingPipe + prospectingPipe;

    const attainedPipe = relevantDeals.filter(d => d.commitStatus === 'Attained' || d.stage === 'Closed Won').reduce((sum, d) => sum + d.acv, 0);
    const commitPipe = relevantDeals.filter(d => d.commitStatus === 'Commit').reduce((sum, d) => sum + d.acv, 0);
    const likelyPipe = relevantDeals.filter(d => d.commitStatus === 'Likely').reduce((sum, d) => sum + d.acv, 0);
    const pathPipe = commitPipe + (likelyPipe * 0.5);

    let activeTarget = targets.total;
    if (teamFilter !== 'ALL') {
      activeTarget = targets.teams[teamFilter] || targets.total;
    } else {
      if (motionFilter === 'Inbound') activeTarget = targets.inbound;
      if (motionFilter === 'Outbound') activeTarget = targets.outbound;
    }

    const attainedPercent = activeTarget > 0 ? ((attainedPipe / activeTarget) * 100).toFixed(1) : '0.0';
    const remainingAttainedGap = Math.max(0, activeTarget - attainedPipe);
    const gapToPath = Math.max(0, activeTarget - pathPipe);

    const partnerAttachedDeals = relevantDeals.filter(d => d.partnerAttached);
    const partnerAttachedAcv = partnerAttachedDeals.reduce((sum, d) => sum + d.acv, 0);
    const attachRate = relevantDeals.length > 0 ? ((partnerAttachedDeals.length / relevantDeals.length) * 100).toFixed(1) : '0.0';

    const partnerSourcedDeals = relevantDeals.filter(d => d.isPartnerSourced);
    const partnerSourcedAcv = partnerSourcedDeals.reduce((sum, d) => sum + d.acv, 0);
    const sourcedRate = relevantDeals.length > 0 ? ((partnerSourcedDeals.length / relevantDeals.length) * 100).toFixed(1) : '0.0';

    return {
      activeTarget,
      attainedPipe,
      attainedPercent,
      qualifyingPipe,
      prospectingPipe,
      totalWorkingPool,
      commitPipe,
      likelyPipe,
      pathPipe,
      remainingAttainedGap,
      gapToPath,
      partnerAttachedCount: partnerAttachedDeals.length,
      partnerAttachedAcv,
      attachRate,
      partnerSourcedCount: partnerSourcedDeals.length,
      partnerSourcedAcv,
      sourcedRate,
      dealCount: relevantDeals.length
    };
  }, [deals, targets, motionFilter, teamFilter]);

  // Partner Ecosystem Data: STRICTLY PULLS FROM COLUMN H (Partner (s))
  const partnerData = useMemo(() => {
    let relevantDeals = deals;
    if (teamFilter !== 'ALL') {
      relevantDeals = relevantDeals.filter(d => {
        const t = (d.team || '').toUpperCase();
        if (teamFilter === 'ANZ ENT') return t.includes('ENT');
        if (teamFilter === 'ANZ Scale') return t.includes('SCALE');
        if (teamFilter === 'ANZ SMB') return t.includes('SMB');
        if (teamFilter === 'ANZ AM') return t.includes('AM') || t.includes('STRATEGIC');
        return false;
      });
    }

    const counts = {};
    relevantDeals.forEach(d => {
      if (d.partners) {
        const parts = d.partners.split(';').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (!counts[p]) {
            counts[p] = { 
              name: p, 
              count: 0, 
              acv: 0, 
              attachedCount: 0, 
              attachedAcv: 0,
              sourcedCount: 0, 
              sourcedAcv: 0,
              deals: [] 
            };
          }
          counts[p].count += 1;
          counts[p].acv += d.acv;
          counts[p].deals.push(d);

          if (d.partnerAttached) {
            counts[p].attachedCount += 1;
            counts[p].attachedAcv += d.acv;
          }
          if (d.isPartnerSourced) {
            counts[p].sourcedCount += 1;
            counts[p].sourcedAcv += d.acv;
          }
        });
      }
    });
    return Object.values(counts).sort((a, b) => b.acv - a.acv || b.count - a.count);
  }, [deals, teamFilter]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.ae.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.partners.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.crossbeamPartners.toLowerCase().includes(searchQuery.toLowerCase());
      
      const t = (d.team || '').toUpperCase();
      let matchesTeam = true;
      if (teamFilter === 'ANZ ENT') matchesTeam = t.includes('ENT');
      else if (teamFilter === 'ANZ Scale') matchesTeam = t.includes('SCALE');
      else if (teamFilter === 'ANZ SMB') matchesTeam = t.includes('SMB');
      else if (teamFilter === 'ANZ AM') matchesTeam = t.includes('AM') || t.includes('STRATEGIC');

      const matchesMotion = motionFilter === 'ALL' || d.motion === motionFilter;
      return matchesSearch && matchesTeam && matchesMotion;
    });
  }, [deals, searchQuery, teamFilter, motionFilter]);

  // Crossbeam Overlaps Tab Data (Strictly Column Y)
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
            acv: d.acv,
            stage: d.stage,
            commitStatus: d.commitStatus,
            attached: d.partnerAttached,
            sourced: d.partnerSourcedDetail,
            motion: d.motion,
            closeDate: d.closeDate
          });
        });
      }
    });
    return list;
  }, [deals]);

  const crossbeamPartnersList = useMemo(() => {
    const pSet = new Set(crossbeamData.map(item => item.partner));
    return Array.from(pSet).sort();
  }, [crossbeamData]);

  const crossbeamRepsList = useMemo(() => {
    const rSet = new Set(crossbeamData.map(item => item.ae));
    return Array.from(rSet).sort();
  }, [crossbeamData]);

  const filteredCrossbeamData = useMemo(() => {
    return crossbeamData.filter(item => {
      const matchesPartner = crossbeamPartnerFilter === 'ALL' || item.partner === crossbeamPartnerFilter;
      const matchesRep = crossbeamRepFilter === 'ALL' || item.ae === crossbeamRepFilter;
      const matchesSearch = item.dealName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.ae.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPartner && matchesRep && matchesSearch;
    });
  }, [crossbeamData, crossbeamPartnerFilter, crossbeamRepFilter, searchQuery]);

  // Focus Opportunities (0-90 & 91-180 Days)
  const priorityDeals = useMemo(() => {
    let baseDeals = deals;
    if (teamFilter !== 'ALL') {
      baseDeals = baseDeals.filter(d => {
        const t = (d.team || '').toUpperCase();
        if (teamFilter === 'ANZ ENT') return t.includes('ENT');
        if (teamFilter === 'ANZ Scale') return t.includes('SCALE');
        if (teamFilter === 'ANZ SMB') return t.includes('SMB');
        if (teamFilter === 'ANZ AM') return t.includes('AM') || t.includes('STRATEGIC');
        return false;
      });
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
  }, [deals, teamFilter]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 flex flex-col font-sans">
      <header className="bg-[#1B0B3B] text-white px-6 py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF595A] to-[#635BFF] flex items-center justify-center p-2 shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Braze ANZ Q4 Pipeline Forecast & Target Dashboard</h1>
                <span className="text-xs bg-[#FF595A] text-white font-semibold px-2 py-0.5 rounded-full">Q4 FY27</span>
              </div>
              <p className="text-xs text-indigo-200">Live synced with Salesforce Opportunity Report & Google Sheet</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#2D1B54] px-3 py-1.5 rounded-lg border border-indigo-900/50 text-xs text-indigo-200">
              <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></span>
              Last updated: <span className="font-medium text-white">{lastUpdated}</span>
            </div>
            <button 
              onClick={fetchLiveData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs bg-[#FF595A] hover:bg-[#e04849] transition px-3 py-2 rounded-lg font-medium shadow-sm active:scale-95 text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 border-t border-indigo-900/60 pt-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'overview' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Pipeline Overview
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'leaderboard' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Rep Pipeline Leaderboard
          </button>
          <button 
            onClick={() => setActiveTab('crossbeam')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'crossbeam' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Crossbeam Overlaps
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'partners' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Partner Ecosystem
          </button>
          <button 
            onClick={() => setActiveTab('focus')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'focus' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Focus Opportunities (0–90 & 91–180d)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ExecutiveMovementSummary 
              historyData={historyData} 
              deals={deals} 
              targets={targets} 
              activeTeamFilter={teamFilter}
            />

            {/* Global Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" /> Team:
                </span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto">
                  {['ALL', 'ANZ ENT', 'ANZ Scale', 'ANZ SMB', 'ANZ AM'].map(tm => (
                    <button
                      key={tm}
                      onClick={() => setTeamFilter(tm)}
                      className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                        teamFilter === tm ? 'bg-[#1B0B3B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motion:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                  {['ALL', 'Inbound', 'Outbound'].map(m => (
                    <button
                      key={m}
                      onClick={() => setMotionFilter(m)}
                      className={`px-3 py-1.5 rounded-md transition ${
                        motionFilter === m ? 'bg-[#FF595A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 4 Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>{teamFilter === 'ALL' ? 'Q4 TARGET' : `${teamFilter} TARGET`}</span>
                    <Target className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">${(metrics.activeTarget / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Scope: {teamFilter}</span>
                  <span>{metrics.dealCount} Total Deals</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>PIPELINE GENERATED (ATTAINED)</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">${(metrics.attainedPipe / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>{metrics.attainedPercent}% of Target</span>
                  <span className="text-[11px] font-normal text-slate-400">Stage 2+ Progress</span>
                </div>
              </div>

              {/* Commit / Likely Path WITH Gap to Path First, then Total Working Pool */}
              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>COMMIT / LIKELY PATH</span>
                    <Layers className="w-4 h-4 text-[#FF595A]" />
                  </div>
                  <div className="text-2xl font-bold text-[#1B0B3B]">${(metrics.pathPipe / 1000000).toFixed(2)}M</div>
                </div>
                
                <div className="text-[11.5px] text-slate-600 mt-2 pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Gap to path:</span>
                    <span>${(metrics.gapToPath / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>Total Working Pool:</span>
                    <span className="text-slate-900 font-bold">${(metrics.totalWorkingPool / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Qual: ${(metrics.qualifyingPipe / 1000000).toFixed(2)}M</span>
                    <span>Prosp: ${(metrics.prospectingPipe / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>REMAINING GAP (ATTAINED TO TARGET)</span>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold text-rose-600">${(metrics.remainingAttainedGap / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Target: ${(metrics.activeTarget / 1000000).toFixed(2)}M</span>
                  <span className="text-rose-600 font-semibold">
                    {metrics.activeTarget > 0 ? ((metrics.remainingAttainedGap / metrics.activeTarget) * 100).toFixed(0) : 0}% Unattained
                  </span>
                </div>
              </div>
            </div>

            {/* Speedometers */}
            {teamFilter === 'ALL' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <TeamSpeedometer
                  title="ANZ ENT NB Pipe Pacing"
                  target={targets.teams['ANZ ENT']}
                  deals={deals.filter(d => d.team && d.team.includes('ENT'))}
                />
                <TeamSpeedometer
                  title="ANZ Scale NB Pipe Pacing"
                  target={targets.teams['ANZ Scale']}
                  deals={deals.filter(d => d.team && d.team.includes('Scale'))}
                />
                <TeamSpeedometer
                  title="ANZ SMB NB Pipe Pacing"
                  target={targets.teams['ANZ SMB']}
                  deals={deals.filter(d => d.team && d.team.includes('SMB'))}
                />
                <TeamSpeedometer
                  title="ANZ AM NB Pipe Pacing"
                  target={targets.teams['ANZ AM']}
                  deals={deals.filter(d => d.team && (d.team.includes('AM') || d.team.includes('Strategic')))}
                />
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <TeamSpeedometer
                  title={`${teamFilter} NB Pipe Pacing`}
                  target={targets.teams[teamFilter] || targets.total}
                  deals={filteredDeals}
                />
              </div>
            )}

            {/* Opportunities Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {teamFilter === 'ALL' ? 'All Opportunities' : `${teamFilter} Opportunities`} Drill-down
                  </h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {filteredDeals.length} Opportunities
                  </span>
                </div>

                <div className="relative flex-1 md:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search account, AE, partner..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-3 px-4">Opportunity Name</th>
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-3">Motion</th>
                      <th className="py-3 px-3 text-right">ACV</th>
                      <th className="py-3 px-3">AE / BDR</th>
                      <th className="py-3 px-3">Likelihood to Pipe</th>
                      <th className="py-3 px-3">Partner (s)</th>
                      <th className="py-3 px-3">Close Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDeals.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <a 
                            href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`}
                            target="_blank" 
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                          >
                            {d.name}
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{d.team}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            d.motion === 'Inbound' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {d.motion}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">${d.acv.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-600">{d.ae} {d.bdr ? `/ ${d.bdr}` : ''}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            d.commitStatus === 'Commit' ? 'bg-emerald-100 text-emerald-800' :
                            d.commitStatus === 'Likely' ? 'bg-indigo-100 text-indigo-800' :
                            d.commitStatus === 'Attained' ? 'bg-teal-100 text-teal-800 font-bold' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {d.commitStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate" title={d.partners}>
                          {d.partners || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{d.closeDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REP PIPELINE LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> Rep Pipeline Leaderboard {teamFilter !== 'ALL' ? `(${teamFilter})` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranked primarily by <strong>Pipeline Generated (Attained)</strong>, backed by <strong>Commit / Likely Path</strong> velocity.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold border border-slate-200">
                    Team: {teamFilter}
                  </span>
                  {selectedRep !== 'ALL' && (
                    <button
                      onClick={() => setSelectedRep('ALL')}
                      className="text-xs bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg font-bold border border-indigo-200 flex items-center gap-1.5 hover:bg-indigo-100 transition"
                    >
                      <span>Rep: {selectedRep}</span>
                      <X className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                  )}
                  {(teamFilter !== 'ALL' || selectedRep !== 'ALL' || searchQuery) && (
                    <button
                      onClick={() => {
                        setTeamFilter('ALL');
                        setSelectedRep('ALL');
                        setSearchQuery('');
                      }}
                      className="text-xs text-rose-600 hover:underline font-semibold px-2 py-1"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const repTotals = {};
                filteredDeals.forEach(d => {
                  const rep = d.ae || 'Unassigned';
                  if (!repTotals[rep]) {
                    repTotals[rep] = { 
                      name: rep, 
                      attained: 0, 
                      commit: 0, 
                      likely: 0, 
                      pool: 0, 
                      count: 0,
                      deals: [] 
                    };
                  }
                  
                  repTotals[rep].pool += d.acv;
                  repTotals[rep].count += 1;
                  repTotals[rep].deals.push(d);

                  if (d.commitStatus === 'Attained' || d.stage === 'Closed Won') {
                    repTotals[rep].attained += d.acv;
                  } else if (d.commitStatus === 'Commit') {
                    repTotals[rep].commit += d.acv;
                  } else if (d.commitStatus === 'Likely') {
                    repTotals[rep].likely += d.acv;
                  }
                });

                Object.values(repTotals).forEach(r => {
                  r.path = r.commit + (r.likely * 0.5);
                });

                const sortedReps = Object.values(repTotals).sort((a, b) => {
                  if (b.attained !== a.attained) return b.attained - a.attained;
                  if (b.path !== a.path) return b.path - a.path;
                  return b.pool - a.pool;
                });

                const topReps = sortedReps.slice(0, 3);
                const dealsForSelectedRep = filteredDeals.filter(d => selectedRep === 'ALL' || d.ae === selectedRep);

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {topReps.map((r, idx) => {
                        const isGold = idx === 0;
                        const isSilver = idx === 1;
                        const isSelected = selectedRep === r.name;

                        return (
                          <div 
                            key={r.name} 
                            onClick={() => setSelectedRep(selectedRep === r.name ? 'ALL' : r.name)}
                            className={`border p-5 rounded-2xl relative transition hover:shadow-md cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-indigo-600 bg-indigo-50/40 border-indigo-400'
                                : isGold 
                                ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white border-amber-300 ring-2 ring-amber-200/60' 
                                : isSilver 
                                ? 'bg-gradient-to-br from-slate-50 via-slate-100/40 to-white border-slate-300' 
                                : 'bg-gradient-to-br from-orange-50/40 to-white border-amber-200'
                            }`}
                          >
                            <span className={`absolute top-3.5 right-4 text-3xl font-black ${
                              isGold ? 'text-amber-300' : isSilver ? 'text-slate-300' : 'text-amber-200'
                            }`}>
                              #{idx + 1}
                            </span>
                            
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              {isGold ? 'Top Attained Leader' : isSilver ? 'Second Pacing' : 'Third Pacing'}
                            </div>
                            <div className="text-lg font-black text-slate-900 mt-1">{r.name}</div>
                            
                            <div className="mt-3 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-sm">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Pipeline Attained</span>
                              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                                ${r.attained.toLocaleString()}
                              </div>
                            </div>

                            <div className="mt-2.5 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                                <span>Commit / Likely Path</span>
                                <span className="text-indigo-600 font-bold">${r.path.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-600">
                                <span>Commit: <strong className="text-emerald-700">${r.commit.toLocaleString()}</strong></span>
                                <span>Likely: <strong className="text-indigo-700">${r.likely.toLocaleString()}</strong></span>
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                                <span>Total Pool: ${(r.pool / 1000).toFixed(0)}k</span>
                                <span>{r.count} Opportunities</span>
                              </div>
                            </div>

                            <div className="mt-3 text-center">
                              <span className="text-[11px] font-bold text-indigo-600">
                                {isSelected ? '✓ Filtering this rep (Click to unfilter)' : 'Click to filter deals below →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rep Standings & Conversion Ratios</span>
                        <span className="text-xs text-slate-500">{sortedReps.length} Active Account Executives</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/40 border-b border-slate-200 text-slate-500 font-semibold">
                              <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                              <th className="py-2.5 px-4">Account Executive</th>
                              <th className="py-2.5 px-4 text-right font-bold text-emerald-800">Attained</th>
                              <th className="py-2.5 px-4 text-right text-emerald-700">Commit</th>
                              <th className="py-2.5 px-4 text-right text-indigo-600">Likely</th>
                              <th className="py-2.5 px-4 text-right font-bold text-slate-900">Path (Commit + 50% Likely)</th>
                              <th className="py-2.5 px-4 text-right">Total Working Pool</th>
                              <th className="py-2.5 px-4 text-center">Deals</th>
                              <th className="py-2.5 px-4 text-center">Filter</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sortedReps.map((r, i) => (
                              <tr 
                                key={r.name} 
                                className={`hover:bg-slate-50/80 transition ${selectedRep === r.name ? 'bg-indigo-50/50' : ''}`}
                              >
                                <td className="py-3 px-4 text-center font-black text-slate-400">#{i + 1}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {r.name}
                                </td>
                                <td className="py-3 px-4 text-right font-black text-emerald-600">
                                  ${r.attained.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                                  ${r.commit.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                                  ${r.likely.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-extrabold text-[#1B0B3B]">
                                  ${r.path.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right text-slate-700 font-medium">
                                  ${r.pool.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-500">
                                  {r.count}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => setSelectedRep(selectedRep === r.name ? 'ALL' : r.name)}
                                    className={`px-2.5 py-1 rounded transition text-[11px] font-semibold ${
                                      selectedRep === r.name
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                    }`}
                                  >
                                    {selectedRep === r.name ? 'Clear' : 'Filter Rep'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Rep Opportunities Breakdown {selectedRep !== 'ALL' ? `(Rep: "${selectedRep}")` : '(All Reps)'}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Showing {dealsForSelectedRep.length} deals. Click any rep above to isolate their deals.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {selectedRep !== 'ALL' && (
                            <button
                              onClick={() => setSelectedRep('ALL')}
                              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold mr-1"
                            >
                              <X className="w-3.5 h-3.5" /> Show All Reps
                            </button>
                          )}
                          <div className="relative flex-1 md:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search deals..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                              <th className="py-3 px-4">Opportunity Name</th>
                              <th className="py-3 px-3">AE</th>
                              <th className="py-3 px-3">Team</th>
                              <th className="py-3 px-3">Motion</th>
                              <th className="py-3 px-3 text-right">ACV</th>
                              <th className="py-3 px-3">Likelihood to Pipe</th>
                              <th className="py-3 px-3">Partner (s)</th>
                              <th className="py-3 px-3">Close Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dealsForSelectedRep.map((d) => (
                              <tr key={d.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 px-4 font-medium text-slate-900">
                                  <a 
                                    href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                  >
                                    {d.name}
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-800">{d.ae}</td>
                                <td className="py-3 px-3 text-slate-600">{d.team}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    d.motion === 'Inbound' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  }`}>
                                    {d.motion}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-slate-900">${d.acv.toLocaleString()}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                    d.commitStatus === 'Commit' ? 'bg-emerald-100 text-emerald-800' :
                                    d.commitStatus === 'Likely' ? 'bg-indigo-100 text-indigo-800' :
                                    d.commitStatus === 'Attained' ? 'bg-teal-100 text-teal-800 font-bold' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {d.commitStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate" title={d.partners}>
                                  {d.partners || <span className="text-slate-300">—</span>}
                                </td>
                                <td className="py-3 px-3 text-slate-500">{d.closeDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB: CROSSBEAM OVERLAPS (STRICTLY COLUMN Y) */}
        {activeTab === 'crossbeam' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#635BFF]" /> Crossbeam Partner Overlaps against Opportunities
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore Crossbeam account overlaps by Partner technology and assigned Account Executive (Rep).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold border border-indigo-200">
                    {filteredCrossbeamData.length} Overlaps Found
                  </span>
                </div>
              </div>

              {/* FILTERS FOR PARTNER & REP */}
              <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200 mb-6">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner:</span>
                  <select
                    value={crossbeamPartnerFilter}
                    onChange={(e) => setCrossbeamPartnerFilter(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Partners ({crossbeamPartnersList.length})</option>
                    {crossbeamPartnersList.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rep (AE):</span>
                  <select
                    value={crossbeamRepFilter}
                    onChange={(e) => setCrossbeamRepFilter(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Reps ({crossbeamRepsList.length})</option>
                    {crossbeamRepsList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 w-full md:w-auto">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search opportunity or partner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {(crossbeamPartnerFilter !== 'ALL' || crossbeamRepFilter !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setCrossbeamPartnerFilter('ALL');
                      setCrossbeamRepFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold px-2 py-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>

              {/* TABLE OF CROSSBEAM MAPPINGS */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-3 px-4">Crossbeam Partner</th>
                        <th className="py-3 px-4">Opportunity Name</th>
                        <th className="py-3 px-3">Account Executive (Rep)</th>
                        <th className="py-3 px-3">Team</th>
                        <th className="py-3 px-3 text-right">ACV</th>
                        <th className="py-3 px-3">Stage</th>
                        <th className="py-3 px-3">Likelihood to Pipe</th>
                        <th className="py-3 px-3">Motion</th>
                        <th className="py-3 px-3">Close Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCrossbeamData.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-8 text-slate-400 text-xs">
                            No Crossbeam partner overlaps found for this selection.
                          </td>
                        </tr>
                      ) : (
                        filteredCrossbeamData.map((item, idx) => (
                          <tr key={`${item.dealId}-${item.partner}-${idx}`} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#635BFF]"></span>
                              {item.partner}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900">
                              <a 
                                href={`https://braze.lightning.force.com/lightning/r/Opportunity/${item.dealId}/view`}
                                target="_blank" 
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                              >
                                {item.dealName}
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">{item.ae}</td>
                            <td className="py-3 px-3 text-slate-600">{item.team}</td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900">${item.acv.toLocaleString()}</td>
                            <td className="py-3 px-3 text-slate-600">{item.stage}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                item.commitStatus === 'Commit' ? 'bg-emerald-100 text-emerald-800' :
                                item.commitStatus === 'Likely' ? 'bg-indigo-100 text-indigo-800' :
                                item.commitStatus === 'Attained' ? 'bg-teal-100 text-teal-800 font-bold' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {item.commitStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.motion === 'Inbound' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {item.motion}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{item.closeDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PARTNER ECOSYSTEM (STRICTLY COLUMN H: PARTNER (S)) WITH ATTACHED + SOURCED DETAILS & DRILLDOWN */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" /> Partner Ecosystem Leaderboard {teamFilter !== 'ALL' ? `(${teamFilter})` : ''}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Aggregated strictly from the <strong>Partner (s)</strong> column (Agency & Tech Partners). Click any partner to drill into their deals.
                  </p>
                </div>
                
                {/* ATTACHED & SOURCED METRICS BANNER */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-indigo-900">
                    Attached Rate: <span className="font-bold text-[#FF595A]">{metrics.attachRate}%</span> ({metrics.partnerAttachedCount} deals · ${(metrics.partnerAttachedAcv / 1000).toFixed(0)}k)
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900">
                    Sourced Rate: <span className="font-bold text-emerald-700">{metrics.sourcedRate}%</span> ({metrics.partnerSourcedCount} deals · ${(metrics.partnerSourcedAcv / 1000).toFixed(0)}k)
                  </div>
                </div>
              </div>

              {/* ACTIVE PARTNER FILTER BADGE */}
              {selectedEcosystemPartner !== 'ALL' && (
                <div className="flex items-center gap-2 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200 mb-4">
                  <span className="text-xs font-bold text-indigo-950">
                    Filtering to Partner: <strong className="text-indigo-600">{selectedEcosystemPartner}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedEcosystemPartner('ALL')}
                    className="ml-auto text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 transition"
                  >
                    <X className="w-3.5 h-3.5 text-indigo-600" /> Show All Partners
                  </button>
                </div>
              )}

              {/* PARTNER LEADERBOARD TABLE */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl mb-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-3 px-4">Partner Technology / Agency</th>
                      <th className="py-3 px-4 text-center">Tagged Deals</th>
                      <th className="py-3 px-4 text-center">Attached Deals</th>
                      <th className="py-3 px-4 text-center">Sourced Deals</th>
                      <th className="py-3 px-4 text-right">Total Pipeline ACV</th>
                      <th className="py-3 px-4 text-center">Drilldown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partnerData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                          No partners found in Column H for the active team selection.
                        </td>
                      </tr>
                    ) : (
                      partnerData.slice(0, 20).map((p, idx) => (
                        <tr 
                          key={p.name} 
                          className={`hover:bg-slate-50/80 transition ${selectedEcosystemPartner === p.name ? 'bg-indigo-50/50' : ''}`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            {p.name}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-700">{p.count}</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-700">
                            {p.attachedCount} <span className="text-[10px] font-normal text-slate-400">(${(p.attachedAcv / 1000).toFixed(0)}k)</span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">
                            {p.sourcedCount} <span className="text-[10px] font-normal text-slate-400">(${(p.sourcedAcv / 1000).toFixed(0)}k)</span>
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-slate-900">${p.acv.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedEcosystemPartner(selectedEcosystemPartner === p.name ? 'ALL' : p.name)}
                              className={`px-2.5 py-1 rounded transition text-[11px] font-semibold ${
                                selectedEcosystemPartner === p.name
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              }`}
                            >
                              {selectedEcosystemPartner === p.name ? 'Clear' : 'View Deals'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* DRILLDOWN TABLE: OPPORTUNITIES UNDER SELECTED PARTNER */}
              {(() => {
                const dealsToDisplay = selectedEcosystemPartner === 'ALL'
                  ? []
                  : (partnerData.find(p => p.name === selectedEcosystemPartner)?.deals || []);

                if (selectedEcosystemPartner === 'ALL') {
                  return (
                    <div className="bg-slate-50/70 border border-slate-200 border-dashed rounded-xl p-6 text-center text-xs text-slate-500">
                      💡 Click <strong>"View Deals"</strong> on any partner row above to inspect the specific opportunities, attached statuses, and sourced details tagged to that partner.
                    </div>
                  );
                }

                return (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Opportunities Tagged with "{selectedEcosystemPartner}"
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {dealsToDisplay.length} opportunities · Total Influenced: ${dealsToDisplay.reduce((s, d) => s + d.acv, 0).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedEcosystemPartner('ALL')}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <X className="w-3.5 h-3.5" /> Close Drilldown
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                            <th className="py-3 px-4">Opportunity Name</th>
                            <th className="py-3 px-3">AE</th>
                            <th className="py-3 px-3">Team</th>
                            <th className="py-3 px-3 text-right">ACV</th>
                            <th className="py-3 px-3 text-center">Attached</th>
                            <th className="py-3 px-3 text-center">Sourced Detail</th>
                            <th className="py-3 px-3">Likelihood to Pipe</th>
                            <th className="py-3 px-3">Close Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dealsToDisplay.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-4 font-medium text-slate-900">
                                <a 
                                  href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`}
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                >
                                  {d.name}
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800">{d.ae}</td>
                              <td className="py-3 px-3 text-slate-600">{d.team}</td>
                              <td className="py-3 px-3 text-right font-bold text-slate-900">${d.acv.toLocaleString()}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.partnerAttached ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {d.partnerAttached ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.isPartnerSourced ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {d.partnerSourcedDetail || 'None'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                  d.commitStatus === 'Commit' ? 'bg-emerald-100 text-emerald-800' :
                                  d.commitStatus === 'Likely' ? 'bg-indigo-100 text-indigo-800' :
                                  d.commitStatus === 'Attained' ? 'bg-teal-100 text-teal-800 font-bold' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {d.commitStatus}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500">{d.closeDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB: FOCUS OPPORTUNITIES (0-90 & 91-180 DAYS) */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#FF595A]" /> Focus Pipeline Priorities (0–180 Days) {teamFilter !== 'ALL' ? `(${teamFilter})` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immediate execution runway segmented into 0–90 day targets vs 91–180 day mid-term targets.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold border border-slate-200">
                    Total Focus Pipe: ${priorityDeals.reduce((sum, d) => sum + d.acv, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  {(() => {
                    const t1Deals = priorityDeals.filter(d => d.tier && d.tier.includes('Tier 1'));
                    const t1Acv = t1Deals.reduce((sum, d) => sum + d.acv, 0);
                    return (
                      <>
                        <div className="flex items-center justify-between bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                              Tier 1: High Priority (0–90 Days)
                            </span>
                          </div>
                          <span className="text-xs font-bold text-rose-700">
                            {t1Deals.length} Deals · ${t1Acv.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {t1Deals.length === 0 ? (
                            <div className="text-xs text-slate-400 p-4 text-center border border-dashed rounded-xl">No Tier 1 deals found.</div>
                          ) : (
                            t1Deals.map(d => (
                              <div key={d.id} className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 transition shadow-xs flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between gap-2">
                                  <a 
                                    href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="font-bold text-xs text-indigo-600 hover:underline line-clamp-1"
                                  >
                                    {d.name}
                                  </a>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${d.badgeColor}`}>
                                    {d.days < 0 ? 'Overdue' : `${d.days}d to close`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>{d.team} · {d.motion}</span>
                                  <span className="font-extrabold text-slate-900">${d.acv.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                                  <span>AE: {d.ae}</span>
                                  <span>Close Date: {d.closeDate}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  {(() => {
                    const t2Deals = priorityDeals.filter(d => d.tier && d.tier.includes('Tier 2'));
                    const t2Acv = t2Deals.reduce((sum, d) => sum + d.acv, 0);
                    return (
                      <>
                        <div className="flex items-center justify-between bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                              Tier 2: Second Priority (91–180 Days)
                            </span>
                          </div>
                          <span className="text-xs font-bold text-amber-700">
                            {t2Deals.length} Deals · ${t2Acv.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {t2Deals.length === 0 ? (
                            <div className="text-xs text-slate-400 p-4 text-center border border-dashed rounded-xl">No Tier 2 deals found.</div>
                          ) : (
                            t2Deals.map(d => (
                              <div key={d.id} className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 transition shadow-xs flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between gap-2">
                                  <a 
                                    href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="font-bold text-xs text-indigo-600 hover:underline line-clamp-1"
                                  >
                                    {d.name}
                                  </a>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${d.badgeColor}`}>
                                    {d.days < 0 ? 'Overdue' : `${d.days}d to close`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>{d.team} · {d.motion}</span>
                                  <span className="font-extrabold text-slate-900">${d.acv.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                                  <span>AE: {d.ae}</span>
                                  <span>Close Date: {d.closeDate}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
