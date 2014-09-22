interface JSONKifuFormat{
	type: string;
	header: {[index: string]: string;};
	moves: MoveFormat[];
	result: string;
}
interface MoveMoveFormat {
	from?: PlaceFormat;
	to?: PlaceFormat;
	piece: string;
	same?: boolean;
	promote?: boolean;
	capture?: string;
	relative?: string;
}
interface MoveFormat{
	comments: string[];
	move?: MoveMoveFormat;
	time: {
		now: TimeFormat;
		total: TimeFormat;
	}
	special?: string;
}
interface TimeFormat{
	h?: number;
	m: number;
	s: number;
}
interface PlaceFormat{
	x: number;
	y: number;
}
