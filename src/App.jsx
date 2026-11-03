import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Zap, DollarSign, Calendar, 
  ExternalLink, ArrowUpRight, BarChart3, Filter, Award, Search, 
  RefreshCw, CheckCircle2, AlertCircle, Clock, Users, Briefcase, 
  ShieldCheck, Share2, Eye, Building2, ChevronRight, Layers,
  ChevronDown, X, Sparkles, Check, Edit3, Save, Compass
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

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
            stroke="#BD322B"
            strokeWidth={strokeWidth}
          />
          <path
            d={`M ${cx + radius * Math.cos(Math.PI * (1 - 0.80))} ${cy - radius * Math.sin(Math.PI * (1 - 0.80))} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
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
  const [commitFilter, setCommitFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deals, setDeals] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Loading...');
  const [writeBackStatus, setWriteBackStatus] = useState(null);

  const [editingDeal, setEditingDeal] = useState(null);
  const [editAcv, setEditAcv] = useState('');
  const [editCommit, setEditCommit] = useState('');

  const getDaysUntilClose = (dateStr) => {
    if (!dateStr) return 999;
    const today = new Date('2026-11-02');
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return 999;
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
        const partnersCol = headers.findIndex(h => h.includes('partner (s)') || (h.includes('partner') && !h.includes('attached') && !h.includes('sourced') && !h.includes('agency')));
        const attachedCol = getIdx(['partner attached', 'attached']);
        const commitCol = getIdx(['liklihood', 'likelihood', 'stage 1 commit', 'commit']);
        const dateCol = getIdx(['close date']);
        const motionCol = getIdx(['inbound/outbound', 'motion']);
        const typeCol = headers.findIndex(h => h === 'type');
        const agencyCol = headers.findIndex(h => h.includes('agency') || h.includes('crossbeam'));

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
            partners: cols[partnersCol !== -1 ? partnersCol : 7] || '',
            agencyPartners: agencyCol !== -1 ? cols[agencyCol] : '',
            partnerAttached: isAttached,
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
          const hProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;
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

  const handleSaveEdit = () => {
    if (!editingDeal) return;
    const numAcv = parseFloat(editAcv) || 0;
    const newCommit = editCommit;

    setDeals(prev => prev.map(d => d.id === editingDeal.id ? { ...d, acv: numAcv, commitStatus: newCommit } : d));
    setWriteBackStatus({ type: 'success', msg: `Updated ${editingDeal.name} locally in dashboard!` });
    setTimeout(() => setWriteBackStatus(null), 3000);
    setEditingDeal(null);
  };

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
    
    // Remaining Gap: strictly Target minus Attained Pipeline
    const remainingAttainedGap = Math.max(0, activeTarget - attainedPipe);
    
    // Gap to Path: strictly Target minus (Commit + 50% Likely)
    const gapToPath = Math.max(0, activeTarget - pathPipe);
    const workingPoolCoverage = activeTarget > 0 ? ((totalWorkingPool / activeTarget) * 100).toFixed(1) : '0.0';

    const partnerAttachedDeals = relevantDeals.filter(d => d.partnerAttached);
    const partnerAttachedAcv = partnerAttachedDeals.reduce((sum, d) => sum + d.acv, 0);
    const attachRate = relevantDeals.length > 0 ? ((partnerAttachedDeals.length / relevantDeals.length) * 100).toFixed(1) : '0.0';

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
      workingPoolCoverage,
      partnerAttachedCount: partnerAttachedDeals.length,
      partnerAttachedAcv,
      attachRate,
      dealCount: relevantDeals.length
    };
  }, [deals, targets, motionFilter, teamFilter]);

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
      const allPartners = [d.partners, d.agencyPartners].filter(Boolean).join(';');
      if (allPartners) {
        const parts = allPartners.split(';').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (!counts[p]) counts[p] = { name: p, count: 0, acv: 0, attachedCount: 0 };
          counts[p].count += 1;
          counts[p].acv += d.acv;
          if (d.partnerAttached) counts[p].attachedCount += 1;
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
                            (d.agencyPartners && d.agencyPartners.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const t = (d.team || '').toUpperCase();
      let matchesTeam = true;
      if (teamFilter === 'ANZ ENT') matchesTeam = t.includes('ENT');
      else if (teamFilter === 'ANZ Scale') matchesTeam = t.includes('SCALE');
      else if (teamFilter === 'ANZ SMB') matchesTeam = t.includes('SMB');
      else if (teamFilter === 'ANZ AM') matchesTeam = t.includes('AM') || t.includes('STRATEGIC');

      const matchesCommit = commitFilter === 'ALL' || d.commitStatus === commitFilter;
      const matchesMotion = motionFilter === 'ALL' || d.motion === motionFilter;
      return matchesSearch && matchesTeam && matchesCommit && matchesMotion;
    });
  }, [deals, searchQuery, teamFilter, commitFilter, motionFilter]);

  const priorityDeals = useMemo(() => {
    return filteredDeals.map(d => {
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
  }, [filteredDeals]);

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
            <Award className="w-3.5 h-3.5" /> Rep Leaderboard
          </button>
          <button
