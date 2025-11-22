export type GeoBBox = {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
};

export type Detection = {
  id: string;
  file: string;
  class: string;
  confidence: number;
  bbox: GeoBBox;
};
