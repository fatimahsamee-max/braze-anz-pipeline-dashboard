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
const WEB_APP_WRITEBACK_URL = ""; 

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

const INITIAL_DEALS = [
  { id: '006jR000001zoLtQAI', name: 'TerryWhite - EBOS Upsell - US DC', team: 'ANZ AM', stage: 'Qualifying', acv: 28880, ae: 'Martin Brown', bdr: '', partners: 'Braze Sub Account; Eagle Eye Solutions; Gorgias; Looker; MikMak; Rokt; Twilio; Voucherify', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-01', motion: 'Outbound', type: 'Upsell' },
  { id: '006jR000001IwhhQAC', name: 'Hummingbird Digital - Partner Sandbox', team: 'ANZ Scale', stage: 'Qualifying', acv: 0, ae: 'Jack McEvoy', bdr: '', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-02', motion: 'Outbound', type: 'Partner Sandbox' },
  { id: '006jR000001TWvCQAW', name: 'Blackwoods - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 250000, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-03', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000001UX9FQAW', name: 'Cotality - Australia - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 250000, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: 'Blusnow; LivePerson, Inc.; Looker; Mixpanel; Segment; Snowflake; Survicate; Twilio; Zendesk', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-04', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000004IRQrQAO', name: 'Colossalbet - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 17000, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: 'AppsFlyer; Databricks', partnerAttached: true, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-13', motion: 'Outbound', type: 'New Business' },
  { id: '006jR000002r2VZQAY', name: 'Our Money Market - Upsell - US LC', team: 'ANZ AM', stage: 'Qualifying', acv: 200, ae: 'Josh Lee', bdr: '', partners: 'Braze Sub Account; Rokt; Segment; Survicate', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-23', motion: 'Outbound', type: 'Upsell' },
  { id: '006jR0000035OMXQA2', name: 'Dynamoney - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Dominic Samranyke', bdr: '', partners: 'Databricks', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-25', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000003CPx0QAG', name: 'Linktree - Currents ME', team: 'ANZ AM', stage: 'Qualifying', acv: 0, ae: 'Tim Heller', bdr: '', partners: 'Adjust; Amplitude; DataGrail; Gorgias; Looker; Mixpanel; Segment; Snowflake; Twilio', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-27', motion: 'Outbound', type: 'Upsell' },
  { id: '006jR000003ClJBQA0', name: 'Linktree - New Business', team: 'ANZ Scale', stage: 'Qualifying', acv: 0, ae: 'Tim Heller', bdr: '', partners: 'Adjust; Amplitude; Segment; Snowflake; Twilio', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-11-27', motion: 'Outbound', type: 'New Business' },
  { id: '006jR000003dF5VQAU', name: 'White & Co. - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Carolina Goulart', bdr: '', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-03', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000003dUxNQAU', name: 'Health 2000 - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: 'Tapcart', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-03', motion: 'Outbound', type: 'New Business' },
  { id: '006jR000003itv7QAA', name: 'Western Sydney University - Donor Experience', team: 'ANZ ENT', stage: 'Qualifying', acv: 0, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: 'Gorgias; Looker; Snowflake; Survicate', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-03', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000004J8kNQAS', name: "Hungry Jack's - Agentic Standards - Upsell", team: 'ANZ AM', stage: 'Qualifying', acv: 7000, ae: 'Jessica Shiel', bdr: '', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-03', motion: 'Outbound', type: 'Upsell' },
  { id: '006jR000003iy0MQAQ', name: 'Rocket Mobile - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Dominic Samranyke', bdr: '', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-04', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000003zRb4QAE', name: 'Medibank - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 50000, ae: 'Ben Gethin-Damon', bdr: '', partners: 'ActionIQ; Catch Design; Contentful; FullStory; Optimizely; Segment; Twilio', partnerAttached: true, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-08', motion: 'Outbound', type: 'New Business' },
  { id: '006jR0000046WZDQA2', name: 'Ampol - New Business - Group FRP Mid 2027', team: 'ANZ ENT', stage: 'Qualifying', acv: 500000, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: 'Braze Partners; Databricks; Rokt; Sigma Computing; Twilio', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-08', motion: 'Outbound', type: 'New Business' },
  { id: '006jR0000046l6nQAA', name: 'Goodman Fielder - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 150000, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: 'Braze Partners; LivePerson; Looker', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-08', motion: 'Outbound', type: 'New Business' },
  { id: '006jR0000046qjBQAQ', name: 'Autosports Group - New Business', team: 'ANZ Scale', stage: 'Qualifying', acv: 0, ae: 'Luke Morabito', bdr: 'Luke Morabito', partners: 'LivePerson; Looker; Segment; Snowflake', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-08', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000004SpwaQAC', name: 'Kindo - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Dominic Samranyke', bdr: '', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-13', motion: 'Outbound', type: 'New Business' },
  { id: '006VP00000bfAanYAE', name: 'Ticketmaster - 2026 Upsell - Landing Pages', team: 'ANZ AM', stage: 'Qualifying', acv: 3000, ae: 'Bren Hartnoll', bdr: '', partners: 'LivePerson; Movable Ink', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-18', motion: 'Outbound', type: 'Upsell' },
  { id: '006jR000001NCO7QAO', name: 'VGW - 2026 Upsell - Content Optimiser', team: 'ANZ AM', stage: 'Qualifying', acv: 250000, ae: 'Bren Hartnoll', bdr: '', partners: 'Adjust; Amplitude; Databricks; Digioh; EPAM; OfferFit; Optimizely; Segment; Twilio', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-18', motion: 'Outbound', type: 'Upsell' },
  { id: '006VP00000axD4XYAU', name: 'Money3 - (2026 Upsell - LP Pro)', team: 'ANZ AM', stage: 'Qualifying', acv: 3000, ae: 'Bren Hartnoll', bdr: '', partners: 'FullStory; Segment; Twilio; Valimail', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-24', motion: 'Outbound', type: 'Upsell' },
  { id: '006VP00000bLLSLYA4', name: 'Latrobe Health Services - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 0, ae: 'Dominic Samranyke', bdr: '', partners: '', partnerAttached: true, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2026-12-31', motion: 'Outbound', type: 'New Business' },
  { id: '006jR000000GwOEQA0', name: 'Boardriders Au - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 300000, ae: 'Tye Grieve', bdr: 'Tye Grieve', partners: '', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2027-01-13', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000003coQHQAY', name: 'Telstra (UPSELL - Content Optimiser)', team: 'ANZ AM', stage: 'Qualifying', acv: 50000, ae: 'Brooke Jackson', bdr: '', partners: 'ActionIQ; AppsFlyer; Databricks; FullStory; Segment; Twilio', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2027-01-20', motion: 'Outbound', type: 'Upsell' },
  { id: '006jR000003WZliQAG', name: 'NRMA (UPSELL - AI Suite Updates)', team: 'ANZ AM', stage: 'Qualifying', acv: 30000, ae: 'Brooke Jackson', bdr: '', partners: 'LivePerson; OfferFit; Rokt; Segment', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2027-01-26', motion: 'Outbound', type: 'Upsell' },
  { id: '006VP00000a1m14YAA', name: 'Bupa Australia - New Business', team: 'ANZ ENT', stage: 'Qualifying', acv: 0, ae: 'Ben Gethin-Damon', bdr: '', partners: 'ActionIQ; Contentful; FullStory; Mixpanel; Optimizely; Segment; Twilio', partnerAttached: true, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2027-01-28', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000001tT0nQAE', name: 'The Oodie - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Ryan Chua', bdr: '', partners: 'Rokt; Segment; Tapcart', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2027-01-31', motion: 'Inbound', type: 'New Business' },
  { id: '006jR000001tYQHQA2', name: 'Betr - New Business', team: 'ANZ SMB', stage: 'Qualifying', acv: 0, ae: 'Ryan Chua', bdr: '', partners: 'Adjust; AppsFlyer; Contentful; Snowflake; Twilio', partnerAttached: false, partnerSourced: false, commitStatus: 'Non Commit', closeDate: '2027-01-31', motion: 'Outbound', type: 'New Business' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [motionFilter, setMotionFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [commitFilter, setCommitFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('02.11.26');
  const [writeBackStatus, setWriteBackStatus] = useState(null);

  const [editingDeal, setEditingDeal] = useState(null);
  const [editAcv, setEditAcv] = useState('');
  const [editCommit, setEditCommit] = useState('');

  const getDaysUntilClose = (dateStr) => {
    if (!dateStr) return 999;
    const today = new Date('2026-11-02');
    const targetDate = new Date(dateStr);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    const timestamp = Date.now();
    const rawUrl = `${SHEET_CSV_URL}&_t=${timestamp}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;

    try {
      let res = await fetch(proxyUrl);
      if (!res.ok) res = await fetch(rawUrl);
      const csvText = await res.text();
      const lines = csvText.split(/\r\n|\n|\r/);

      if (lines.length > 4) {
        const row4 = lines[4].split(',').map(c => c.replace(/["$]/g, '').trim());
        const totalTarget = parseFloat(row4[1]?.replace(/[M,]/gi, '')) * 1000000 || 18710000;
        const inTarget = parseFloat(row4[5]?.replace(/[M,]/gi, '')) * 1000000 || 10000000;
        const outTarget = parseFloat(row4[9]?.replace(/[M,]/gi, '')) * 1000000 || 10820000;
        
        setTargets(prev => ({
          ...prev,
          total: totalTarget,
          inbound: inTarget,
          outbound: outTarget
        }));
      }

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn("Could not sync live targets, using state:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDeal) return;
    const numAcv = parseFloat(editAcv) || 0;
    const newCommit = editCommit;

    setDeals(prev => prev.map(d => d.id === editingDeal.id ? { ...d, acv: numAcv, commitStatus: newCommit } : d));

    if (!WEB_APP_WRITEBACK_URL) {
      setWriteBackStatus({ type: 'success', msg: 'Updated locally in app! (Deploy Web App URL to write directly to GSheet)' });
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

    const qualifyingPipe = relevantDeals.filter(d => d.stage === 'Qualifying').reduce((sum, d) => sum + d.acv, 0);
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
      let tier = 'Tier 3 (181+ Days)';
      let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
      if (days <= 90) {
        tier = 'Tier 1: High Priority (0-90 Days)';
        badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (days <= 180) {
        tier = 'Tier 2: Second Priority (91-180 Days)';
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      }
      return { ...d, days, tier, badgeColor };
    }).sort((a, b) => a.days - b.days);
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
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
            <Compass className="w-3.5 h-3.5" /> Focus Opportunities (0-90 & 91-180d)
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
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl relative">
                  <span className="absolute top-3 right-3 text-2xl font-black text-amber-300">#1</span>
                  <div className="text-xs font-bold text-amber-800">Top Generator</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">Tye Grieve</div>
                  <div className="text-2xl font-black text-amber-600 mt-2">$1,467,000</div>
                  <div className="text-xs text-slate-600 mt-1">6 Qualifying Opportunities</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
                  <span className="absolute top-3 right-3 text-2xl font-black text-slate-300">#2</span>
                  <div className="text-xs font-bold text-slate-600">Second Pacing</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">Bren Hartnoll</div>
                  <div className="text-2xl font-black text-indigo-600 mt-2">$278,000</div>
                  <div className="text-xs text-slate-600 mt-1">3 Active Upsells</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
                  <span className="absolute top-3 right-3 text-2xl font-black text-slate-300">#3</span>
                  <div className="text-xs font-bold text-slate-600">Third Pacing</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">Brooke Jackson</div>
                  <div className="text-2xl font-black text-indigo-600 mt-2">$80,000</div>
                  <div className="text-xs text-slate-600 mt-1">3 Qualifying Opportunities</div>
                </div>
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-rose-500" /> Focus Pipeline Priorities by Close Date
                </h2>
                <span className="text-xs text-slate-500">Anchor Date: 02 Nov 2026</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Segmenting qualifying pipeline into immediate 0-90 day execution targets versus 91-180 day second tier runway.
              </p>

              {['Tier 1: High Priority (0-90 Days)', 'Tier 2: Second Priority (91-180 Days)', 'Tier 3 (181+ Days)'].map(tierName => {
                const groupDeals = priorityDeals.filter(d => d.tier === tierName);
                if (groupDeals.length === 0) return null;
                const groupAcv = groupDeals.reduce((sum, d) => sum + d.acv, 0);

                return (
                  <div key={tierName} className="mb-8">
                    <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 mb-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          tierName.includes('Tier 1') ? 'bg-rose-500' : tierName.includes('Tier 2') ? 'bg-amber-500' : 'bg-slate-400'
                        }`}></span>
                        {tierName}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {groupDeals.length} Deals · Total: <span className="text-indigo-600 font-bold">${groupAcv.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupDeals.map(d => (
                        <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <a 
                                href={`https://braze.lightning.force.com/lightning/r/Opportunity/${d.id}/view`}
                                target="_blank" 
                                rel="noreferrer"
                                className="font-bold text-xs text-indigo-600 hover:underline line-clamp-2"
                              >
                                {d.name}
                              </a>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${d.badgeColor}`}>
                                {d.days}d to close
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-3">
                              <span className="text-slate-500">{d.team} · {d.motion}</span>
                              <span className="font-extrabold text-slate-900">${d.acv.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-500">
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
                      ))}
                    </div>
                  </div>
                );
              })}
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
