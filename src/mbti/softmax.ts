function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function softmaxPercents(values: number[], tau: number): number[] {
  if (values.length === 0) return [];

  const safeTau = clamp(tau, 0.0001, 1000);
  const scaled = values.map((v) => v / safeTau);
  const max = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - max));
  const sum = exps.reduce((acc, v) => acc + v, 0);

  const rawPercents = exps.map((v) => (sum === 0 ? 0 : (v / sum) * 100));
  const rounded = rawPercents.map((p) => Math.round(p));

  let delta = 100 - rounded.reduce((acc, v) => acc + v, 0);
  if (delta === 0) return rounded;

  const fractions = rawPercents.map((p, i) => ({
    index: i,
    frac: p - Math.floor(p),
  }));

  fractions.sort((a, b) => (delta > 0 ? b.frac - a.frac : a.frac - b.frac));

  const adjusted = [...rounded];
  for (let i = 0; i < Math.abs(delta); i += 1) {
    const target = fractions[i % fractions.length].index;
    adjusted[target] += delta > 0 ? 1 : -1;
  }

  return adjusted.map((p) => clamp(p, 0, 100));
}

