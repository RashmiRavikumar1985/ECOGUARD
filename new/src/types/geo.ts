// src/types/geo.ts

export type Place = {
  id: string;
  name: string;
  coordinates?: [number, number]; // [latitude, longitude]
};

export type Region = {
  id: string;
  name: string;
  places: Place[];
  coordinates?: [number, number]; // [latitude, longitude]
};

export type Country = {
  id: string;
  name: string;
  regions: Region[];
  coordinates?: [number, number]; // [latitude, longitude]
};
