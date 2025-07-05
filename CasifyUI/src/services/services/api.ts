import { Case, Report } from '../types';

const API_BASE_URL = 'http://localhost:5000/api'; // Make sure this matches your .NET backend port

export async function getActiveCase(): Promise<Case> {
  const response = await fetch(`${API_BASE_URL}/cases/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch active case');
  }
  return response.json();
}

export async function getReportsForCase(caseId: string): Promise<Report[]> {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/reports`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reports for case ${caseId}`);
  }
  return response.json();
}

export async function getPracticeCases(): Promise<Case[]> {
    const response = await fetch(`${API_BASE_URL}/cases/practice`);
    if (!response.ok) {
        throw new Error('Failed to fetch practice cases');
    }
    return response.json();
} 