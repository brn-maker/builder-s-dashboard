// store.js — localStorage wrapper with date-keyed daily data

const STORE_KEY = 'builders_dashboard';

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function getDefaultData() {
    return {
        priorities: [],
        projects: [],
        streak: { count: 0, lastShipped: null, history: [] },
        shipLog: {},      // date-keyed: { "2026-06-08": [{text, time}] }
        ideas: [],
        timer: { sessions: 0, lastDate: null },
        stats: {}
    };
}

function load() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return getDefaultData();
        return JSON.parse(raw);
    } catch {
        return getDefaultData();
    }
}

function save(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function get(key) {
    const data = load();
    return data[key];
}

export function set(key, value) {
    const data = load();
    data[key] = value;
    save(data);
}

export function update(key, updater) {
    const data = load();
    data[key] = updater(data[key] ?? getDefaultData()[key]);
    save(data);
    return data[key];
}

export function getTodayLog() {
    const data = load();
    const today = getToday();
    return data.shipLog[today] || [];
}

export function addTodayLog(entry) {
    const data = load();
    const today = getToday();
    if (!data.shipLog[today]) data.shipLog[today] = [];
    data.shipLog[today].push(entry);
    save(data);
    return data.shipLog[today];
}

export function removeTodayLog(index) {
    const data = load();
    const today = getToday();
    if (data.shipLog[today]) {
        data.shipLog[today].splice(index, 1);
        save(data);
    }
    return data.shipLog[today] || [];
}

export function getAll() {
    return load();
}

export { getToday };
