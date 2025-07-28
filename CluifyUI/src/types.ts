export interface Case {
  Id: string;
  CaseNumber: number;
  Title: string;
  VictimName?: string[];
  DateOfIncident?: string; // Storing as string to match JSON, will be parsed to Date
  Location?: string;
  Details: string;
  Objective: string;
  Difficulty: string;
  ReportIds: string[];
  IsActive: boolean;
  CanBePractice: boolean;
}

export interface Report {
  Id: string;
  SuspectProfileId: string;
  Details: string;
  ReportDate: string;
  CaseId: string;
  Guilty: boolean;
  Suspect?: SuspectProfile;
}

export interface SuspectProfile {
  Id: string;
  FirstName: string;
  LastName: string;
  Aliases: string[];
  Height?: string;
  Weight?: string;
  Age?: string;
  Sex?: string;
  Occupation?: string;
  IsGuilty: boolean;
  HairColor: string;
  EyeColor: string;
}

export interface DmvRecord {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  height: string;
  weight: number;
  licensePlate: string;
  eyeColor: string;
  hairColor: string;
  dateOfBirth: string;
}

export interface PhoneRecord {
  Id: string;
  PersonId: string;
  ToName: string;
  MessageContent: string;
  MessageDateTime: string;
}

export interface SocialMediaPost {
  Id: string;
  PersonId: string;
  Content: string;
  PostDate: string;
}

export interface SearchHistory {
  Id: string;
  PersonId: string;
  Query: string;
  SearchDate: string;
}

export interface PurchaseRecord {
  Id: string;
  PersonId: string;
  ItemBought: string;
  Price: number;
  PurchaseDate: string;
} 