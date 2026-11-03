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
    const attained = filteredDeals.filter(d => d.commitStatus === 'Attained' || d.stage === 'Closed Won').reduce((
