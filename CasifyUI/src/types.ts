export interface Case {
  id: string;
  caseNumber: number;
  title: string;
  description?: string;
  difficulty: string;
  reportIds: string[];
  isActive: boolean;
  canBePractice: boolean;
}

export interface Report {
  id: string;
  personId: string;
  details: string;
  reportDate: string; 
}

export interface SuspectProfile {
  id: string;
  firstName: string;
  lastName: string;
  aliases: string[];
  height?: string;
  weight?: string;
  age?: string;
  sex?: string;
  occupation?: string;
  isGuilty: boolean;
} 