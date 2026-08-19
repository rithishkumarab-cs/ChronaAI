export type ScenarioInputs = {
  startBalance: number;
  monthlyIncome: number;
  incomeDay: number;
  emiAmount: number;
  emiDay: number;
  dailySpend: number;
  cibilScore: number;
};

export type ProjectionPoint = {
  day: string;
  balance: number;
};

export const DEFAULT_INPUTS: ScenarioInputs = {
  startBalance: 9800,
  monthlyIncome: 65000,
  incomeDay: 1,
  emiAmount: 12000,
  emiDay: 15,
  dailySpend: 320,
  cibilScore: 720,
};

export const BOUNCE_FEE = 590;
export const PROCESSING_FEE = 199;
export const CIBIL_DROP = 30;
export const SAFETY_BUFFER = 1500;

export function computeProjection(inputs: ScenarioInputs, optimized: boolean): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  let balance = inputs.startBalance;
  let interventionApplied = false;

  const defaultProjection = computeDefault(inputs);
  const minDefault = Math.min(...defaultProjection.map((p) => p.balance));
  const shortfall = minDefault < 0 ? Math.abs(minDefault) : 0;
  const transferAmount = shortfall > 0 ? shortfall + SAFETY_BUFFER : 0;
  const interventionDay = Math.max(1, inputs.emiDay - 1);

  for (let day = 1; day <= 30; day++) {
    if (optimized && !interventionApplied && day === interventionDay && transferAmount > 0) {
      balance += transferAmount - PROCESSING_FEE;
      interventionApplied = true;
    }
    balance -= inputs.dailySpend;
    if (day === inputs.incomeDay) balance += inputs.monthlyIncome;
    if (day === inputs.emiDay) balance -= inputs.emiAmount;
    points.push({ day: `${day} Aug`, balance });
  }
  return points;
}

function computeDefault(inputs: ScenarioInputs): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  let balance = inputs.startBalance;
  for (let day = 1; day <= 30; day++) {
    balance -= inputs.dailySpend;
    if (day === inputs.incomeDay) balance += inputs.monthlyIncome;
    if (day === inputs.emiDay) balance -= inputs.emiAmount;
    points.push({ day: `${day} Aug`, balance });
  }
  return points;
}

export function analyzeScenario(inputs: ScenarioInputs, isOptimized: boolean) {
  const defaultData = computeDefault(inputs);
  const optimizedData = computeProjection(inputs, true);
  const chartData = isOptimized ? optimizedData : defaultData;

  const defaultMin = Math.min(...defaultData.map((p) => p.balance));
  const optimizedMin = Math.min(...optimizedData.map((p) => p.balance));
  const hasShortfall = defaultMin < 0;
  const shortfallAmount = hasShortfall ? Math.abs(defaultMin) : 0;
  const shortfallDayIndex = defaultData.reduce(
    (minIdx, p, idx, arr) => (p.balance < arr[minIdx].balance ? idx : minIdx),
    0,
  );
  const shortfallDay = shortfallDayIndex + 1;
  const optimizedResolved = optimizedMin >= 0;
  const transferAmount = shortfallAmount > 0 ? shortfallAmount + SAFETY_BUFFER : 0;

  return {
    chartData,
    defaultData,
    optimizedData,
    defaultMin,
    optimizedMin,
    hasShortfall,
    shortfallAmount,
    shortfallDay,
    optimizedResolved,
    transferAmount,
    finalBalance: chartData[chartData.length - 1].balance,
  };
}

export function formatCurrency(value: number): string {
  return `${value < 0 ? '-₹' : '₹'}${Math.abs(value).toLocaleString('en-IN')}`;
}
