// ---------- helpers ----------
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");
const keyOf = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parseKey = k => { const [y,m,d] = k.split("-").map(Number); return new Date(y,m-1,d); };
const todayKey = () => keyOf(new Date());
const longDate = k => parseKey(k).toLocaleDateString(locale(),{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const shortDate = k => parseKey(k).toLocaleDateString(locale(),{day:"numeric",month:"long",year:"numeric"});
const niceDate = k => {
  const t = todayKey(), y = keyOf(new Date(Date.now()-864e5));
  const base = parseKey(k).toLocaleDateString(locale(),{weekday:"long",day:"numeric",month:"long"});
  return k===t ? vt("Vandaag · ", "Today · ")+base : k===y ? vt("Gisteren · ", "Yesterday · ")+base : base;
};
const daysClean = k => {
  if(!settings.since) return null;
  const n = Math.round((parseKey(k) - parseKey(settings.since))/864e5);
  return n >= 0 ? n : null;
};
const emptyEntry = k => ({date:k, answers:{}, cijfer:"", updated:0});
