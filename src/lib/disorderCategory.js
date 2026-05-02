/** Map Supabase `disorder.category` text to filter / pill keys used in the UI. */
export function normalizeDisorderCategoryKey(value) {
  if (value == null) return 'other';
  const raw = String(value).trim().toLowerCase();
  if (!raw) return 'other';
  const v = raw.replace(/[\s-]+/g, '_');

  const direct = new Set(['psychotic', 'mood', 'anxiety', 'neurodevelopmental', 'other']);
  if (direct.has(v)) return v;

  if (v.includes('psychotic') || v.includes('schizo')) return 'psychotic';
  if (v.includes('mood')) return 'mood';
  if (v.includes('anxiety') || v.includes('panic') || v.includes('ocd') || v.includes('stress') || v.includes('phobia')) return 'anxiety';
  if (
    v.includes('neurodevelopmental') ||
    v.includes('neurodiver') ||
    v.includes('adhd') ||
    v.includes('autism') ||
    v.includes('asd') ||
    v.includes('developmental')
  ) return 'neurodevelopmental';
  if (v.includes('eating') || v.includes('anorexia') || v.includes('bulimia') || v.includes('arfid')) return 'mood';
  if (v.includes('personality') || v.includes('borderline') || v.includes('npd') || v.includes('antisocial')) return 'other';

  return 'other';
}

export function disorderMatchesCategory(disorder, activeCategory) {
  if (activeCategory === 'all') return true;
  return normalizeDisorderCategoryKey(disorder?.category) === activeCategory;
}
