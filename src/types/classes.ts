export interface Piece {
	id: string,
	objectType: string, // TODO: Enum?
	objectTime: number,
	duration: number,
	clipName: string,
	attributes: any,
	position: string,
	script?: string
}

export interface BoxProps {
	x: number
	y: number
	size: number
}
