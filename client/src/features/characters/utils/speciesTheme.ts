export interface SpeciesTheme {
  border: string;
  badge: string;
  background: string;
  accent: string;
}

const humanTheme: SpeciesTheme = {
    border: 'border-sky-400/60',
    badge: 'bg-sky-400 text-slate-950',
    background: 'from-sky-500/16 to-slate-950/70',
    accent: 'text-sky-200',
  };
const droidTheme: SpeciesTheme = {
    border: 'border-cyan-300/60',
    badge: 'bg-cyan-300 text-slate-950',
    background: 'from-cyan-400/16 to-slate-950/70',
    accent: 'text-cyan-100',
  };
const wookieTheme: SpeciesTheme = {
    border: 'border-amber-500/70',
    badge: 'bg-amber-400 text-slate-950',
    background: 'from-amber-500/16 to-slate-950/70',
    accent: 'text-amber-200',
  };
const gunganTheme: SpeciesTheme = {
    border: 'border-lime-400/60',
    badge: 'bg-lime-300 text-slate-950',
    background: 'from-lime-400/16 to-slate-950/70',
    accent: 'text-lime-200',
  };
const twilekTheme: SpeciesTheme = {
    border: 'border-violet-400/60',
    badge: 'bg-violet-300 text-slate-950',
    background: 'from-violet-400/16 to-slate-950/70',
    accent: 'text-violet-100',
  };
const rodianTheme: SpeciesTheme = {
    border: 'border-emerald-400/60',
    badge: 'bg-emerald-300 text-slate-950',
    background: 'from-emerald-400/16 to-slate-950/70',
    accent: 'text-emerald-100',
  };

const knownThemes: Record<string, SpeciesTheme> = {
  human: humanTheme,
  droid: droidTheme,
  wookie: wookieTheme,
  gungan: gunganTheme,
  "twi'lek": twilekTheme,
  rodian: rodianTheme,
};

const generatedThemes: SpeciesTheme[] = [
  humanTheme,
  droidTheme,
  wookieTheme,
  gunganTheme,
  twilekTheme,
  rodianTheme,
];

export function speciesTheme(speciesName: string): SpeciesTheme {
  const key = speciesName.trim().toLowerCase() || 'human';
  const known = knownThemes[key];
  if (known) return known;
  const hash = [...key].reduce((total, char) => total + char.charCodeAt(0), 0);
  return generatedThemes[hash % generatedThemes.length] ?? humanTheme;
}
