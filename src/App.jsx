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

// Speedometer Gauge Component: needle strictly moves with Pipeline Generation (Attained)
function TeamSpeedometer({ title, target, deals }) {
  const teamPool = deals.reduce((sum, d) => sum + d.acv, 0);
  
  // Pipeline Generation (Attained): deals marked as Attained or Closed Won
  const attained = deals
    .filter(d => d.commitStatus === 'Attained' || d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.acv, 0);

  const commit = deals.filter(d => d.commitStatus === 'Commit').reduce((sum, d) => sum + d.acv, 0);
  const likely = deals.filter(d => d.commitStatus === 'Likely').reduce((sum, d) => sum + d.acv, 0);
  const path = commit + (likely * 0.5);
  
  const gap = Math.max(0, target - attained);
  
  // Strict Attained Pacing: Needle and % ONLY move with attained pipeline
  const displayVal = attained;
  const percentage = target > 0 ? Math.min(100, Math.round((displayVal / target) * 100)) : 0;
  const coveragePercent = target > 0 ? Math.min(100, Math.round((teamPool / target) * 100)) : 0;
  const pathPercent = target > 0 ? Math.min(100, Math.round((path / target) * 100)) : 0;

  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 95;

  // Clamped angle strictly follows Pipeline Generation
  const clampedVal = Math.min(Math.max(displayVal, 0), target);
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

      {/* Speedometer Dial (Moved only by Attained PG) */}
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

          {/* Needle strictly pinned to attained PG */}
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

      {/* Coverage Progress Bar showing working pool breakdown */}
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
        // Fallback to proxy if direct CORS is blocked by browser
        res = await fetch(proxyUrl);
      }

      const csvText = await res.text();
      const rawLines = csvText.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');

      // 1. Locate Top Targets Summary Row
      for (let i = 0; i < Math.min(rawLines.length, 15); i++) {
        const line = rawLines[i].toLowerCase();
        if (line.includes('q4 target') || line.includes('pg attainment')) {
          const nextRow = parseCSVRow(rawLines[i + 1] || '');
          // Extract target numbers from row
          const totalMatch = nextRow.find(c => c.includes('$') && c.includes('M'));
          if (totalMatch) {
            const totalTarget = parseFloat(totalMatch.replace(/[M,$]/gi, '')) * 1000000;
            if (!isNaN(totalTarget) && totalTarget > 0) {
              setTargets(prev => ({ ...prev, total: totalTarget }));
            }
          }
          break;
        }
      }

      // 2. Locate Opportunity Header Row
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rawLines.length, 50); i++) {
        const lineLower = rawLines[i].toLowerCase();
        if (lineLower.includes('opportunity') || lineLower.includes('account / opportunity')) {
          headerIdx = i;
          break;
        }
      }

      // 3. Parse all live opportunities below header
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
        const partnersCol = headers.findIndex(h => h.includes('partner') && !h.includes('attach') && !h.includes('source'));
        const attachedCol = getIdx(['partner attached', 'attached']);
        // Match both 'likelihood' and sheet typo 'liklihood'
        const commitCol = getIdx(['liklihood', 'likelihood', 'stage 1 commit', 'commit']);
        const dateCol = getIdx(['close date']);
        const motionCol = getIdx(['inbound/outbound', 'motion']);
        const typeCol = headers.findIndex(h => h === 'type');

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

          // Extract Commit status (supports column 18 'Liklihood to move to Pipe')
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
    if (motionFilter !== 'ALL') {
      relevantDeals = deals.filter(d => d.motion === motionFilter);
    }

    const qualifyingPipe = relevantDeals.filter(d => d.stage === 'Qualifying' || d.stage === 'Discovery+').reduce((sum, d) => sum + d.acv, 0);
    const prospectingPipe = relevantDeals.filter(d => d.stage.toLowerCase().includes('prospect')).reduce((sum, d) => sum + d.acv, 0);
    const totalWorkingPool = qualifyingPipe + prospectingPipe;

    const attainedPipe = relevantDeals.filter(d => d.commitStatus === 'Attained' || d.stage === 'Closed Won').reduce((sum, d) => sum + d.acv, 0);
    const commitPipe = relevantDeals.filter(d => d.commitStatus === 'Commit').reduce((sum, d) => sum + d.acv, 0);
    const likelyPipe = relevantDeals.filter(d => d.commitStatus === 'Likely').reduce((sum, d) => sum + d.acv, 0);
    const pathPipe = commitPipe + (likelyPipe * 0.5);

    let activeTarget = targets.total;
    if (motionFilter === 'Inbound') activeTarget = targets.inbound;
    if (motionFilter === 'Outbound') activeTarget = targets.outbound;

    const attainedPercent = activeTarget > 0 ? ((attainedPipe / activeTarget) * 100).toFixed(1) : '0.0';
    const gap = Math.max(0, activeTarget - attainedPipe);
    const remainingGap = Math.max(0, gap - pathPipe);

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
      gap,
      remainingGap,
      partnerAttachedCount: partnerAttachedDeals.length,
      partnerAttachedAcv,
      attachRate
    };
  }, [deals, targets, motionFilter]);

  const partnerData = useMemo(() => {
    const counts = {};
    deals.forEach(d => {
      if (d.partners) {
        const parts = d.partners.split(';').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (!counts[p]) counts[p] = { name: p, count: 0, acv: 0, attachedCount: 0 };
          counts[p].count += 1;
          counts[p].acv += d.acv;
          if (d.partnerAttached) counts[p].attachedCount += 1;
        });
      }
    });
    return Object.values(counts).sort((a, b) => b.acv - a.acv || b.count - a.count);
  }, [deals]);

  const priorityDeals = useMemo(() => {
    return deals.map(d => {
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
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.ae.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.partners.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = teamFilter === 'ALL' || d.team === teamFilter;
      const matchesCommit = commitFilter === 'ALL' || d.commitStatus === commitFilter;
      const matchesMotion = motionFilter === 'ALL' || d.motion === motionFilter;
      return matchesSearch && matchesTeam && matchesCommit && matchesMotion;
    });
  }, [deals, searchQuery, teamFilter, commitFilter, motionFilter]);

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
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'partners' ? 'bg-[#FF595A] text-white shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Partner Leaderboard
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

      {writeBackStatus && (
        <div className={`py-2.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 transition ${
          writeBackStatus.type === 'saving' ? 'bg-indigo-100 text-indigo-900' :
          writeBackStatus.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-200' :
          'bg-rose-100 text-rose-900 border-b border-rose-200'
        }`}>
          {writeBackStatus.type === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
           writeBackStatus.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
           <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          {writeBackStatus.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Pipeline Motion:</span>
              <div className="flex gap-1.5">
                {['ALL', 'Inbound', 'Outbound'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMotionFilter(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      motionFilter === m ? 'bg-[#1B0B3B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'ALL' ? 'Overarching Pipe ($18.71M)' : m === 'Inbound' ? 'Inbound ($10.00M)' : 'Outbound ($10.82M)'}
                  </button>
                ))}
              </div>
            </div>

            {/* TOP 4 SUMMARY WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Q4 Target */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>Q4 TARGET</span>
                    <Target className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">${(metrics.activeTarget / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Inbound: ${(targets.inbound / 1000000).toFixed(2)}M</span>
                  <span>Outbound: ${(targets.outbound / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              {/* 2. Pipeline Generated ($ & % of target) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>PIPELINE GENERATED (ATTAINED)</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">${(metrics.attainedPipe / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>{metrics.attainedPercent}% of Q4 Target</span>
                  <span className="text-[11px] font-normal text-slate-400">Stage 2+ Progress</span>
                </div>
              </div>

              {/* 3. Commit / Likely Path */}
              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>COMMIT / LIKELY PATH</span>
                    <Layers className="w-4 h-4 text-[#FF595A]" />
                  </div>
                  <div className="text-2xl font-bold text-[#1B0B3B]">${(metrics.pathPipe / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-[11.5px] text-slate-500 mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>Working Pool:</span>
                    <span>${(metrics.totalWorkingPool / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-[10.5px] text-slate-400">
                    <span>Qual: ${(metrics.qualifyingPipe / 1000000).toFixed(2)}M</span>
                    <span>Prosp: ${(metrics.prospectingPipe / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>

              {/* 4. Remaining Gap */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>REMAINING GAP</span>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold text-rose-600">${(metrics.remainingGap / 1000000).toFixed(2)}M</div>
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Gross Gap: ${(metrics.gap / 1000000).toFixed(2)}M</span>
                  <span className="text-rose-500 font-semibold">{((metrics.remainingGap / metrics.activeTarget) * 100).toFixed(0)}% Open</span>
                </div>
              </div>
            </div>

            {/* TEAM SPEEDOMETER DIALS */}
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

            {/* Opportunities Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Qualifying & Prospecting Pipeline Drill-down</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{filteredDeals.length} Opportunities</span>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
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
                      <th className="py-3 px-3">Partner Attached</th>
                      <th className="py-3 px-3">Close Date</th>
                      <th className="py-3 px-4 text-center">Action</th>
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
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {d.commitStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {d.partnerAttached ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{d.closeDate}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => {
                              setEditingDeal(d);
                              setEditAcv(d.acv.toString());
                              setEditCommit(d.commitStatus);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-900 font-semibold px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition flex items-center gap-1 mx-auto"
                          >
                            <Edit3 className="w-3 h-3" /> Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Account Executive (AE) Pipeline Leaderboard
              </h2>
              <p className="text-xs text-slate-500 mb-4">Ranked by total Working Pipeline ACV generated in Q4</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(() => {
                  const repTotals = {};
                  deals.forEach(d => {
                    const rep = d.ae || 'Unassigned';
                    if (!repTotals[rep]) repTotals[rep] = { name: rep, acv: 0, count: 0 };
                    repTotals[rep].acv += d.acv;
                    repTotals[rep].count += 1;
                  });
                  const sortedReps = Object.values(repTotals).sort((a, b) => b.acv - a.acv).slice(0, 3);
                  
                  return sortedReps.map((r, idx) => (
                    <div key={r.name} className={`${idx === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-slate-50 border-slate-200'} border p-4 rounded-xl relative`}>
                      <span className={`absolute top-3 right-3 text-2xl font-black ${idx === 0 ? 'text-amber-300' : 'text-slate-300'}`}>#{idx + 1}</span>
                      <div className={`text-xs font-bold ${idx === 0 ? 'text-amber-800' : 'text-slate-600'}`}>{idx === 0 ? 'Top Generator' : idx === 1 ? 'Second Pacing' : 'Third Pacing'}</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-1">{r.name}</div>
                      <div className={`text-2xl font-black ${idx === 0 ? 'text-amber-600' : 'text-indigo-600'} mt-2`}>${r.acv.toLocaleString()}</div>
                      <div className="text-xs text-slate-600 mt-1">{r.count} Opportunities</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" /> Partner Ecosystem Leaderboard
                  </h2>
                  <p className="text-xs text-slate-500">Tracking tech partners mentioned, attached, and influenced across pipeline</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-indigo-900">
                    Attach Rate: <span className="font-bold text-[#FF595A]">{metrics.attachRate}%</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900">
                    Attached Pipeline: <span className="font-bold">${metrics.partnerAttachedAcv.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-3 px-4">Partner Technology</th>
                      <th className="py-3 px-4 text-center">Opportunities Tagged</th>
                      <th className="py-3 px-4 text-center">Attached Deals</th>
                      <th className="py-3 px-4 text-right">Influenced ACV</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partnerData.slice(0, 15).map((p, idx) => (
                      <tr key={p.name} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700">{p.count} deals</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">{p.attachedCount} attached</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">${p.acv.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.attachedCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.attachedCount > 0 ? 'Active Attachment' : 'Ecosystem Tag'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#FF595A]" /> Focus Pipeline Priorities (0–180 Days)
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
                                  <button 
                                    onClick={() => {
                                      setEditingDeal(d);
                                      setEditAcv(d.acv.toString());
                                      setEditCommit(d.commitStatus);
                                    }}
                                    className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" /> Update
                                  </button>
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
                                  <button 
                                    onClick={() => {
                                      setEditingDeal(d);
                                      setEditAcv(d.acv.toString());
                                      setEditCommit(d.commitStatus);
                                    }}
                                    className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" /> Update
                                  </button>
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

      {editingDeal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Update Opportunity
              </h3>
              <button onClick={() => setEditingDeal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 font-semibold mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {editingDeal.name}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ACV ($ Amount)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input 
                    type="number" 
                    value={editAcv} 
                    onChange={(e) => setEditAcv(e.target.value)} 
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-900" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Likelihood to Move to Pipe / Commit</label>
                <select 
                  value={editCommit} 
                  onChange={(e) => setEditCommit(e.target.value)} 
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-900 bg-white"
                >
                  <option value="Non Commit">Non Commit</option>
                  <option value="Commit">Commit</option>
                  <option value="Likely">Likely</option>
                  <option value="Attained">Attained (Stage 2+)</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setEditingDeal(null)} 
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="px-4 py-2 text-xs font-semibold bg-[#FF595A] hover:bg-[#e04849] text-white rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" /> Update Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
