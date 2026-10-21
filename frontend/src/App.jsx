/* ============================================================================
   SAFE WORK CHAT — Humanized Edition 🧡
   Warm palette · conversational copy · undo toasts · celebrations · a11y
   npm install styled-components prop-types --legacy-peer-deps
   ============================================================================ */
import React, { useState, useEffect, useContext, useMemo, useCallback, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider, keyframes, createGlobalStyle } from 'styled-components';

/* ============================== UTILS ==================================== */
const uid = (p = '') => p + Math.random().toString(36).slice(2, 10);
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const timeStr = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const timeAgo = (ts) => { const d = Date.now() - ts; if (d < 60000) return 'just now'; if (d < 3600000) return `${Math.floor(d / 60000)}m ago`; if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`; return `${Math.floor(d / 86400000)}d ago`; };
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const pwdScore = (p) => { let s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return s; };
const genInviteCode = () => Math.random().toString(36).slice(2, 10).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
const PRAISE = ['Crushed it.', "That's how it's done.", 'Big win!', 'Lovely work.', 'Boom — done.'];

/* ========================= WARM THEME ===================================== */
const theme = {
  bg: '#141210', panel: '#1c1917', panel2: '#242019', raised: '#2a2521',
  border: '#3a332c', borderSoft: '#2e2924',
  text: '#faf7f2', textDim: '#a89f94', textFaint: '#7a7168',
  coral: '#ff6b5e', coralDim: 'rgba(255,107,94,0.14)',
  teal: '#2fbfa8', tealDim: 'rgba(47,191,168,0.14)',
  amber: '#f0a83c', amberBg: 'rgba(240,168,60,0.16)',
  green: '#4cb782', greenBg: 'rgba(76,183,130,0.16)',
  gray: '#a89f94', grayBg: 'rgba(168,159,148,0.14)',
  danger: '#e5697a', dangerBg: 'rgba(229,105,122,0.14)',
  blue: '#6aa5e8', blueBg: 'rgba(106,165,232,0.14)',
};
const AVATAR_COLORS = ['#8b7cf6', '#ff6b5e', '#f0a83c', '#2fbfa8', '#6aa5e8', '#e5697a'];

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; background: ${theme.bg}; color: ${theme.text};
    font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  h1, h2, h3, button { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
  button, input, textarea, select { font-family: inherit; color: inherit; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 999px; }
  :focus-visible { outline: 2px solid ${theme.teal}; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
    .confetti-piece { display: none !important; }
  }
`;

/* ============================== ICONS ==================================== */
const PATHS = {
  shield: 'M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z', lock: 'M6 11V8a6 6 0 0 1 12 0v3 M5 11h14v9H5z',
  palette: 'M12 2a10 10 0 1 0 3 19.5c1-.3 1.2-1.6.3-2.2-.6-.4-.7-1.2-.2-1.7.4-.4 1-.5 1.5-.3A9.9 9.9 0 0 0 22 12 10 10 0 0 0 12 2z M7 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z M9 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z M15 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z M17 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z',
  search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M21 21l-4.35-4.35', plus: 'M12 5v14 M5 12h14', x: 'M18 6L6 18 M6 6l12 12',
  clip: 'M21.4 11.1 12.3 20a5 5 0 1 1-7.1-7.1l8.5-8.5a3.3 3.3 0 1 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 1 1-2.4-2.4l7.8-7.8',
  send: 'M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7z', file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  image: 'M3 3h18v18H3z M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M21 15l-5-5L5 21',
  sheet: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z', slides: 'M2 3h20v14H2z M8 21h8 M12 17v4',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2', chevronDown: 'M6 9l6 6 6-6', check: 'M20 6 9 17l-5-5', crown: 'M3 8l4 4 5-8 5 8 4-4-2 11H5z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12', checkDouble: 'M2 12l5 5L18 6 M8 12l3 3 9-9',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff: 'M17.94 17.94A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a19.5 19.5 0 0 1 4.22-5.94 M9.9 4.24A10 10 0 0 1 12 4c7 0 11 8 11 8a19.5 19.5 0 0 1-2.16 3.19 M14.12 14.12a3 3 0 1 1-4.24-4.24 M1 1l22 22',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  copy: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  mail: 'M4 4h16v16H4z M22 6l-10 7L2 6', user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  trash: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  mute: 'M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6 M17 9l6 6', ban: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M4.93 4.93l14.14 14.14',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l5.64 5.36A9 9 0 0 0 20.49 15',
  shield2: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', spark: 'M12 2l2.3 5.4L20 9l-4.5 4 1.3 6L12 16.8 7.2 19l1.3-6L4 9l5.7-1.6L12 2z',
};
function Icon({ name, size = 18, ...p }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {PATHS[name]?.split(' M').map((d, i) => <path key={i} d={(i ? 'M' : '') + d} />)}
  </svg>);
}
Icon.propTypes = { name: PropTypes.string.isRequired, size: PropTypes.number };

/* ========================== MOCK DATA ===================================== */
const TEAM = [
  { id: 'u1', name: 'Radhika P', email: 'radhika@example.com', color: AVATAR_COLORS[1], role: 'Admin', joinedAt: Date.now() - 86400000 * 30 },
  { id: 'u2', name: 'Arun Kumar', email: 'arun@example.com', color: AVATAR_COLORS[0], role: 'Moderator', joinedAt: Date.now() - 86400000 * 22 },
  { id: 'u3', name: 'Priya Sharma', email: 'priya@example.com', color: AVATAR_COLORS[2], role: 'Member', joinedAt: Date.now() - 86400000 * 12 },
  { id: 'u4', name: 'Carlos Vega', email: 'carlos@example.com', color: AVATAR_COLORS[4], role: 'Member', joinedAt: Date.now() - 86400000 * 7, muted: true },
];
const PENDING = [
  { id: 'p1', name: 'Mei Tanaka', email: 'mei@example.com', requestedAt: Date.now() - 86400000 * 2, via: 'an invite link' },
  { id: 'p2', name: 'Omar Haddad', email: 'omar@example.com', requestedAt: Date.now() - 86400000, via: 'an email invite' },
];
const ROOM_SEED = [
  { id: 'r1', name: 'Mini Project III — Core Team', icon: 'shield', iconColor: theme.teal, members: ['me', 'u1', 'u2', 'u3', 'u4'], messages: [
    { id: uid(), system: true, text: 'Your messages are private — encrypted end-to-end 💛' },
    { id: uid(), from: 'me', text: 'Welcome in, everyone! This room is our home base for the mini project.', ts: Date.now() - 5400000 },
    { id: uid(), from: 'u1', text: 'Love it — the live sync is buttery smooth on my end ✨', read: true, ts: Date.now() - 5280000 },
    { id: uid(), taskCard: true, from: 'me', ts: Date.now() - 4800000, task: { title: 'Implement JWT Authentication', assignee: 'u2' } },
  ] },
  { id: 'r2', name: 'Backend & Security', icon: 'lock', iconColor: theme.amber, members: ['me', 'u2'], messages: [
    { id: uid(), from: 'u2', text: 'Nice. Make sure every action hits the audit log before merging.', ts: Date.now() - 9200000 } ] },
  { id: 'r3', name: 'UI / Frontend', icon: 'palette', iconColor: theme.green, members: ['me', 'u1', 'u3'], messages: [
    { id: uid(), from: 'u3', text: 'New chat bubble styles are in the shared Figma, take a look when free 🎨', ts: Date.now() - 3200000 } ] },
];
const TASK_SEED = [
  { id: uid(), roomId: 'r1', title: 'Implement JWT Authentication', status: 'Needs Review', progress: 78, assignee: 'u2', description: 'Set up stateless auth with role tokens (Admin/User) at the API gateway.' },
  { id: uid(), roomId: 'r1', title: 'Design ER Diagram', status: 'Needs Review', progress: 62, assignee: 'u1', description: 'Users, Rooms, Messages, Tasks, Documents collections with relationships.' },
  { id: uid(), roomId: 'r1', title: 'Setup MongoDB Atlas Cluster', status: 'Completed', progress: 100, assignee: 'u2', description: 'Cloud-managed DB host with Mongoose schemas.' },
  { id: uid(), roomId: 'r1', title: 'Build Notification Tray UI', status: 'To-do', progress: 8, assignee: 'u3', description: 'Persistent alerts that cannot be dismissed until task = Completed.' },
];
const DOC_SEED = [
  { id: uid(), roomId: 'r1', name: 'ER_Diagram_v2.png', type: 'image', by: 'u1', size: '1.2 MB', at: Date.now() - 86400000 },
  { id: uid(), roomId: 'r1', name: 'SRS_SafeWorkChat.pdf', type: 'file', by: 'me', size: '2.8 MB', at: Date.now() - 172800000 },
  { id: uid(), roomId: 'r1', name: 'API_Endpoints.xlsx', type: 'sheet', by: 'u2', size: '340 KB', at: Date.now() - 259200000 },
];
const STATUS_ORDER = ['To-do', 'In Progress', 'Needs Review', 'Completed'];
const STATUS_STYLE = { 'To-do': { bg: theme.grayBg, fg: theme.gray }, 'In Progress': { bg: theme.tealDim, fg: theme.teal }, 'Needs Review': { bg: theme.amberBg, fg: theme.amber }, Completed: { bg: theme.greenBg, fg: theme.green } };
const ROLE_STYLE = { Owner: { bg: theme.amberBg, fg: theme.amber, icon: 'crown' }, Admin: { bg: theme.tealDim, fg: theme.teal, icon: 'shield2' }, Moderator: { bg: theme.blueBg, fg: theme.blue, icon: 'shield' }, Member: { bg: theme.grayBg, fg: theme.gray, icon: 'user' } };
const TYPE_ICON = { file: 'file', image: 'image', sheet: 'sheet', slides: 'slides' };
const TYPE_COLOR = { file: theme.coral, image: theme.teal, sheet: theme.green, slides: theme.amber };

/* ============================ STORE ======================================= */
const Ctx = React.createContext(null);
const useApp = () => useContext(Ctx);

function AppProvider({ children }) {
  const [me, setMe] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'admin@safechat.dev', username: 'bexalin', password: 'Admin@123', displayName: 'Bexalin B A', bio: 'Building Safe Work Chat — a workspace that feels like a team, not a tool.', contact: '+91 98xxxxxx00', privacy: 'friends', avatarColor: AVATAR_COLORS[1], joinedAt: Date.now() - 86400000 * 90 },
  ]);
  const [pendingVerify, setPendingVerify] = useState(null);
  const [rooms, setRooms] = useState(ROOM_SEED);
  const [tasks, setTasks] = useState(TASK_SEED);
  const [docs, setDocs] = useState(DOC_SEED);
  const [team, setTeam] = useState(TEAM);
  const [pending, setPending] = useState(PENDING);
  const [activity, setActivity] = useState([
    { id: uid(), text: 'Radhika P moved “Design ER Diagram” to Needs Review', ts: Date.now() - 3600000, icon: 'activity' },
    { id: uid(), text: 'Arun Kumar completed “Setup MongoDB Atlas Cluster” 🎉', ts: Date.now() - 7200000, icon: 'check' },
    { id: uid(), text: 'You invited Carlos Vega with an invite link', ts: Date.now() - 86400000, icon: 'link' },
  ]);
  const [inviteLinks, setInviteLinks] = useState([
    { id: uid(), code: 'ABC9X2F1', room: 'r1', createdAt: Date.now() - 86400000 * 3, expiresAt: Date.now() + 86400000 * 4, maxUses: 10, uses: 4, role: 'Member', active: true },
    { id: uid(), code: 'QZ7MKLP9', room: 'r1', createdAt: Date.now() - 86400000 * 10, expiresAt: Date.now() - 86400000 * 3, maxUses: 5, uses: 5, role: 'Member', active: false },
  ]);
  const [selectedRoomId, setSelectedRoomId] = useState('r1');
  const [notifs, setNotifs] = useState([]);
  const [celebration, setCelebration] = useState(0);
  const [rateLimit, setRateLimit] = useState({ last: 0, count: 0 });

  const pushNotif = useCallback((text, opts = {}) => setNotifs((n) => [{ id: uid(), text, ts: Date.now(), ...opts }, ...n].slice(0, 20)), []);
  const pushActivity = useCallback((text, icon = 'activity') => setActivity((a) => [{ id: uid(), text, ts: Date.now(), icon }, ...a].slice(0, 60)), []);

  const sendMessage = useCallback((roomId, text) => setRooms((rs) => rs.map((r) => r.id === roomId ? { ...r, messages: [...r.messages, { id: uid(), from: 'me', text, ts: Date.now() }] } : r)), []);
  const createRoom = useCallback((name, memberIds) => {
    const id = uid('room');
    const room = { id, name, icon: pick(['shield', 'lock', 'palette']), iconColor: pick([theme.teal, theme.amber, theme.green, theme.coral]), members: ['me', ...memberIds], messages: [{ id: uid(), system: true, text: `You opened this room — messages here stay private 💛` }] };
    setRooms((rs) => [room, ...rs]); setSelectedRoomId(id);
    pushActivity(`You opened the room “${name}”`, 'plus');
    pushNotif(`“${name}” is live! Invite a teammate or say hi first.`);
    return id;
  }, [pushActivity, pushNotif]);

  const assignTask = useCallback((roomId, { title, description, assignee }) => {
    const task = { id: uid(), roomId, title, description, assignee, status: 'To-do', progress: 0 };
    setTasks((t) => [task, ...t]);
    setRooms((rs) => rs.map((r) => r.id === roomId ? { ...r, messages: [...r.messages, { id: uid(), taskCard: true, from: 'me', ts: Date.now(), task: { title, assignee } }] } : r));
    const person = team.find((t) => t.id === assignee);
    pushNotif(`${person?.name} just got “${title}” — they've been notified gently 🔔`);
    pushActivity(`You handed “${title}” to ${person?.name}`, 'check');
  }, [team, pushNotif, pushActivity]);

  const setTaskStatus = useCallback((taskId, status) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, status, progress: status === 'Completed' ? 100 : status === 'To-do' ? Math.min(t.progress, 20) : t.progress } : t));
    if (!task) return;
    const person = team.find((t) => t.id === task.assignee);
    if (status === 'Completed') {
      setCelebration(Date.now());
      pushNotif(`🎉 “${task.title}” is complete — ${pick(PRAISE)} Great work, ${person?.name}!`, { action: { label: '👏 Say thanks', fn: () => pushNotif(`You clapped for ${person?.name} — they'll feel the love 💛`) } });
      pushActivity(`${person?.name} completed “${task.title}” 🎉`, 'check');
    } else {
      pushNotif(`“${task.title}” moved to ${status} — nice progress.`);
      pushActivity(`${person?.name} moved “${task.title}” to ${status}`, 'activity');
    }
  }, [tasks, team, pushNotif, pushActivity]);

  const addDocument = useCallback((roomId, name) => {
    const ext = name.split('.').pop().toLowerCase();
    const type = ['png', 'jpg', 'jpeg'].includes(ext) ? 'image' : ['xlsx', 'xls', 'csv'].includes(ext) ? 'sheet' : ['ppt', 'pptx'].includes(ext) ? 'slides' : 'file';
    setDocs((d) => [{ id: uid(), roomId, name, type, by: 'me', size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`, at: Date.now() }, ...d]);
    setRooms((rs) => rs.map((r) => r.id === roomId ? { ...r, messages: [...r.messages, { id: uid(), from: 'me', text: `📎 shared ${name} — feel free to look!`, ts: Date.now() }] } : r));
    pushNotif(`${name} is up! The whole room can see it now.`);
    pushActivity(`You shared “${name}”`, 'upload');
  }, [pushNotif, pushActivity]);

  /* ---- auth ---- */
  const login = useCallback((idf, password) => {
    const u = registeredUsers.find((x) => x.email === idf || x.username === idf);
    if (!u || u.password !== password) return { ok: false, err: 'That email and password don\'t match. Double-check, or reset it below — we\'ll help.' };
    setMe(u);
    pushNotif(`${greet()}, ${u.displayName.split(' ')[0]}! Opening your rooms where you left off.`);
    pushActivity(`${u.displayName} signed in`, 'lock');
    return { ok: true };
  }, [registeredUsers, pushNotif, pushActivity]);
  const register = useCallback((data) => {
    if (registeredUsers.some((u) => u.email === data.email)) return { ok: false, err: 'Someone already uses this email. Try signing in instead?' };
    if (registeredUsers.some((u) => u.username === data.username)) return { ok: false, err: 'That username is taken — how about adding a number or initial?' };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingVerify({ ...data, code });
    return { ok: true, code };
  }, [registeredUsers]);
  const verifyEmail = useCallback((code) => {
    if (!pendingVerify) return { ok: false, err: 'No verification in progress.' };
    if (code !== pendingVerify.code) return { ok: false, err: 'That code doesn\'t match — check the 6 digits and try again.' };
    const nu = { email: pendingVerify.email, username: pendingVerify.username, password: pendingVerify.password, displayName: pendingVerify.displayName, bio: '', contact: '', privacy: 'friends', avatarColor: pick(AVATAR_COLORS), joinedAt: Date.now() };
    setRegisteredUsers((r) => [...r, nu]); setMe(nu); setPendingVerify(null);
    pushNotif(`Welcome aboard, ${nu.displayName}! 🎈 Take a look around.`);
    return { ok: true };
  }, [pendingVerify, pushNotif]);
  const logout = useCallback(() => setMe(null), []);
  const updateProfile = useCallback((patch) => setMe((m) => m ? { ...m, ...patch } : m), []);

  /* ---- members & invites (with undo) ---- */
  const checkRate = useCallback(() => {
    const now = Date.now();
    if (now - rateLimit.last > 60000) { setRateLimit({ last: now, count: 1 }); return true; }
    if (rateLimit.count >= 5) return false;
    setRateLimit((r) => ({ ...r, count: r.count + 1 })); return true;
  }, [rateLimit]);
  const createInviteLink = useCallback((roomId, opts) => {
    if (!checkRate()) return { ok: false, err: 'Easy there — you\'ve made a few links already. Give it a minute and try again.' };
    const ms = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 }[opts.expiry] || 604800000;
    const link = { id: uid(), code: genInviteCode(), room: roomId, createdAt: Date.now(), expiresAt: Date.now() + ms, maxUses: opts.maxUses || null, uses: 0, role: opts.role || 'Member', active: true };
    setInviteLinks((ls) => [link, ...ls]);
    pushNotif('Invite link ready — copy it and share it with your teammate.');
    pushActivity('You made a new invite link', 'link');
    return { ok: true, link };
  }, [checkRate, pushNotif, pushActivity]);
  const revokeInvite = useCallback((id) => {
    const l = inviteLinks.find((x) => x.id === id);
    setInviteLinks((ls) => ls.map((x) => x.id === id ? { ...x, active: false } : x));
    pushNotif('Link turned off. Changed your mind?', { action: { label: 'Undo', fn: () => setInviteLinks((ls) => ls.map((x) => x.id === id ? { ...x, active: true } : x)) } });
    if (l) pushActivity('You turned off an invite link', 'x');
  }, [inviteLinks, pushNotif, pushActivity]);
  const regenInvite = useCallback((id) => {
    setInviteLinks((ls) => ls.map((l) => l.id === id ? { ...l, code: genInviteCode(), uses: 0, active: true, expiresAt: Date.now() + 604800000 } : l));
    pushNotif('Fresh link made — the old one stops working now.');
  }, [pushNotif]);
  const changeRole = useCallback((userId, role) => {
    setTeam((t) => t.map((m) => m.id === userId ? { ...m, role } : m));
    const u = team.find((m) => m.id === userId);
    pushNotif(`${u?.name} is now ${role === 'Owner' ? 'the' : 'a'} ${role}. They'll see the new powers right away.`);
    pushActivity(`${u?.name} became ${role}`, 'crown');
  }, [team, pushNotif, pushActivity]);
  const removeMember = useCallback((userId) => {
    const m = team.find((x) => x.id === userId); if (!m) return;
    setTeam((t) => t.filter((x) => x.id !== userId));
    pushNotif(`${m.name} was removed. If that was too harsh, bring them back.`, { action: { label: 'Undo', fn: () => setTeam((t) => [...t, m]) } });
    pushActivity(`${m.name} was removed from the team`, 'trash');
  }, [team, pushNotif, pushActivity]);
  const muteMember = useCallback((userId, muted) => {
    setTeam((t) => t.map((m) => m.id === userId ? { ...m, muted } : m));
    const u = team.find((m) => m.id === userId);
    pushNotif(muted ? `${u?.name} is on quiet for now.` : `${u?.name} can chat again.`);
  }, [team, pushNotif]);
  const banMember = useCallback((userId) => {
    const m = team.find((x) => x.id === userId); if (!m) return;
    setTeam((t) => t.filter((x) => x.id !== userId));
    pushNotif(`${m.name} was blocked from the team.`, { action: { label: 'Undo', fn: () => setTeam((t) => [...t, m]) } });
    pushActivity(`${m.name} was blocked`, 'ban');
  }, [team, pushNotif, pushActivity]);
  const approvePending = useCallback((id) => {
    const p = pending.find((x) => x.id === id); if (!p) return;
    setPending((l) => l.filter((x) => x.id !== id));
    setTeam((t) => [...t, { id: uid(), name: p.name, email: p.email, color: pick(AVATAR_COLORS), role: 'Member', joinedAt: Date.now() }]);
    pushNotif(`${p.name} is in! Say hi and make them feel at home 👋`);
    pushActivity(`${p.name} joined the team`, 'user');
  }, [pending, pushNotif, pushActivity]);
  const rejectPending = useCallback((id) => {
    const p = pending.find((x) => x.id === id);
    setPending((l) => l.filter((x) => x.id !== id));
    pushNotif(`We let ${p?.name} know gently. Request closed.`);
  }, [pending, pushNotif]);
  const inviteByEmail = useCallback((roomId, emails, role) => {
    if (!checkRate()) return { ok: false, err: 'Easy there — too many invites at once. Give it a minute.' };
    const valid = emails.filter(emailOk);
    if (!valid.length) return { ok: false, err: 'Hmm, none of those look like email addresses. Mind checking?' };
    setPending((l) => [...l, ...valid.map((e) => ({ id: uid(), name: e.split('@')[0], email: e, requestedAt: Date.now(), via: 'an email invite', role }))]);
    pushNotif(`Invites sent to ${valid.length} ${valid.length > 1 ? 'people' : 'person'} — we'll tell you when they accept.`);
    return { ok: true, count: valid.length };
  }, [checkRate, pushNotif]);
  const importCsv = useCallback((text, role) => {
    const rows = text.split(/\r?\n/).map((r) => r.split(/[,\t;]/).map((s) => s.trim())).filter((r) => r.length >= 2 && r[1]);
    setPending((l) => [...l, ...rows.map(([name, email]) => ({ id: uid(), name: name || email.split('@')[0], email, requestedAt: Date.now(), via: 'a CSV import', role }))]);
    pushNotif(`Imported ${rows.length} contacts — they're waiting for a welcome.`);
    return { ok: true, count: rows.length };
  }, [pushNotif]);

  const value = useMemo(() => ({
    me, registeredUsers, pendingVerify, rooms, tasks, docs, team, pending, activity, inviteLinks,
    selectedRoomId, setSelectedRoomId, notifs, celebration,
    sendMessage, createRoom, assignTask, setTaskStatus, addDocument, login, register, verifyEmail,
    logout, updateProfile, createInviteLink, revokeInvite, regenInvite, changeRole, removeMember,
    muteMember, banMember, approvePending, rejectPending, inviteByEmail, importCsv,
  }), [me, registeredUsers, pendingVerify, rooms, tasks, docs, team, pending, activity, inviteLinks, selectedRoomId, notifs, celebration, sendMessage, createRoom, assignTask, setTaskStatus, addDocument, login, register, verifyEmail, logout, updateProfile, createInviteLink, revokeInvite, regenInvite, changeRole, removeMember, muteMember, banMember, approvePending, rejectPending, inviteByEmail, importCsv]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
AppProvider.propTypes = { children: PropTypes.node.isRequired };

/* ========================= PRIMITIVES ===================================== */
const Avatar = memo(({ user, size = 34 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: user?.avatarColor || user?.color || theme.gray, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#141210', fontWeight: 800, fontSize: size * 0.4 }}>
    {initials(user?.name || user?.displayName || '?')}
  </div>));
Avatar.propTypes = { user: PropTypes.object, size: PropTypes.number };
const Badge = styled.span`font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:${(p) => p.bg};color:${(p) => p.fg};white-space:nowrap;display:inline-flex;align-items:center;gap:4px;`;
const shimmer = keyframes`0%{opacity:.4}50%{opacity:.9}100%{opacity:.4}`;
const Dot = styled.span`width:7px;height:7px;border-radius:50%;background:${theme.green};display:inline-block;animation:${shimmer} 2s ease-in-out infinite;`;
const Label = styled.div`font-size:12px;font-weight:700;color:${theme.textDim};margin-bottom:6px;`;
const Field = styled.input`width:100%;background:${theme.panel2};border:1px solid ${theme.border};border-radius:10px;padding:11px 12px;color:${theme.text};font-size:13.5px;outline:none;min-height:44px;&:focus{border-color:${theme.teal};}`;
const TextArea = styled.textarea`width:100%;background:${theme.panel2};border:1px solid ${theme.border};border-radius:10px;padding:11px 12px;color:${theme.text};font-size:13.5px;outline:none;min-height:74px;resize:vertical;&:focus{border-color:${theme.teal};}`;
const Select = styled.select`background:${theme.panel2};border:1px solid ${theme.border};border-radius:10px;padding:10px 12px;color:${theme.text};font-size:13px;outline:none;cursor:pointer;min-height:44px;`;
const Chip = styled.button`border-radius:999px;padding:8px 14px;font-size:12.5px;font-weight:700;cursor:pointer;min-height:36px;border:1px solid ${(p) => (p.active ? 'transparent' : theme.border)};background:${(p) => (p.active ? theme.coral : 'transparent')};color:${(p) => (p.active ? '#2a1410' : theme.textDim)};&:hover{border-color:${theme.coral};}`;
const PrimaryBtn = styled.button`width:100%;min-height:46px;padding:12px 0;border-radius:12px;border:none;cursor:pointer;background:${theme.coral};color:#2a1410;font-weight:800;font-size:14px;opacity:${(p) => (p.disabled ? 0.5 : 1)};cursor:${(p) => (p.disabled ? 'not-allowed' : 'pointer')};&:hover:not(:disabled){filter:brightness(1.07);}`;
const GhostBtn = styled.button`min-height:40px;padding:9px 15px;border-radius:10px;cursor:pointer;border:1px solid ${theme.border};background:transparent;color:${theme.textDim};font-weight:700;font-size:12.5px;&:hover{border-color:${theme.teal};color:${theme.teal};}`;
const DangerBtn = styled.button`min-height:40px;padding:9px 15px;border-radius:10px;cursor:pointer;border:1px solid ${theme.danger}44;background:${theme.dangerBg};color:${theme.danger};font-weight:700;font-size:12.5px;`;
const InlineIconBtn = styled.button`width:32px;height:32px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:${theme.textDim};border:none;cursor:pointer;&:hover{background:${theme.raised};color:${theme.text};}`;
const Skeleton = styled.div`height:${(p) => p.h || 14}px;border-radius:8px;margin-bottom:10px;background:${theme.panel2};animation:${shimmer} 1.4s ease-in-out infinite;`;
const useLoaded = (ms = 700) => { const [l, setL] = useState(false); useEffect(() => { const t = setTimeout(() => setL(true), ms); return () => clearTimeout(t); }, [ms]); return l; };
const ErrorText = styled.div`color:${theme.danger};background:${theme.dangerBg};border:1px solid ${theme.danger}44;padding:10px 12px;border-radius:10px;font-size:12.5px;margin-bottom:14px;display:flex;gap:8px;align-items:flex-start;line-height:1.5;`;

/* ========================= CONFETTI 🎉 ==================================== */
const confFall = keyframes`0%{transform:translateY(-8vh) rotate(0);opacity:1}100%{transform:translateY(105vh) rotate(540deg);opacity:.2}`;
function ConfettiBurst({ seed }) {
  const pieces = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ left: rnd(100), delay: rnd(25) / 100, dur: 0.9 + rnd(40) / 100, color: pick([theme.coral, theme.teal, theme.amber, theme.green, theme.blue]), w: 6 + rnd(6), r: rnd(360) })), [seed]);
  if (!seed) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }} aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ position: 'absolute', top: 0, left: `${p.left}%`, width: p.w, height: p.w * 0.45, background: p.color, borderRadius: 2, transform: `rotate(${p.r}deg)`, animation: `${confFall} ${p.dur}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  );
}
ConfettiBurst.propTypes = { seed: PropTypes.number };

/* ========================= TOASTS (with undo) ============================= */
function ToastStack() {
  const { notifs } = useApp();
  const [shown, setShown] = useState([]);
  const seen = useRef(new Set());
  useEffect(() => {
    const fresh = notifs.filter((n) => !seen.current.has(n.id)).slice(0, 1);
    fresh.forEach((n) => { seen.current.add(n.id); setShown((s) => [...s, n]); setTimeout(() => setShown((s) => s.filter((x) => x.id !== n.id)), n.action ? 6500 : 4500); });
  }, [notifs]);
  if (!shown.length) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {shown.map((n) => (
        <div key={n.id} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${theme.coral}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, lineHeight: 1.5, boxShadow: '0 12px 30px rgba(0,0,0,.4)' }}>
          {n.text}
          {n.action && (
            <button type="button" onClick={() => { n.action.fn(); setShown((s) => s.filter((x) => x.id !== n.id)); }}
              style={{ display: 'block', marginTop: 6, background: 'none', border: 'none', color: theme.teal, fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: 12.5 }}>
              {n.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ========================= AUTH SCREENS =================================== */
const AuthShell = styled.div`min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(1100px 600px at 15% 10%, ${theme.coralDim}, transparent 60%), radial-gradient(900px 500px at 85% 90%, ${theme.tealDim}, transparent 60%), ${theme.bg};`;
const AuthCard = styled.div`width:460px;max-width:100%;background:${theme.panel};border:1px solid ${theme.border};border-radius:20px;padding:34px;box-shadow:0 20px 60px rgba(0,0,0,.45);`;
const FieldWrap = styled.div`margin-bottom:14px;`;
const StrengthBar = styled.div`display:flex;gap:4px;margin-top:6px;>div{flex:1;height:4px;border-radius:2px;background:${theme.border};transition:background .2s;}`;
const strengthColor = (s) => ['#e5697a', '#f0a83c', '#f0a83c', '#2fbfa8', '#4cb782', '#4cb782'][s];
const strengthLabel = (s) => ['A bit short', 'Getting there', 'Not bad', 'Looking good', 'Strong stuff', 'Fort Knox 🔐'][s];

function LoginScreen({ onSwitch, onForgot }) {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@safechat.dev');
  const [password, setPassword] = useState('Admin@123');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = (e) => { e.preventDefault(); setErr(null);
    if (!email.trim()) return setErr('We\'ll need your email or username to find you.');
    if (!password) return setErr('Pop your password in and we\'re good to go.');
    setLoading(true); setTimeout(() => { const r = login(email.trim(), password); setLoading(false); if (!r.ok) setErr(r.err); }, 500); };
  return (
    <AuthShell><AuthCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.coralDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.coral }}><Icon name="shield" size={22} /></div>
        <div><h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{greet()} 👋</h1>
          <p style={{ color: theme.textDim, margin: '2px 0 0', fontSize: 13 }}>Your team kept things moving — pick up where you left off.</p></div>
      </div>
      {err && <ErrorText role="alert"><Icon name="x" size={14} /><span>{err}</span></ErrorText>}
      <form onSubmit={submit}>
        <FieldWrap><Label>Email or username</Label><Field value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" /></FieldWrap>
        <FieldWrap><Label>Password</Label>
          <div style={{ position: 'relative' }}>
            <Field type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 46 }} autoComplete="current-password" />
            <InlineIconBtn type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((s) => !s)} style={{ position: 'absolute', right: 7, top: 6 }}><Icon name={showPw ? 'eyeOff' : 'eye'} size={16} /></InlineIconBtn>
          </div>
        </FieldWrap>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 18px', fontSize: 12.5 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', color: theme.textDim }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: theme.coral, width: 16, height: 16 }} /> Keep me logged in on this device
          </label>
          <button type="button" onClick={onForgot} style={{ background: 'none', border: 'none', color: theme.teal, cursor: 'pointer', fontWeight: 700, padding: 0 }}>Can't remember your password?</button>
        </div>
        <PrimaryBtn type="submit" disabled={loading}>{loading ? 'Opening the door…' : 'Log me in'}</PrimaryBtn>
      </form>
      <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: theme.textDim }}>
        New here? <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: theme.coral, cursor: 'pointer', fontWeight: 800 }}>Join the workspace</button>
      </div>
      <div style={{ marginTop: 20, padding: 12, background: theme.panel2, borderRadius: 12, fontSize: 12, color: theme.textFaint, lineHeight: 1.7 }}>
        Just looking around? Use the demo keys:<br />
        <code style={{ color: theme.teal }}>admin@safechat.dev</code> · <code style={{ color: theme.teal }}>Admin@123</code>{' '}
        <button type="button" onClick={() => { setEmail('admin@safechat.dev'); setPassword('Admin@123'); }} style={{ background: 'none', border: 'none', color: theme.coral, cursor: 'pointer', fontWeight: 700, padding: 0 }}>Fill them for me</button>
      </div>
    </AuthCard></AuthShell>
  );
}
LoginScreen.propTypes = { onSwitch: PropTypes.func.isRequired, onForgot: PropTypes.func.isRequired };

function ForgotScreen({ onBack }) {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [err, setErr] = useState(null);
  const submit = (e) => { e.preventDefault(); setErr(null); if (!emailOk(email)) return setErr('That doesn\'t look like an email yet — mind checking?'); setSent(true); };
  return (
    <AuthShell><AuthCard>
      <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, padding: 0 }}><Icon name="chevronDown" size={14} style={{ transform: 'rotate(90deg)' }} /> Back to login</button>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>It happens to the best of us</h1>
      <p style={{ color: theme.textDim, margin: '0 0 20px', fontSize: 13.5 }}>Tell us your email and we'll send a reset link — good for 24 hours.</p>
      {err && <ErrorText role="alert"><Icon name="x" size={14} /><span>{err}</span></ErrorText>}
      {sent ? (
        <div style={{ padding: 16, background: theme.tealDim, borderRadius: 12, color: theme.teal, fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800, marginBottom: 6 }}><Icon name="mail" size={16} /> On its way!</div>
          Check <b>{email}</b> in a minute or two. No luck? Peek in spam — we sometimes hide there.
        </div>
      ) : (
        <form onSubmit={submit}><FieldWrap><Label>Your email</Label><Field value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus /></FieldWrap>
          <PrimaryBtn type="submit">Send my reset link</PrimaryBtn></form>
      )}
    </AuthCard></AuthShell>
  );
}
ForgotScreen.propTypes = { onBack: PropTypes.func.isRequired };

function RegisterScreen({ onSwitch }) {
  const { register, verifyEmail, pendingVerify } = useApp();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', tos: false });
  const [err, setErr] = useState(null); const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(''); const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const score = pwdScore(form.password);
  const mismatch = form.password && form.confirm && form.password !== form.confirm;
  const submit = (e) => { e.preventDefault(); setErr(null);
    if (form.username.length < 3) return setErr('Usernames need at least 3 characters — try a longer one.');
    if (!emailOk(form.email)) return setErr('That email looks a little off — mind double-checking?');
    if (score < 3) return setErr('Add an uppercase letter, a number or a symbol to make the password sturdier.');
    if (mismatch) return setErr('Those two passwords don\'t quite match yet.');
    if (!form.tos) return setErr('Give the house rules a quick read and tick the box when you\'re happy.');
    setLoading(true); setTimeout(() => { const r = register(form); setLoading(false); if (!r.ok) setErr(r.err); }, 500); };
  const verify = (e) => { e.preventDefault(); setErr(null); const r = verifyEmail(code.trim()); if (!r.ok) setErr(r.err); };

  if (pendingVerify) return (
    <AuthShell><AuthCard>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>One last step ✉️</h1>
      <p style={{ color: theme.textDim, margin: '0 0 18px', fontSize: 13.5 }}>We sent a 6-digit code to <b style={{ color: theme.text }}>{pendingVerify.email}</b>.</p>
      {err && <ErrorText role="alert"><Icon name="x" size={14} /><span>{err}</span></ErrorText>}
      <div style={{ padding: 12, background: theme.amberBg, borderRadius: 10, color: theme.amber, fontSize: 12.5, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Icon name="spark" size={15} /> Demo mode — your code is <b style={{ letterSpacing: '.12em', fontSize: 14 }}>{pendingVerify.code}</b>
      </div>
      <form onSubmit={verify}><FieldWrap><Label>The 6-digit code</Label><Field value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" style={{ fontSize: 20, letterSpacing: '.3em', textAlign: 'center' }} autoFocus /></FieldWrap>
        <PrimaryBtn type="submit">That's my code — let me in</PrimaryBtn></form>
    </AuthCard></AuthShell>
  );

  return (
    <AuthShell><AuthCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.coralDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.coral }}><Icon name="spark" size={22} /></div>
        <div><h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Let's get you set up</h1>
          <p style={{ color: theme.textDim, margin: '2px 0 0', fontSize: 13 }}>Thirty seconds and you're in with the team.</p></div>
      </div>
      {err && <ErrorText role="alert"><Icon name="x" size={14} /><span>{err}</span></ErrorText>}
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldWrap><Label>Pick a username</Label><Field value={form.username} onChange={set('username')} placeholder="bexalin" /></FieldWrap>
          <FieldWrap><Label>Your email</Label><Field value={form.email} onChange={set('email')} placeholder="you@example.com" /></FieldWrap>
        </div>
        <FieldWrap><Label>Choose a password</Label>
          <div style={{ position: 'relative' }}>
            <Field type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="8+ characters" style={{ paddingRight: 46 }} />
            <InlineIconBtn type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((s) => !s)} style={{ position: 'absolute', right: 7, top: 6 }}><Icon name={showPw ? 'eyeOff' : 'eye'} size={16} /></InlineIconBtn>
          </div>
          <StrengthBar>{[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ background: i <= score ? strengthColor(score) : theme.border }} />)}</StrengthBar>
          <div style={{ fontSize: 11.5, marginTop: 4, color: strengthColor(score) }}>{form.password ? strengthLabel(score) : 'How strong is it?'}</div>
        </FieldWrap>
        <FieldWrap><Label>Type it once more</Label><Field type={showPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Same password again" style={{ borderColor: mismatch ? theme.danger : theme.border }} />
          {mismatch && <div style={{ fontSize: 11.5, color: theme.danger, marginTop: 4 }}>These don't match yet — no rush.</div>}</FieldWrap>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '6px 0 18px', fontSize: 12.5, color: theme.textDim, cursor: 'pointer', lineHeight: 1.5 }}>
          <input type="checkbox" checked={form.tos} onChange={(e) => setForm((f) => ({ ...f, tos: e.target.checked }))} style={{ accentColor: theme.coral, width: 16, height: 16, marginTop: 2 }} />
          <span>I'm okay with the house rules (Terms & Privacy).</span>
        </label>
        <PrimaryBtn type="submit" disabled={loading}>{loading ? 'Setting up your space…' : 'Join the workspace'}</PrimaryBtn>
      </form>
      <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: theme.textDim }}>
        Already part of the crew? <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: theme.coral, cursor: 'pointer', fontWeight: 800 }}>Log in</button>
      </div>
    </AuthCard></AuthShell>
  );
}
RegisterScreen.propTypes = { onSwitch: PropTypes.func.isRequired };

function AuthGate({ children }) {
  const { me } = useApp();
  const [view, setView] = useState('login');
  if (me) return children;
  if (view === 'register') return <RegisterScreen onSwitch={() => setView('login')} />;
  if (view === 'forgot') return <ForgotScreen onBack={() => setView('login')} />;
  return <LoginScreen onSwitch={() => setView('register')} onForgot={() => setView('forgot')} />;
}
AuthGate.propTypes = { children: PropTypes.node.isRequired };

/* ========================= SIDEBAR ======================================== */
const SidebarWrap = styled.aside`width:300px;flex-shrink:0;background:${theme.panel};border-right:1px solid ${theme.border};display:flex;flex-direction:column;height:100vh;`;
const IconBtn = styled.button`width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:transparent;color:${theme.textDim};position:relative;border:none;cursor:pointer;&:hover{background:${theme.raised};color:${theme.text};}`;

function Sidebar({ onCreateRoom, onOpenProfile, onOpenMembers, onOpenLogout }) {
  const { rooms, selectedRoomId, setSelectedRoomId, notifs, me } = useApp();
  const loaded = useLoaded();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => rooms.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())), [rooms, q]);
  return (
    <SidebarWrap>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: `1px solid ${theme.borderSoft}` }}>
        <button type="button" onClick={onOpenProfile} aria-label="Open your profile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Avatar user={me} size={40} /></button>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(me?.displayName || 'You').split(' ')[0]}</div>
          <Badge bg={theme.amberBg} fg={theme.amber}><Icon name="crown" size={10} /> Admin</Badge>
        </div>
        <IconBtn type="button" onClick={onOpenMembers} aria-label="Manage members"><Icon name="users" size={17} /></IconBtn>
        <IconBtn type="button" aria-label={`Notifications (${notifs.length})`}><Icon name="bell" size={17} />{notifs.length > 0 && <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: theme.coral }} />}</IconBtn>
        <IconBtn type="button" onClick={onOpenLogout} aria-label="Log out"><Icon name="logout" size={17} /></IconBtn>
      </div>
      <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 26, top: 22, color: theme.textFaint }}><Icon name="search" size={15} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a room…" aria-label="Search rooms"
          style={{ width: '100%', background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 10px 10px 34px', fontSize: 13, color: theme.text, outline: 'none' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px 6px' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: theme.textFaint }}>Your rooms</span>
        <IconBtn type="button" onClick={onCreateRoom} aria-label="Open a new room"><Icon name="plus" size={16} /></IconBtn>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '4px 8px 16px' }}>
        {!loaded && <><Skeleton h={52} /><Skeleton h={52} /><Skeleton h={52} /><div style={{ color: theme.textFaint, fontSize: 12, textAlign: 'center', padding: 6 }}>Getting your rooms ready…</div></>}
        {loaded && filtered.length === 0 && <div style={{ color: theme.textFaint, fontSize: 12.5, textAlign: 'center', padding: 20, lineHeight: 1.6 }}>No rooms with that name yet.<br />Try another, or start one yourself!</div>}
        {loaded && filtered.map((r) => {
          const last = r.messages[r.messages.length - 1];
          const preview = last?.taskCard ? `Task handed off: ${last.task.title}` : (last?.text || 'Say hi first 👋');
          const active = r.id === selectedRoomId;
          return (
            <button key={r.id} type="button" onClick={() => setSelectedRoomId(r.id)}
              style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center', padding: '10px 8px', borderRadius: 12, border: 'none', cursor: 'pointer', marginBottom: 2, background: active ? theme.raised : 'transparent', borderLeft: active ? `3px solid ${theme.coral}` : '3px solid transparent' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${r.iconColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.iconColor, flexShrink: 0 }}><Icon name={r.icon} size={17} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  {last?.ts && <span style={{ fontSize: 10, color: theme.textFaint, fontWeight: 500 }}>{timeStr(last.ts)}</span>}
                </div>
                <div style={{ fontSize: 12, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</div>
              </div>
            </button>
          );
        })}
      </div>
    </SidebarWrap>
  );
}
Sidebar.propTypes = { onCreateRoom: PropTypes.func, onOpenProfile: PropTypes.func, onOpenMembers: PropTypes.func, onOpenLogout: PropTypes.func };

/* ========================= CHAT PANE ====================================== */
const ChatWrap = styled.main`flex:1;display:flex;flex-direction:column;height:100vh;min-width:0;`;
const ActionBtn = styled.button`display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:8px 13px;min-height:38px;border-radius:10px;border:1px solid ${(p) => (p.solid ? 'transparent' : theme.border)};background:${(p) => (p.solid ? theme.coral : 'transparent')};color:${(p) => (p.solid ? '#2a1410' : theme.textDim)};cursor:pointer;&:hover{border-color:${theme.coral};color:${(p) => (p.solid ? '#2a1410' : theme.coral)};}`;

function TaskCardMessage({ msg }) {
  const { team } = useApp();
  const person = team.find((t) => t.id === msg.task.assignee);
  return (
    <div style={{ border: `1px solid ${theme.border}`, background: theme.panel2, borderRadius: 14, padding: 14, maxWidth: '100%', width: 'min(380px, 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: theme.amber, marginBottom: 6 }}><Icon name="file" size={13} /> TASK HANDED OFF</div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{msg.task.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textDim }}><span>In good hands:</span><Avatar user={person} size={20} /><span style={{ color: theme.text, fontWeight: 600 }}>{person?.name || 'Unassigned'}</span></div>
    </div>
  );
}
TaskCardMessage.propTypes = { msg: PropTypes.object.isRequired };

function ChatPane({ onAssignTask, onShareLink }) {
  const { rooms, selectedRoomId, sendMessage, addDocument } = useApp();
  const room = rooms.find((r) => r.id === selectedRoomId);
  const [text, setText] = useState('');
  const [upload, setUpload] = useState(null); // {name, state}
  const endRef = useRef(null); const fileRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [room?.messages.length]);

  const tryUpload = useCallback((name) => {
    setUpload({ name, state: 'sending' });
    setTimeout(() => {
      if (/fail/i.test(name) || Math.random() < 0.2) setUpload({ name, state: 'failed' });
      else { addDocument(room.id, name); setUpload(null); }
    }, 1200);
  }, [addDocument, room?.id]);

  if (!room) return <ChatWrap />;
  const submit = (e) => { e.preventDefault(); if (text.trim()) { sendMessage(room.id, text.trim()); setText(''); } };

  return (
    <ChatWrap>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${room.iconColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: room.iconColor, flexShrink: 0 }}><Icon name={room.icon} size={20} /></div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</div>
          <div style={{ fontSize: 12, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>{room.members.length} teammates <Dot /> here now</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 1, minWidth: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <ActionBtn type="button" onClick={onShareLink}><Icon name="link" size={13} /> Invite</ActionBtn>
          <ActionBtn type="button" onClick={onAssignTask}><Icon name="check" size={13} /> Hand off a task</ActionBtn>
          <ActionBtn type="button" onClick={() => fileRef.current.click()}><Icon name="clip" size={13} /> Share a file</ActionBtn>
          <input ref={fileRef} type="file" hidden aria-label="Share a file" onChange={(e) => { const f = e.target.files[0]; if (f) tryUpload(f.name); e.target.value = ''; }} />
        </div>
      </div>

      {upload && (
        <div style={{ padding: '10px 24px' }}>
          {upload.state === 'sending' ? (
            <div style={{ background: theme.panel2, color: theme.textDim, fontSize: 12.5, padding: '10px 14px', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="upload" size={14} /> Sending “{upload.name}”… almost there.
            </div>
          ) : (
            <div role="alert" style={{ background: theme.amberBg, border: `1px solid ${theme.amber}44`, color: theme.amber, fontSize: 12.5, padding: '12px 14px', borderRadius: 12, lineHeight: 1.6 }}>
              “{upload.name}” didn't make it up — the connection blinked. Nothing was lost; it's still right here.
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => tryUpload(upload.name)} style={{ background: theme.amber, color: '#241a08', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 800, cursor: 'pointer' }}>Try again</button>
                <button type="button" onClick={() => { setUpload(null); fileRef.current.click(); }} style={{ background: 'none', border: 'none', color: theme.amber, fontWeight: 700, cursor: 'pointer' }}>Pick a different file</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 16px' }}>
        {room.messages.map((m) => {
          if (m.system) return <div key={m.id} style={{ textAlign: 'center', margin: '14px 0' }}><span style={{ fontSize: 11.5, color: theme.textFaint, background: theme.panel2, padding: '5px 12px', borderRadius: 999 }}>{m.text}</span></div>;
          const isMe = m.from === 'me';
          return (
            <div key={m.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: isMe ? theme.coral : theme.teal }}>{isMe ? 'You' : 'Teammate'}</span>
                {isMe && <Icon name="crown" size={11} style={{ color: theme.amber }} />}
                {m.ts && <span style={{ fontSize: 11, color: theme.textFaint }}>{timeStr(m.ts)}</span>}
              </div>
              {m.taskCard ? <TaskCardMessage msg={m} /> : (
                <div style={{ display: 'inline-block', maxWidth: '100%', background: theme.panel2, border: `1px solid ${theme.borderSoft}`, borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: 14, lineHeight: 1.55 }}>
                  {m.text}{m.read && <span style={{ marginLeft: 8, color: theme.teal }}><Icon name="checkDouble" size={12} /></span>}
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 24px', borderTop: `1px solid ${theme.borderSoft}` }}>
        <InlineIconBtn type="button" aria-label="Attach a file" onClick={() => fileRef.current.click()}><Icon name="clip" size={17} /></InlineIconBtn>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write something kind or useful… (Enter to send)" aria-label="Message"
          style={{ flex: 1, background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 999, padding: '12px 18px', color: theme.text, outline: 'none', fontSize: 13.5 }} />
        <button type="submit" aria-label="Send message" style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: theme.coral, color: '#2a1410', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="send" size={16} /></button>
      </form>
      <div style={{ fontSize: 11, color: theme.textFaint, padding: '0 24px 12px', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="lock" size={11} /> Private by design — encrypted end-to-end</div>
    </ChatWrap>
  );
}
ChatPane.propTypes = { onAssignTask: PropTypes.func.isRequired, onShareLink: PropTypes.func.isRequired };

/* ========================= RIGHT PANEL ==================================== */
const RightWrap = styled.aside`width:380px;flex-shrink:0;background:${theme.panel};border-left:1px solid ${theme.border};height:100vh;display:flex;flex-direction:column;`;
const TabBtn = styled.button`flex:1;padding:14px 0;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;color:${(p) => (p.active ? theme.text : theme.textFaint)};border-bottom:2px solid ${(p) => (p.active ? theme.coral : 'transparent')};`;
const ProgressTrack = styled.div`height:5px;border-radius:999px;background:${theme.border};overflow:hidden;margin:10px 0;`;
const ProgressFill = styled.div`height:100%;width:${(p) => p.v}%;border-radius:999px;background:${(p) => p.color};transition:width .3s ease;`;

function TaskCard({ task }) {
  const { setTaskStatus, team } = useApp();
  const person = team.find((t) => t.id === task.assignee);
  const st = STATUS_STYLE[task.status];
  return (
    <div style={{ border: `1px solid ${theme.border}`, background: theme.panel2, borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{task.status === 'Completed' ? '✅ ' : ''}{task.title}</div>
        <Badge bg={st.bg} fg={st.fg}>{task.status}</Badge>
      </div>
      <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 6, lineHeight: 1.5 }}>{task.description}</div>
      <ProgressTrack><ProgressFill v={task.progress} color={st.fg} /></ProgressTrack>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar user={person} size={26} />
        <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>{person?.name || 'Unassigned'}</span>
        <Select aria-label={`Status for ${task.title}`} value={task.status} onChange={(e) => setTaskStatus(task.id, e.target.value)} style={{ padding: '7px 8px', fontSize: 12 }}>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
    </div>
  );
}
TaskCard.propTypes = { task: PropTypes.object.isRequired };

function RightPanel({ onAssignTask }) {
  const { tasks, docs, activity, selectedRoomId, team } = useApp();
  const loaded = useLoaded();
  const [tab, setTab] = useState('tasks');
  const roomTasks = tasks.filter((t) => t.roomId === selectedRoomId);
  const roomDocs = docs.filter((d) => d.roomId === selectedRoomId);
  const empty = (icon, text) => <div style={{ color: theme.textFaint, fontSize: 13, textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, lineHeight: 1.6 }}><Icon name={icon} size={22} />{text}</div>;
  return (
    <RightWrap>
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.borderSoft}` }}>
        <TabBtn type="button" active={tab === 'tasks'} onClick={() => setTab('tasks')}>Tasks</TabBtn>
        <TabBtn type="button" active={tab === 'docs'} onClick={() => setTab('docs')}>Files</TabBtn>
        <TabBtn type="button" active={tab === 'activity'} onClick={() => setTab('activity')}>Activity</TabBtn>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
        {!loaded && <><Skeleton h={90} /><Skeleton h={90} /><div style={{ color: theme.textFaint, fontSize: 12, textAlign: 'center' }}>Getting things ready…</div></>}
        {loaded && tab === 'tasks' && <>
          <button type="button" onClick={onAssignTask} style={{ width: '100%', padding: '12px 0', borderRadius: 12, marginBottom: 16, cursor: 'pointer', border: `1px dashed ${theme.coral}`, background: theme.coralDim, color: theme.coral, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 }}>
            <Icon name="plus" size={15} /> Hand off a task
          </button>
          {roomTasks.length === 0 && empty('check', "Nothing on the plate yet.\nHand off the first task and it'll show up here.")}
          {roomTasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </>}
        {loaded && tab === 'docs' && <>
          {roomDocs.length === 0 && empty('file', "No files yet — drop the first one\nand the whole team can build on it.")}
          {roomDocs.map((d) => {
            const person = team.find((t) => t.id === d.by);
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.borderSoft}` }}>
                <div style={{ color: TYPE_COLOR[d.type] }}><Icon name={TYPE_ICON[d.type]} size={22} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: theme.textFaint }}>{d.size} · {person?.name.split(' ')[0] || 'You'} · {timeAgo(d.at)}</div>
                </div>
              </div>
            );
          })}
        </>}
        {loaded && tab === 'activity' && <>
          {activity.length === 0 && empty('activity', 'Quiet in here so far —\nthe team\'s moves will appear here.')}
          {activity.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.borderSoft}` }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.coral, flexShrink: 0 }}><Icon name={a.icon || 'activity'} size={13} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, lineHeight: 1.5 }}>{a.text}</div><div style={{ fontSize: 11, color: theme.textFaint, marginTop: 3 }}>{timeAgo(a.ts)}</div></div>
            </div>
          ))}
        </>}
      </div>
    </RightWrap>
  );
}
RightPanel.propTypes = { onAssignTask: PropTypes.func.isRequired };

/* ========================= MODALS ========================================= */
const Overlay = styled.div`position:fixed;inset:0;background:rgba(10,8,6,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:150;padding:20px;`;
const ModalBox = styled.div`width:540px;max-width:100%;background:${theme.panel};border:1px solid ${theme.border};border-radius:18px;padding:24px;max-height:86vh;overflow-y:auto;`;
function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
      <div><div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>{subtitle && <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 3 }}>{subtitle}</div>}</div>
      <InlineIconBtn type="button" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></InlineIconBtn>
    </div>
  );
}
ModalHeader.propTypes = { title: PropTypes.string.isRequired, subtitle: PropTypes.string, onClose: PropTypes.func.isRequired };

function CreateRoomModal({ onClose }) {
  const { createRoom, team } = useApp();
  const [name, setName] = useState(''); const [sel, setSel] = useState([]);
  const toggle = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  return (
    <Overlay onClick={onClose}><ModalBox onClick={(e) => e.stopPropagation()}>
      <ModalHeader title="Open a new room" subtitle="Private by default — only people you invite can peek in." onClose={onClose} />
      <FieldWrap><Label>What should we call it?</Label><Field value={name} onChange={(e) => setName(e.target.value)} placeholder="QA & Release, Design Club…" autoFocus /></FieldWrap>
      <Label style={{ marginBottom: 8 }}>Who's in?</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {team.map((u) => <Chip key={u.id} type="button" active={sel.includes(u.id)} onClick={() => toggle(u.id)}>{u.name}</Chip>)}
      </div>
      <PrimaryBtn type="button" disabled={!name.trim()} onClick={() => { if (name.trim()) { createRoom(name.trim(), sel); onClose(); } }}>Open the room</PrimaryBtn>
    </ModalBox></Overlay>
  );
}
CreateRoomModal.propTypes = { onClose: PropTypes.func.isRequired };

function AssignTaskModal({ roomId, onClose }) {
  const { assignTask, team } = useApp();
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [assignee, setAssignee] = useState(team[0]?.id);
  return (
    <Overlay onClick={onClose}><ModalBox onClick={(e) => e.stopPropagation()}>
      <ModalHeader title="Hand off a task" subtitle="We'll let them know gently — no pressure, just clarity." onClose={onClose} />
      <FieldWrap><Label>What needs doing?</Label><Field value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fix the login redirect" autoFocus /></FieldWrap>
      <FieldWrap><Label>A little context (optional)</Label><TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A sentence or two helps a lot…" /></FieldWrap>
      <Label style={{ marginBottom: 8 }}>Who's it going to?</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {team.map((u) => <Chip key={u.id} type="button" active={assignee === u.id} onClick={() => setAssignee(u.id)}>{u.name}</Chip>)}
      </div>
      <PrimaryBtn type="button" disabled={!title.trim()} onClick={() => { if (title.trim()) { assignTask(roomId, { title: title.trim(), description: description.trim() || 'No extra notes — ask me anything!', assignee }); onClose(); } }}>Hand it off</PrimaryBtn>
    </ModalBox></Overlay>
  );
}
AssignTaskModal.propTypes = { roomId: PropTypes.string, onClose: PropTypes.func.isRequired };

function ShareLinkModal({ onClose }) {
  const { selectedRoomId, inviteLinks, createInviteLink, revokeInvite, regenInvite } = useApp();
  const [tab, setTab] = useState('create');
  const [form, setForm] = useState({ expiry: '7d', maxUses: 10, role: 'Member' });
  const [err, setErr] = useState(null); const [copied, setCopied] = useState(null);
  const roomLinks = inviteLinks.filter((l) => l.room === selectedRoomId);
  const create = () => { setErr(null); const r = createInviteLink(selectedRoomId, form); if (!r.ok) setErr(r.err); else setTab('manage'); };
  const copy = (code) => { navigator.clipboard?.writeText(`https://safechat.dev/invite/${code}`); setCopied(code); setTimeout(() => setCopied(null), 1600); };
  return (
    <Overlay onClick={onClose}><ModalBox onClick={(e) => e.stopPropagation()}>
      <ModalHeader title="Invite by link" subtitle="Make a link, set the rules, share it with a smile." onClose={onClose} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <Chip active={tab === 'create'} onClick={() => setTab('create')}>Make a link</Chip>
        <Chip active={tab === 'manage'} onClick={() => setTab('manage')}>Your links ({roomLinks.length})</Chip>
      </div>
      {tab === 'create' && <>
        {err && <ErrorText role="alert"><Icon name="x" size={14} /><span>{err}</span></ErrorText>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldWrap><Label>How long should it live?</Label><Select value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}><option value="24h">A day (24h)</option><option value="7d">A week</option><option value="30d">A month</option></Select></FieldWrap>
          <FieldWrap><Label>How many people can use it?</Label><Select value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: +e.target.value })}><option value={1}>Just one</option><option value={5}>Five</option><option value={10}>Ten</option><option value={25}>Twenty-five</option><option value={0}>As many as needed</option></Select></FieldWrap>
        </div>
        <FieldWrap><Label>What can new joiners do?</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{['Member', 'Moderator', 'Admin'].map((r) => <Chip key={r} active={form.role === r} onClick={() => setForm({ ...form, role: r })}>{r}</Chip>)}</div>
        </FieldWrap>
        <div style={{ fontSize: 12, color: theme.textFaint, padding: 10, background: theme.panel2, borderRadius: 10, marginBottom: 14, lineHeight: 1.6 }}>To keep things tidy, you can make up to 5 links a minute. Every link is logged so you always know who came in how.</div>
        <PrimaryBtn type="button" onClick={create}>Make my link</PrimaryBtn>
      </>}
      {tab === 'manage' && <>
        {roomLinks.length === 0 && <div style={{ color: theme.textFaint, fontSize: 13, textAlign: 'center', padding: '30px 0', lineHeight: 1.6 }}>No links yet — make one and start welcoming people.</div>}
        {roomLinks.map((l) => {
          const expired = l.expiresAt < Date.now();
          const full = l.maxUses && l.uses >= l.maxUses;
          const usable = l.active && !expired && !full;
          return (
            <div key={l.id} style={{ border: `1px solid ${theme.border}`, background: theme.panel2, borderRadius: 14, padding: 14, marginBottom: 10, opacity: usable ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 13.5, fontWeight: 800, letterSpacing: '.05em' }}>safechat.dev/invite/{l.code}</div>
                <Badge bg={usable ? theme.greenBg : expired ? theme.dangerBg : theme.grayBg} fg={usable ? theme.green : expired ? theme.danger : theme.gray}>{usable ? 'Working' : expired ? 'Expired' : full ? 'All used up' : 'Turned off'}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: theme.textDim, marginBottom: 10 }}>
                <span><Icon name="clock" size={11} style={{ verticalAlign: -1 }} /> {expired ? 'expired' : `lives ${timeAgo(l.expiresAt).replace(' ago', '')} more`}</span>
                <span><Icon name="users" size={11} style={{ verticalAlign: -1 }} /> {l.uses}{l.maxUses ? ` of ${l.maxUses}` : ''} used</span>
                <span><Icon name="crown" size={11} style={{ verticalAlign: -1 }} /> joins as {l.role}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {usable && <GhostBtn type="button" onClick={() => copy(l.code)}>{copied === l.code ? 'Copied! 💛' : 'Copy link'}</GhostBtn>}
                {l.active && <GhostBtn type="button" onClick={() => regenInvite(l.id)}>Make a new one</GhostBtn>}
                {l.active && <DangerBtn type="button" onClick={() => revokeInvite(l.id)}>Turn off</DangerBtn>}
              </div>
            </div>
          );
        })}
      </>}
    </ModalBox></Overlay>
  );
}
ShareLinkModal.propTypes = { onClose: PropTypes.func.isRequired };

function MembersModal({ onClose }) {
  const { team, pending, changeRole, removeMember, muteMember, banMember, approvePending, rejectPending, inviteByEmail, importCsv, selectedRoomId } = useApp();
  const [tab, setTab] = useState('members');
  const [inviteMode, setInviteMode] = useState(null);
  const [emails, setEmails] = useState(''); const [csvText, setCsvText] = useState(''); const [inviteRole, setInviteRole] = useState('Member');
  const [err, setErr] = useState(null); const [ok, setOk] = useState(null);
  const fileRef = useRef(null);
  const submitEmail = () => { setErr(null); setOk(null); const r = inviteByEmail(selectedRoomId, emails.split(/[\s,;]+/).filter(Boolean), inviteRole); if (r.ok) { setOk(`Invites sent to ${r.count} ${r.count > 1 ? 'people' : 'person'}!`); setEmails(''); setInviteMode(null); } else setErr(r.err); };
  const submitCsv = () => { setErr(null); setOk(null); const r = importCsv(csvText, inviteRole); if (r.ok) { setOk(`${r.count} contacts imported — nice.`); setCsvText(''); setInviteMode(null); } };
  const onFile = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { setCsvText(r.result); setInviteMode('csv'); }; r.readAsText(f); };
  return (
    <Overlay onClick={onClose}><ModalBox onClick={(e) => e.stopPropagation()} style={{ width: 640 }}>
      <ModalHeader title="Your people" subtitle="Welcome new faces, tweak roles, keep things kind." onClose={onClose} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip active={tab === 'members'} onClick={() => setTab('members')}>Everyone ({team.length})</Chip>
        <Chip active={tab === 'pending'} onClick={() => setTab('pending')}>Waiting to join ({pending.length})</Chip>
        <Chip active={tab === 'invite'} onClick={() => setTab('invite')}>Invite people</Chip>
      </div>
      {err && <ErrorText role="alert"><Icon name="x" size={14} /><span>{err}</span></ErrorText>}
      {ok && <div role="status" style={{ background: theme.greenBg, border: `1px solid ${theme.green}44`, color: theme.green, padding: '10px 12px', borderRadius: 10, fontSize: 12.5, marginBottom: 12, display: 'flex', gap: 8 }}><Icon name="check" size={14} /><span>{ok}</span></div>}
      {tab === 'members' && <>
        {team.length === 0 && <div style={{ color: theme.textFaint, fontSize: 13, textAlign: 'center', padding: 30 }}>It's just you right now — invite a few friends!</div>}
        {team.map((m) => {
          const rs = ROLE_STYLE[m.role];
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${theme.borderSoft}`, flexWrap: 'wrap' }}>
              <Avatar user={m} size={38} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{m.name}</span>
                  <Badge bg={rs.bg} fg={rs.fg}><Icon name={rs.icon} size={9} /> {m.role}</Badge>
                  {m.muted && <Badge bg={theme.dangerBg} fg={theme.danger}><Icon name="mute" size={9} /> On quiet</Badge>}
                </div>
                <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>{m.email} · joined {timeAgo(m.joinedAt)}</div>
              </div>
              <Select aria-label={`Role for ${m.name}`} value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} style={{ padding: '7px 8px', fontSize: 12 }}>
                {Object.keys(ROLE_STYLE).map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
              <InlineIconBtn type="button" aria-label={m.muted ? `Unquiet ${m.name}` : `Quiet ${m.name}`} onClick={() => muteMember(m.id, !m.muted)}><Icon name={m.muted ? 'bell' : 'mute'} size={14} /></InlineIconBtn>
              <InlineIconBtn type="button" aria-label={`Remove ${m.name}`} onClick={() => removeMember(m.id)}><Icon name="trash" size={14} /></InlineIconBtn>
              <InlineIconBtn type="button" aria-label={`Block ${m.name}`} onClick={() => banMember(m.id)} style={{ color: theme.danger }}><Icon name="ban" size={14} /></InlineIconBtn>
            </div>
          );
        })}
      </>}
      {tab === 'pending' && <>
        {pending.length === 0 && <div style={{ color: theme.textFaint, fontSize: 13, textAlign: 'center', padding: 30, lineHeight: 1.6 }}>Nobody's waiting right now.<br />New requests will pop up here.</div>}
        {pending.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${theme.borderSoft}`, flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: theme.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim }}><Icon name="user" size={16} /></div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>{p.email} · came via {p.via} · {timeAgo(p.requestedAt)}</div>
            </div>
            <GhostBtn type="button" onClick={() => rejectPending(p.id)}>Not this time</GhostBtn>
            <PrimaryBtn type="button" style={{ width: 'auto', padding: '9px 18px', minHeight: 40 }} onClick={() => approvePending(p.id)}>Welcome them</PrimaryBtn>
          </div>
        ))}
      </>}
      {tab === 'invite' && <>
        {!inviteMode && <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 12 }}>
            <button type="button" onClick={() => setInviteMode('email')} style={{ padding: 16, background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
              <Icon name="mail" size={20} style={{ color: theme.teal, marginBottom: 6 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: theme.text }}>Email invite</div>
              <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 2 }}>Type a few addresses</div>
            </button>
            <button type="button" onClick={() => setInviteMode('csv')} style={{ padding: 16, background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
              <Icon name="upload" size={20} style={{ color: theme.amber, marginBottom: 6 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: theme.text }}>Paste a list</div>
              <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 2 }}>name, email per line</div>
            </button>
            <button type="button" onClick={() => fileRef.current.click()} style={{ padding: 16, background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
              <Icon name="file" size={20} style={{ color: theme.coral, marginBottom: 6 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: theme.text }}>Upload contacts</div>
              <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 2 }}>.csv or .txt file</div>
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.txt" hidden onChange={onFile} />
          <FieldWrap><Label>They'll join as</Label>
            <div style={{ display: 'flex', gap: 6 }}>{['Member', 'Moderator', 'Admin'].map((r) => <Chip key={r} active={inviteRole === r} onClick={() => setInviteRole(r)}>{r}</Chip>)}</div>
          </FieldWrap>
          <div style={{ fontSize: 12, color: theme.textFaint, padding: 10, background: theme.panel2, borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.6 }}>
            <Icon name="clock" size={13} style={{ flexShrink: 0, marginTop: 2 }} /> To keep things friendly, invites are limited to 5 a minute.
          </div>
        </>}
        {inviteMode === 'email' && <>
          <button type="button" onClick={() => setInviteMode(null)} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', marginBottom: 10, fontSize: 12.5, padding: 0 }}>← Go back</button>
          <FieldWrap><Label>Email addresses (separate with commas or spaces)</Label><TextArea value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="alice@example.com, bob@example.com" /></FieldWrap>
          <div style={{ display: 'flex', gap: 8 }}><GhostBtn type="button" onClick={() => setInviteMode(null)}>Never mind</GhostBtn><PrimaryBtn type="button" onClick={submitEmail}>Send the invites</PrimaryBtn></div>
        </>}
        {inviteMode === 'csv' && <>
          <button type="button" onClick={() => setInviteMode(null)} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', marginBottom: 10, fontSize: 12.5, padding: 0 }}>← Go back</button>
          <FieldWrap><Label>Paste your list — one "name, email" per line</Label><TextArea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={'Alice Johnson, alice@example.com\nBob Smith, bob@example.com'} style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 12 }} /></FieldWrap>
          <div style={{ display: 'flex', gap: 8 }}><GhostBtn type="button" onClick={() => setInviteMode(null)}>Never mind</GhostBtn><PrimaryBtn type="button" onClick={submitCsv}>Invite them all</PrimaryBtn></div>
        </>}
      </>}
    </ModalBox></Overlay>
  );
}
MembersModal.propTypes = { onClose: PropTypes.func.isRequired };

function ProfileModal({ onClose }) {
  const { me, tasks, docs, rooms, activity, updateProfile, logout } = useApp();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ displayName: me.displayName, bio: me.bio, contact: me.contact, privacy: me.privacy });
  const [crop, setCrop] = useState(1.2); const [hue, setHue] = useState(0);
  const imgRef = useRef(null);
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const onFile = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => updateProfile({ avatarDataUrl: r.result }); r.readAsDataURL(f); };
  return (
    <Overlay onClick={onClose}><ModalBox onClick={(e) => e.stopPropagation()} style={{ width: 580 }}>
      <ModalHeader title="Your space" subtitle="How the team sees you — make it feel like you." onClose={onClose} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <Chip active={tab === 'profile'} onClick={() => setTab('profile')}>Profile</Chip>
        <Chip active={tab === 'security'} onClick={() => setTab('security')}>Privacy & security</Chip>
        <Chip active={tab === 'activity'} onClick={() => setTab('activity')}>Your recent activity</Chip>
      </div>
      {tab === 'profile' && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: theme.panel2, borderRadius: 16, marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', background: me.avatarDataUrl ? '#000' : (me.avatarColor || theme.gray), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 30, filter: `hue-rotate(${hue}deg)` }}>
              {me.avatarDataUrl ? <img src={me.avatarDataUrl} alt="Your profile" style={{ width: `${crop * 100}%`, height: `${crop * 100}%`, objectFit: 'cover', objectPosition: 'center' }} /> : initials(me.displayName || '?')}
            </div>
            <button type="button" aria-label="Upload a profile photo" onClick={() => imgRef.current.click()} style={{ position: 'absolute', bottom: -2, right: -2, background: theme.coral, border: `2px solid ${theme.panel}`, borderRadius: '50%', width: 32, height: 32, color: '#2a1410', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={13} /></button>
            <input ref={imgRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{me.displayName}</div>
            <Badge bg={theme.amberBg} fg={theme.amber} style={{ marginTop: 4, display: 'inline-block' }}>Admin</Badge>
            <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 4 }}>Here since {timeAgo(me.joinedAt)}</div>
          </div>
        </div>
        {me.avatarDataUrl && (
          <div style={{ padding: 12, background: theme.panel2, borderRadius: 12, marginBottom: 14 }}>
            <Label>Zoom your photo (round crop)</Label>
            <input type="range" min="1" max="2.5" step="0.05" value={crop} onChange={(e) => setCrop(+e.target.value)} style={{ width: '100%' }} aria-label="Crop zoom" />
            <Label style={{ marginTop: 8 }}>Tint</Label>
            <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(+e.target.value)} style={{ width: '100%' }} aria-label="Photo tint" />
          </div>
        )}
        <FieldWrap><Label>Display name</Label><Field value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></FieldWrap>
        <FieldWrap><Label>A few words about you</Label><TextArea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What do you love making?" /></FieldWrap>
        <FieldWrap><Label>How can teammates reach you?</Label><Field value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone or another email" /></FieldWrap>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[['Tasks finished', completed], ['Files shared', docs.length], ['Rooms', rooms.length]].map(([label, val]) => (
            <div key={label} style={{ background: theme.panel2, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: theme.coral }}>{val}</div>
              <div style={{ fontSize: 10.5, color: theme.textFaint, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <PrimaryBtn type="button" onClick={() => { updateProfile(form); onClose(); }}>Save my profile</PrimaryBtn>
      </>}
      {tab === 'security' && <>
        <FieldWrap><Label>Who can see your profile?</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{[['public', 'Everyone'], ['friends', 'Team only'], ['private', 'Just me']].map(([k, l]) => <Chip key={k} active={form.privacy === k} onClick={() => setForm({ ...form, privacy: k })}>{l}</Chip>)}</div>
        </FieldWrap>
        <div style={{ padding: 14, background: theme.panel2, borderRadius: 14, marginTop: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="shield2" size={15} style={{ color: theme.teal }} /> Keeping you safe</div>
          {[['Two-factor authentication', 'On — nice choice', theme.green], ['New-device alerts', 'On', theme.green], ['Password last changed', '3 days ago', theme.amber], ['Signed-in devices', '2', theme.blue]].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.borderSoft}` }}>
              <span style={{ fontSize: 12.5 }}>{label}</span><span style={{ fontSize: 11.5, fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <GhostBtn type="button">Change my password</GhostBtn>
          <DangerBtn type="button" onClick={() => { logout(); onClose(); }}>Log out everywhere</DangerBtn>
        </div>
      </>}
      {tab === 'activity' && <>
        {activity.length === 0 && <div style={{ color: theme.textFaint, fontSize: 13, textAlign: 'center', padding: 30 }}>Nothing yet — your story starts now.</div>}
        {activity.slice(0, 8).map((a) => (
          <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.borderSoft}` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.coral, flexShrink: 0 }}><Icon name={a.icon || 'activity'} size={13} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, lineHeight: 1.5 }}>{a.text}</div><div style={{ fontSize: 11, color: theme.textFaint, marginTop: 3 }}>{timeAgo(a.ts)}</div></div>
          </div>
        ))}
      </>}
    </ModalBox></Overlay>
  );
}
ProfileModal.propTypes = { onClose: PropTypes.func.isRequired };

function LogoutConfirm({ onClose }) {
  const { logout } = useApp();
  return (
    <Overlay onClick={onClose}><ModalBox onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
      <ModalHeader title="Leaving so soon?" subtitle="You'll need to log in again to see your rooms." onClose={onClose} />
      <div style={{ display: 'flex', gap: 8 }}>
        <GhostBtn type="button" onClick={onClose} style={{ flex: 1 }}>Stay a bit longer</GhostBtn>
        <DangerBtn type="button" onClick={() => { logout(); onClose(); }} style={{ flex: 1 }}>Log out</DangerBtn>
      </div>
    </ModalBox></Overlay>
  );
}
LogoutConfirm.propTypes = { onClose: PropTypes.func.isRequired };

/* ========================= ERROR BOUNDARY ================================= */
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 60, textAlign: 'center', color: theme.textDim }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: theme.text }}>Well, this is awkward 🙈</div>
        <div style={{ fontSize: 13, margin: '8px 0 16px' }}>Something broke on our end — not your fault at all.</div>
        <button type="button" onClick={() => this.setState({ err: null })} style={{ padding: '10px 20px', borderRadius: 999, background: theme.coral, color: '#2a1410', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Let's try that again</button>
      </div>
    );
    return this.props.children;
  }
}
ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

/* ========================= SHELL ========================================== */
const Layout = styled.div`display:flex;height:100vh;overflow:hidden;`;
function AuthenticatedShell() {
  
  const { selectedRoomId, celebration } = useApp();
  const [modal, setModal] = useState(null);
  return (
    <Layout>
      <Sidebar onCreateRoom={() => setModal('room')} onOpenProfile={() => setModal('profile')} onOpenMembers={() => setModal('members')} onOpenLogout={() => setModal('logout')} />
      <ErrorBoundary><ChatPane onAssignTask={() => setModal('task')} onShareLink={() => setModal('share')} /></ErrorBoundary>
      <RightPanel onAssignTask={() => setModal('task')} />
      <ToastStack />
      <ConfettiBurst seed={celebration} />
      {modal === 'room' && <CreateRoomModal onClose={() => setModal(null)} />}
      {modal === 'task' && <AssignTaskModal roomId={selectedRoomId} onClose={() => setModal(null)} />}
      {modal === 'share' && <ShareLinkModal onClose={() => setModal(null)} />}
      {modal === 'members' && <MembersModal onClose={() => setModal(null)} />}
      {modal === 'profile' && <ProfileModal onClose={() => setModal(null)} />}
      {modal === 'logout' && <LogoutConfirm onClose={() => setModal(null)} />}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppProvider><AuthGate><AuthenticatedShell /></AuthGate></AppProvider>
    </ThemeProvider>
  );
}