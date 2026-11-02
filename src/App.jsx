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

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/109jy9sFdx0s0aZq5CdxbgQnMH5INkUUKvjvhTYoZ8OA/export?format=csv&gid=2048510077";
const WEB_APP_WRITEBACK_URL = "https://script.google.com/macros/s/AKfycbxRnaoBJbf4B_dKDoeFDXAy2ZhJ32u9eQ1yPsz1YEHK36JEVmEPDOVW9PxoI_fMinzN/exec"; 

const INITIAL_TARGETS = {
  total: 18710000,
  inbound: 10000000,
  outbound: 10820000,
  teams: {
    'ANZ ENT': 9650000,
    'ANZ Scale': 4980000,
    'ANZ AM': 2800000,
    'ANZ SMB': 1280000
  }
};

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

  // Robust CSV line parser handling quotes and commas
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

      // 1. Parse Targets (Row 5 / index 4)
      if (rawLines.length > 4) {
        const row4 = parseCSVRow(rawLines[4]);
        const totalTarget = parseFloat(row4[1]?.replace(/[M,$]/gi, '')) * 1000000 || 18710000;
        const inTarget = parseFloat(row4[5]?.replace(/[M,$]/gi, '')) * 1000000 || 10000000;
        const outTarget = parseFloat(row4[9]?.replace(/[M,$]/gi, '')) * 1000000 || 10820000;
        
        setTargets(prev => ({
          ...prev,
          total: totalTarget,
          inbound: inTarget,
          outbound: outTarget
        }));
      }

      // 2. Locate Opportunity Header Row (usually Row 32 / index 31)
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rawLines.length, 50); i++) {
        const lineLower = rawLines[i].toLowerCase();
        if (lineLower.includes('opportunity id') || (lineLower.includes('opportunity') && lineLower.includes('stage'))) {
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
        const nameCol = getIdx(['opportunity name', 'name']);
        const teamCol = getIdx(['team', 'territory']);
        const stageCol = headers.findIndex(h => h === 'stage');
        const acvCol = getIdx(['acv', 'amount']);
        const aeCol = getIdx(['ae', 'owner']);
        const bdrCol = getIdx(['bdr']);
        const partnersCol = headers.findIndex(h => h.includes('partner') && !h.includes('attach') && !h.includes('source'));
        const attachedCol = getIdx(['attached']);
        const commitCol = getIdx(['commit', 'likelihood']);
        const dateCol = getIdx(['close date']);
        const motionCol = getIdx(['inbound/outbound', 'motion']);
        const typeCol = headers.findIndex(h => h === 'type');

        const parsedDeals = [];

        for (let i = headerIdx + 1; i < rawLines.length; i++) {
          const cols = parseCSVRow(rawLines[i]);
          const oppId = cols[idCol !== -1 ? idCol : 0];
          let oppName = cols[nameCol !== -1 ? nameCol : 1];

          if (!oppName || oppName.toLowerCase().includes('total')) continue;

          // Strip formula wrapper if exported as =HYPERLINK("url", "name")
          if (oppName.includes('HYPERLINK(')) {
            const match = oppName.match(/,"([^"]+)"\)/);
            if (match) oppName = match[1];
          }

          const rawAcv = cols[acvCol !== -1 ? acvCol : 4] || '0';
          const cleanAcv = parseFloat(rawAcv.replace(/[^0-9.-]/g, '')) || 0;
          const attachedVal = (cols[attachedCol !== -1 ? attachedCol : 8] || '').toLowerCase();
          const isAttached = attachedVal === 'yes' || attachedVal === '1' || attachedVal === 'true';

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
            commitStatus: cols[commitCol !== -1 ? commitCol : 16] || 'Non Commit',
            closeDate: cols[dateCol !== -1 ? dateCol : 23] || '',
            motion: cols[motionCol !== -1 ? motionCol : 34] || 'Outbound',
            type: cols[typeCol !== -1 ? typeCol : 27] || 'New Business'
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

  // Automatically fetch fresh data from Google Sheet on initial mount
  useEffect(() => {
    fetchLiveData();
  }, []);

  const handleSaveEdit = async () => {
    if (!editingDeal) return;
    const numAcv = parseFloat(editAcv) || 0;
    const newCommit = editCommit;

    setDeals(prev => prev.map(d => d.id === editingDeal.id ? { ...d, acv: numAcv, commitStatus: newCommit } : d));

    if (!WEB_APP_WRITEBACK_URL) {
      setWriteBackStatus({ type: 'success', msg: 'Updated locally in app! (Set WEB_APP_WRITEBACK_URL to sync to Sheet)' });
      setTimeout(() => setWriteBackStatus(null), 4000);
      setEditingDeal(null);
      return;
    }

    setWriteBackStatus({ type: 'saving', msg: 'Writing back to Google Sheet...' });

    try {
      await fetch(WEB_APP_WRITEBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oppId: editingDeal.id,
          acv: numAcv,
          commitStatus: newCommit
        }),
        mode: 'no-cors'
      });
      setWriteBackStatus({ type: 'success', msg: `Successfully synced ${editingDeal.name} back to Google Sheet!` });
    } catch (err) {
      setWriteBackStatus({ type: 'error', msg: `Failed writing to sheet: ${err.message}` });
    } finally {
      setTimeout(() => setWriteBackStatus(null), 5000);
      setEditingDeal(null);
    }
  };

  const metrics = useMemo(() => {
    let relevantDeals = deals;
    if (motionFilter !== 'ALL') {
      relevantDeals = deals.filter(d => d.motion === motionFilter);
    }

    const qualifyingPipe = relevantDeals.filter(d => d.stage === 'Qualifying' || d.stage === 'Discovery+').reduce((sum, d) => sum + d.acv, 0);
    const prospectingPipe = relevantDeals.filter(d => d.stage.toLowerCase().includes('prospect')).reduce((sum, d) => sum + d.acv, 0);
    const totalWorkingPool = qualifyingPipe + prospectingPipe;

    const attainedPipe = relevantDeals.filter(d => d.commitStatus === 'Attained').reduce((sum, d) => sum + d.acv, 0);
    const commitPipe = relevantDeals.filter(d => d.commitStatus === 'Commit').reduce((sum, d) => sum + d.acv, 0);
    const likelyPipe = relevantDeals.filter(d => d.commitStatus === 'Likely').reduce((sum, d) => sum + d.acv, 0);
    const pathPipe = commitPipe + (likelyPipe * 0.5);

    let activeTarget = targets.total;
    if (motionFilter === 'Inbound') activeTarget = targets.inbound;
    if (motionFilter === 'Outbound') activeTarget = targets.outbound;

    const gap = Math.max(0, activeTarget - attainedPipe);
    const remainingGap = Math.max(0, gap - pathPipe);

    const partnerAttachedDeals = relevantDeals.filter(d => d.partnerAttached);
    const partnerAttachedAcv = partnerAttachedDeals.reduce((sum, d) => sum + d.acv, 0);
    const attachRate = relevantDeals.length > 0 ? ((partnerAttachedDeals.length / relevantDeals.length) * 100).toFixed(1) : '0.0';

    return {
      activeTarget,
      attainedPipe,
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>Q4 TARGET</span>
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">${(metrics.activeTarget / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>Inbound: ${(targets.inbound / 1000000).toFixed(2)}M</span>
                  <span>Outbound: ${(targets.outbound / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>PIPELINE GENERATED (ATTAINED)</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">${(metrics.attainedPipe / 1000000).toFixed(2)}M</div>
                <div className="text-xs font-medium text-emerald-700 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  0% Attainment (Awaiting S2+ Progression)
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>TOTAL WORKING POOL</span>
                  <Layers className="w-4 h-4 text-[#FF595A]" />
                </div>
                <div className="text-2xl font-bold text-[#1B0B3B]">${(metrics.totalWorkingPool / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>Qualifying: ${(metrics.qualifyingPipe / 1000000).toFixed(2)}M</span>
                  <span>Prospecting: ${(metrics.prospectingPipe / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>REMAINING GAP</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-rose-600">${(metrics.remainingGap / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-slate-500 mt-2">
                  Commit/Likely Path: ${(metrics.pathPipe / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(targets.teams).map(([team, targetVal]) => {
                const teamDeals = deals.filter(d => d.team === team);
                const teamPool = teamDeals.reduce((sum, d) => sum + d.acv, 0);
                const percentOfTarget = ((teamPool / targetVal) * 100).toFixed(1);
                const isBehind = teamPool < targetVal * 0.5;

                return (
                  <div key={team} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800">{team}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isBehind ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {isBehind ? 'Behind' : 'Pacing'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">${(teamPool / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-500">/ ${(targetVal / 1000000).toFixed(2)}M</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#635BFF] h-full rounded-full" style={{ width: `${Math.min(100, percentOfTarget)}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                      <span>{percentOfTarget}% coverage</span>
                      <span>Gap: ${((targetVal - teamPool) / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                );
              })}
            </div>

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
                            <Edit3 className="w-3 h-3" /> Edit & Write-back
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
                {/* TIER 1 SECTION */}
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

                {/* TIER 2 SECTION */}
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
                <Save className="w-3.5 h-3.5" /> Save & Sync to Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
