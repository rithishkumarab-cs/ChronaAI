import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Landmark,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  UserRound,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import {
  analyzeScenario,
  BOUNCE_FEE,
  CIBIL_DROP,
  DEFAULT_INPUTS,
  formatCurrency,
  PROCESSING_FEE,
  type ScenarioInputs,
} from '@/lib/projection';

function App() {
  const [inputs, setInputs] = useState<ScenarioInputs>(DEFAULT_INPUTS);
  const [isOptimized, setIsOptimized] = useState(false);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('id, inputs, is_optimized')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data && !error) {
        setScenarioId(data.id);
        if (data.inputs && typeof data.inputs === 'object') {
          setInputs({ ...DEFAULT_INPUTS, ...(data.inputs as Partial<ScenarioInputs>) });
        }
        setIsOptimized(Boolean(data.is_optimized));
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (nextInputs: ScenarioInputs, nextOptimized: boolean, id: string | null) => {
      setSaving(true);
      try {
        if (id) {
          await supabase
            .from('scenarios')
            .update({ inputs: nextInputs, is_optimized: nextOptimized, updated_at: new Date().toISOString() })
            .eq('id', id);
        } else {
          const { data } = await supabase
            .from('scenarios')
            .insert({ inputs: nextInputs, is_optimized: nextOptimized })
            .select('id')
            .single();
          if (data) setScenarioId(data.id);
        }
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateInput = useCallback(
    (key: keyof ScenarioInputs, value: number) => {
      setInputs((prev) => {
        const next = { ...prev, [key]: value };
        persist(next, isOptimized, scenarioId);
        return next;
      });
    },
    [isOptimized, scenarioId, persist],
  );

  const handleExecute = useCallback(() => {
    setIsOptimized(true);
    persist(inputs, true, scenarioId);
  }, [inputs, scenarioId, persist]);

  const handleReset = useCallback(() => {
    setIsOptimized(false);
    persist(inputs, false, scenarioId);
  }, [inputs, scenarioId, persist]);

  const analysis = useMemo(() => analyzeScenario(inputs, isOptimized), [inputs, isOptimized]);
  const chartData = analysis.chartData;
  const chartDomain = useMemo<[number, number]>(() => {
    const allValues = [...analysis.defaultData, ...analysis.optimizedData].map((p) => p.balance);
    const min = Math.min(...allValues, 0);
    const max = Math.max(...allValues, 0);
    const pad = Math.max(1000, (max - min) * 0.12);
    return [Math.floor((min - pad) / 1000) * 1000, Math.ceil((max + pad) / 1000) * 1000];
  }, [analysis]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-slate-100 selection:bg-emerald-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_88%_4%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_0%_60%,rgba(30,64,175,0.1),transparent_34%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950 shadow-[0_0_28px_rgba(52,211,153,0.32)]">
              <Activity size={21} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[17px] font-semibold tracking-[-0.03em] text-white">Chrona <span className="text-emerald-400">AI</span></p>
              <p className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:block">Decision intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden items-center gap-2.5 border-r border-white/[0.1] pr-6 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-400">
                <UserRound size={15} />
              </div>
              <div>
                <p className="text-xs font-medium text-white">Rahul</p>
                <p className="text-[10px] text-slate-500">Primary account</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-0.5 flex items-center justify-end gap-1.5">
                <ShieldCheck size={14} className={isOptimized ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">CIBIL score</span>
              </div>
              <p className="text-xl font-semibold tracking-tight text-white">
                {inputs.cibilScore - (isOptimized ? 0 : 0)}{' '}
                <span className={`ml-1 text-xs font-medium ${isOptimized ? 'text-emerald-400' : analysis.hasShortfall ? 'text-red-400' : 'text-slate-500'}`}>
                  {isOptimized ? '+0 Impact' : analysis.hasShortfall ? `-${CIBIL_DROP} risk` : 'stable'}
                </span>
              </p>
            </div>
          </div>
        </header>

        <section className={`mt-7 flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-700 sm:items-center sm:px-5 ${isOptimized ? 'border-emerald-400/30 bg-emerald-400/[0.08]' : analysis.hasShortfall ? 'border-red-500/30 bg-red-500/[0.08] animate-pulse' : 'border-amber-400/30 bg-amber-400/[0.06]'}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isOptimized ? 'bg-emerald-400/15 text-emerald-400' : analysis.hasShortfall ? 'bg-red-500/15 text-red-400' : 'bg-amber-400/15 text-amber-400'}`}>
            {isOptimized ? <BadgeCheck size={18} /> : analysis.hasShortfall ? <Zap size={17} /> : <ShieldCheck size={17} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isOptimized ? 'text-emerald-400' : analysis.hasShortfall ? 'text-red-400' : 'text-amber-400'}`}>
              {isOptimized ? 'Strategy protected' : analysis.hasShortfall ? 'Immediate attention required' : 'Healthy forecast'}
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-200 sm:text-[15px]">
              {isOptimized
                ? `Protected: Intervention applied. Shortfall avoided. ₹${BOUNCE_FEE} bounce fee saved.`
                : analysis.hasShortfall
                  ? `CRITICAL: Projected ${formatCurrency(analysis.shortfallAmount)} shortfall on ${analysis.shortfallDay} August. CIBIL drop imminent.`
                  : 'No shortfall projected. Your cash flow stays above the safe line for the next 30 days.'}
            </p>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
            {saving ? 'Saving…' : 'Live forecast'}
          </span>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.85fr)]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/80 p-5 shadow-2xl shadow-black/10 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <TrendingDown size={14} className={isOptimized ? 'text-emerald-400' : analysis.hasShortfall ? 'text-red-400' : 'text-amber-400'} />
                  30-day liquidity forecast
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[30px]">Projected bank balance</h1>
                <p className="mt-1.5 text-sm text-slate-500">Cash flow simulation through 30 August 2024</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Day 30 balance</p>
                <p className={`mt-1 text-2xl font-semibold tracking-tight ${analysis.finalBalance < 0 ? 'text-red-400' : isOptimized ? 'text-emerald-400' : 'text-white'}`}>{formatCurrency(analysis.finalBalance)}</p>
              </div>
            </div>

            <div className="mt-8 h-[300px] w-full sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isOptimized ? '#34d399' : analysis.hasShortfall ? '#fb4b55' : '#fbbf24'} stopOpacity={0.28} />
                      <stop offset="90%" stopColor={isOptimized ? '#34d399' : analysis.hasShortfall ? '#fb4b55' : '#fbbf24'} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} interval={4} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(value: number) => `${value / 1000}k`} domain={chartDomain} width={40} />
                  <Tooltip cursor={{ stroke: '#94a3b8', strokeOpacity: 0.2 }} content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeOpacity={0.28} strokeDasharray="4 4" label={{ value: '₹0 safe line', position: 'insideTopRight', fill: '#64748b', fontSize: 10 }} />
                  <Area key={isOptimized ? 'optimized' : 'default'} type="monotone" dataKey="balance" stroke={isOptimized ? '#34d399' : analysis.hasShortfall ? '#fb4b55' : '#fbbf24'} strokeWidth={3} fill="url(#balanceFill)" isAnimationActive animationDuration={1100} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-white/[0.06] pt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
              <span>1 August</span>
              <span className="hidden sm:block">EMI debit · {inputs.emiDay} Aug</span>
              <span>30 August</span>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/[0.08] bg-[#0c1220]/80 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400"><Sparkles size={14} /> AI recommended interventions</div>
            <p className="mt-3 text-sm leading-6 text-slate-400">The engine found two paths for your upcoming liquidity gap. Choose the one that protects your financial health.</p>

            <div className="mt-6 space-y-3">
              <InterventionCard
                icon={<ArrowDownRight size={18} />}
                title="Let EMI Bounce"
                description={`Allow the EMI of ${formatCurrency(inputs.emiAmount)} to fail on ${inputs.emiDay} August.`}
                cost={`₹${BOUNCE_FEE} fee`}
                impact={`-${CIBIL_DROP} CIBIL`}
                danger
                selected={false}
              />
              <InterventionCard
                icon={<CreditCard size={18} />}
                title={`Transfer ${formatCurrency(analysis.transferAmount)} to 0% Credit Card`}
                description="Bridge the temporary gap and preserve your repayment history."
                cost={`₹${PROCESSING_FEE} fee`}
                impact="0 CIBIL impact"
                selected={isOptimized}
              />
            </div>

            <button
              type="button"
              onClick={handleExecute}
              disabled={isOptimized || !analysis.hasShortfall}
              className={`group mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                isOptimized
                  ? 'cursor-default bg-emerald-400/15 text-emerald-400'
                  : !analysis.hasShortfall
                    ? 'cursor-not-allowed bg-slate-700/40 text-slate-500'
                    : 'bg-emerald-400 text-slate-950 shadow-[0_8px_26px_rgba(52,211,153,0.2)] hover:bg-emerald-300 hover:shadow-[0_8px_32px_rgba(52,211,153,0.32)]'
              }`}
            >
              {isOptimized ? (
                <><Check size={17} /> Optimal strategy executed</>
              ) : !analysis.hasShortfall ? (
                <>No shortfall to resolve</>
              ) : (
                <>Execute optimal strategy <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
            {isOptimized && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
              >
                <RotateCcw size={13} /> Reset scenario
              </button>
            )}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-600"><LockKeyhole size={11} /> Secure simulation · No money moved</div>
          </aside>
        </section>

        <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0c1220]/80 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Landmark size={14} className="text-emerald-400" /> Scenario inputs · Adjust live
          </div>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <SliderInput icon={<Wallet size={15} />} label="Starting balance" value={inputs.startBalance} min={0} max={50000} step={500} prefix="₹" onChange={(v) => updateInput('startBalance', v)} />
            <SliderInput icon={<ArrowUpRight size={15} />} label="Monthly income" value={inputs.monthlyIncome} min={0} max={200000} step={1000} prefix="₹" onChange={(v) => updateInput('monthlyIncome', v)} />
            <SliderInput icon={<Banknote size={15} />} label="EMI amount" value={inputs.emiAmount} min={0} max={50000} step={500} prefix="₹" onChange={(v) => updateInput('emiAmount', v)} />
            <SliderInput icon={<TrendingDown size={15} />} label="Daily spend" value={inputs.dailySpend} min={0} max={2000} step={20} prefix="₹" onChange={(v) => updateInput('dailySpend', v)} />
            <SliderInput icon={<CircleHelp size={15} />} label="EMI debit day" value={inputs.emiDay} min={1} max={28} step={1} suffix=" Aug" onChange={(v) => updateInput('emiDay', v)} />
            <SliderInput icon={<ArrowUpRight size={15} />} label="Income credit day" value={inputs.incomeDay} min={1} max={28} step={1} suffix=" Aug" onChange={(v) => updateInput('incomeDay', v)} />
            <SliderInput icon={<ShieldCheck size={15} />} label="Current CIBIL score" value={inputs.cibilScore} min={300} max={900} step={10} onChange={(v) => updateInput('cibilScore', v)} />
          </div>
        </section>

        <section className="mt-5 grid gap-5 sm:grid-cols-3">
          <MetricCard icon={<Wallet size={17} />} label="Current balance" value={formatCurrency(inputs.startBalance)} helper="Available now" />
          <MetricCard icon={<Banknote size={17} />} label="Upcoming EMI" value={formatCurrency(inputs.emiAmount)} helper={`HDFC Car Loan · ${inputs.emiDay} Aug`} tone="red" />
          <MetricCard icon={<ArrowUpRight size={17} />} label="Avoided loss" value={isOptimized ? `₹${BOUNCE_FEE}` : '—'} helper={isOptimized ? 'Bounce fee saved' : 'Execute a strategy to save'} tone={isOptimized ? 'green' : 'neutral'} />
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/[0.08] py-8 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Chrona AI · Financial decision intelligence</p>
          <p className="flex items-center gap-1.5"><CircleHelp size={13} /> {loaded ? 'Scenario auto-saved' : 'Loading saved scenario…'}</p>
        </footer>
      </div>
    </main>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-xl border border-white/10 bg-[#111a2a]/95 px-3 py-2.5 shadow-xl backdrop-blur">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${value < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(value)}</p>
    </div>
  );
}

function InterventionCard({ icon, title, description, cost, impact, danger = false, selected }: { icon: ReactNode; title: string; description: string; cost: string; impact: string; danger?: boolean; selected: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition-all duration-500 ${selected ? 'border-emerald-400/40 bg-emerald-400/[0.08]' : danger ? 'border-red-500/20 bg-red-500/[0.035]' : 'border-white/[0.08] bg-white/[0.025]'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${danger ? 'bg-red-500/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-5 text-slate-100">{title}</h3>
            {selected && <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-xs">
        <span className="text-slate-500">Total cost <strong className={danger ? 'text-red-400' : 'text-slate-300'}>{cost}</strong></span>
        <span className={danger ? 'text-red-400' : 'text-emerald-400'}>{impact}</span>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, helper, tone = 'neutral' }: { icon: ReactNode; label: string; value: string; helper: string; tone?: 'neutral' | 'red' | 'green' }) {
  const toneClass = tone === 'red' ? 'text-red-400' : tone === 'green' ? 'text-emerald-400' : 'text-white';
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 px-4 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className={`mt-0.5 text-lg font-semibold tracking-tight ${toneClass}`}>{value}</p>
        <p className="truncate text-[11px] text-slate-600">{helper}</p>
      </div>
    </div>
  );
}

function SliderInput({
  icon,
  label,
  value,
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {icon} {label}
        </span>
        <span className="text-sm font-semibold text-white">{prefix}{value.toLocaleString('en-IN')}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-emerald-400"
      />
    </div>
  );
}

export default App;
