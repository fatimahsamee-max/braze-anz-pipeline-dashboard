{activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Header & Stats Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> Account Executive (AE) Pipeline Leaderboard {teamFilter !== 'ALL' ? `(${teamFilter})` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranked primarily by <strong>Pipeline Generated (Attained)</strong>, followed by <strong>Commit / Likely Path</strong> velocity.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold border border-slate-200">
                    Active Filter: {teamFilter} · {motionFilter}
                  </span>
                </div>
              </div>

              {/* Aggregation & Sorting Logic */}
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

                // Calculate Path for each rep: Commit + 50% Likely
                Object.values(repTotals).forEach(r => {
                  r.path = r.commit + (r.likely * 0.5);
                });

                // Sort: 1st layer Attained DESC, 2nd layer Path DESC, 3rd layer Pool DESC
                const sortedReps = Object.values(repTotals).sort((a, b) => {
                  if (b.attained !== a.attained) return b.attained - a.attained;
                  if (b.path !== a.path) return b.path - a.path;
                  return b.pool - a.pool;
                });

                const topReps = sortedReps.slice(0, 3);

                return (
                  <>
                    {/* Top 3 Podium Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {topReps.map((r, idx) => {
                        const isGold = idx === 0;
                        const isSilver = idx === 1;
                        return (
                          <div 
                            key={r.name} 
                            onClick={() => setSearchQuery(r.name === 'Unassigned' ? '' : r.name)}
                            className={`border p-5 rounded-2xl relative transition hover:shadow-md cursor-pointer ${
                              isGold 
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
                              {isGold ? '🥇 Top Attained Leader' : isSilver ? '🥈 Second Pacing' : '🥉 Third Pacing'}
                            </div>
                            <div className="text-lg font-black text-slate-900 mt-1">{r.name}</div>
                            
                            {/* Layer 1: Attained */}
                            <div className="mt-3 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Layer 1: Pipeline Attained</span>
                              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                                ${r.attained.toLocaleString()}
                              </div>
                            </div>

                            {/* Layer 2: Commit / Likely Path */}
                            <div className="mt-2.5 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                                <span>Layer 2: Commit / Likely Path</span>
                                <span className="text-indigo-600">${r.path.toLocaleString()}</span>
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
                          </div>
                        );
                      })}
                    </div>

                    {/* Full Leaderboard Table */}
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
                              <th className="py-2.5 px-4 text-right font-bold text-emerald-800">Layer 1: Attained</th>
                              <th className="py-2.5 px-4 text-right text-indigo-700">Commit</th>
                              <th className="py-2.5 px-4 text-right text-indigo-600">Likely</th>
                              <th className="py-2.5 px-4 text-right font-bold text-slate-900">Path (Commit + 50% Likely)</th>
                              <th className="py-2.5 px-4 text-right">Total Working Pool</th>
                              <th className="py-2.5 px-4 text-center">Deals</th>
                              <th className="py-2.5 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sortedReps.map((r, i) => (
                              <tr key={r.name} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 px-4 text-center font-black text-slate-400">#{i + 1}</td>
                                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
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
                                    onClick={() => setSearchQuery(r.name === 'Unassigned' ? '' : r.name)}
                                    className="text-indigo-600 hover:text-indigo-900 font-semibold px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition text-[11px]"
                                  >
                                    View Deals
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Opportunities Below Leaderboard */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Rep Opportunities Breakdown {searchQuery ? `(Filtered: "${searchQuery}")` : ''}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Showing deals belonging to the active leaderboard selection. Use search or click "View Deals" on any rep.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium mr-1"
                            >
                              <X className="w-3.5 h-3.5" /> Clear Filter
                            </button>
                          )}
                          <div className="relative flex-1 md:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Filter by Rep or Account..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-
