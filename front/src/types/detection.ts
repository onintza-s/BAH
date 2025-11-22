export type BBox = {
	x: number;
	y: number;
	w: number;
	h: number;
};

export type Detection = {
	id: string;
	class: string;
	confidence: number;
	bbox: BBox;
};

export type ImageDetections = {
	image_id: string;
	width: number;
	height: number;
	detections: Detection[];
};
