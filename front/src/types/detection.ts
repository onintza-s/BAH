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

export type Tile = {
  file: string;
  // [[minLat, minLon], [maxLat, maxLon]]
  bounds: [[number, number], [number, number]];
};

export type Metrics = {
  num_images: number;
  num_detections: number;
  total_seconds: number;
  avg_seconds_per_image: number | null;
};
