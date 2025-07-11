import { Case, Report, DmvRecord } from '../types';

// Environment variable is injected at build time by Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required');
}

export async function getActiveCase(): Promise<Case | null> {
    const response = await fetch(`${API_BASE_URL}/cases/active`);
    if (!response.ok) {
        throw new Error('Failed to fetch active case');
    }
    const result = await response.json();
    if (result.caseData === null) return null;
    return result.caseData;
}

export const getPracticeCases = async () => {
    const response = await fetch(`${API_BASE_URL}/cases/practice`);
    if (!response.ok) {
        throw new Error('Failed to fetch practice cases');
    }
    return response.json();
};

export const getCaseById = async (caseId: string) => {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch case details');
    }
    return response.json();
};

export async function getReportsForCase(caseId: string): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/reports`);
    if (!response.ok) {
        throw new Error(`Failed to fetch reports for case ${caseId}`);
    }
    return response.json();
}

export async function searchDmvRecords(query: any): Promise<DmvRecord[]> {
    const response = await fetch(`${API_BASE_URL}/dmv/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    });

    if (!response.ok) {
        throw new Error('Failed to search DMV records');
    }

    return response.json();
} 

export async function submitReport(userId: string, reportId: string, dmvRecordId: string, caseId: string, evidenceIds: string[]) {
    const response = await fetch(`${API_BASE_URL}/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reportId, dmvRecordId, caseId, evidenceIds })
    });
    // Always return the parsed JSON, regardless of status
    return response.json();
} 

export async function getCaseProgress(userId: string, caseId: string) {
    const response = await fetch(`${API_BASE_URL}/caseprogress?userId=${userId}&caseId=${caseId}`);
    if (!response.ok) return null;
    return response.json();
}

export async function incrementCaseAttempt(userId: string, caseId: string) {
    const response = await fetch(`${API_BASE_URL}/caseprogress/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, caseId })
    });
    if (!response.ok) throw new Error('Failed to increment attempt');
    return response.json();
}

export async function setCaseWin(userId: string, caseId: string) {
    const response = await fetch(`${API_BASE_URL}/caseprogress/win`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, caseId })
    });
    if (!response.ok) throw new Error('Failed to set win');
    return response.json();
}

// User registration
export async function registerUser(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Registration failed');
    }
    return response.json();
}

// User login
export async function loginUser(usernameOrEmail: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Login failed');
    }
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
    return data;
}

export function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Utility to check if user is logged in (has a JWT token)
export function isLoggedIn() {
    const token = localStorage.getItem('token');
    // Optionally, add more validation (e.g., check expiration)
    return !!token;
} 