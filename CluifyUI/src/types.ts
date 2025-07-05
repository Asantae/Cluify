export interface Case {
  id: string;
  caseNumber: number;
  title: string;
  victimName?: string[];
  dateOfIncident?: string; // Storing as string to match JSON, will be parsed to Date
  location?: string;
  details: string;
  objective: string;
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
  suspect?: SuspectProfile;
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
  hairColor: string;
  eyeColor: string;
}

export interface DmvRecord {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  height: string;
  weight: number;
  licenseNumber: string;
  eyeColor: string;
  hairColor: string;
  dateOfBirth: string;
} 