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

// --- CONFIGURATION ---
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/109jy9sFdx0s0aZq5CdxbgQnMH5INkUUKvjvhTYoZ8OA/export?format=csv&gid=2048510077";
const WEB_APP_WRITEBACK_URL = ""; 

// Fallback Targets matching sheet rows 4-10
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
