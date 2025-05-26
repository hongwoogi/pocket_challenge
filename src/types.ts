
export interface Point {
  x: number;
  y: number;
}

export interface Ball {
  position: Point;
  radius: number;
}

export interface Pocket {
  position: Point;
  radius: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export enum GameState {
  IDLE,
  AIMING,
  SHOOTING,
  SCORED,
  MISSED_TURN,
  GAME_OVER,
}
    