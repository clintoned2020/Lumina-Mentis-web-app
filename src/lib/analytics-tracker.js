// Analytics tracker — stores session/page/interaction data in localStorage

const STORAGE_KEY = 'lm_analytics';

function getData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export function trackPageView(page) {
  const data = getData();
  const d = today();
  if (!data.pageViews) data.pageViews = {};
  if (!data.pageViews[d]) data.pageViews[d] = {};
  data.pageViews[d][page] = (data.pageViews[d][page] || 0) + 1;

  // Track sessions: a session = a page view after a gap or on new day
  if (!data.sessions) data.sessions = [];
  const now = Date.now();
  const last = data.lastActivity || 0;
  const SESSION_GAP = 30 * 60 * 1000; // 30 min
  if (now - last > SESSION_GAP) {
    data.sessions.push({ date: d, start: now, end: now });
  } else {
    const s = data.sessions[data.sessions.length - 1];
    if (s) s.end = now;
  }
  data.lastActivity = now;
  saveData(data);
}

export function trackDisorderView(disorderName) {
  const data = getData();
  if (!data.disorderViews) data.disorderViews = {};
  data.disorderViews[disorderName] = (data.disorderViews[disorderName] || 0) + 1;
  saveData(data);
}

export function trackInteraction(section) {
  const data = getData();
  const d = today();
  if (!data.interactions) data.interactions = {};
  if (!data.interactions[d]) data.interactions[d] = {};
  data.interactions[d][section] = (data.interactions[d][section] || 0) + 1;
  saveData(data);
}

export function trackTimeSpent(section, seconds) {
  const data = getData();
  if (!data.timeSpent) data.timeSpent = {};
  data.timeSpent[section] = (data.timeSpent[section] || 0) + seconds;
  saveData(data);
}

export function getAnalyticsData() {
  return getData();
}

export function clearAnalyticsData() {
  localStorage.removeItem(STORAGE_KEY);
}