export enum UserType {
  DONOR = 'donor',
  COLLECTOR = 'collector'
}

export interface Material {
  name: string;
  iconUrl: string;
  active: boolean;
  points: Record<UserType, number>;
}
