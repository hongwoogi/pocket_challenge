
export const TABLE_WIDTH = 400; // Adjusted for vertical layout
export const TABLE_HEIGHT = 600; // Adjusted for vertical layout
export const BALL_RADIUS = 10;
export const INITIAL_POCKET_RADIUS = 30;
export const MIN_POCKET_RADIUS_FACTOR = 0.4; // Pocket radius won't shrink below 40% of initial
export const POCKET_SHRINK_RATE = 0.02; // 2% shrink per round
export const MAX_AIM_DRAG_DISTANCE = 150;
export const POWER_MULTIPLIER = 0.15; // Increased slightly for potentially longer shots on vertical table
export const FRICTION = 0.985;
export const MIN_VELOCITY_THRESHOLD = 0.1;
export const INITIAL_LIVES = 3;
export const MAX_ROUNDS_FOR_SHRINK = 50;
export const MAX_POCKET_ENTRY_SPEED = 7; // Max speed to enter pocket; faster will pass over
export const MAX_ROUNDS_FOR_AIM_LINE_FADE = 30; // Round at which aim line becomes invisible

export const COLORS = {
  table: 'bg-green-700',
  ball: 'fill-white',
  pocket: 'fill-black',
  aimLine: 'stroke-yellow-400',
  textPrimary: 'text-slate-100',
  textSecondary: 'text-slate-300',
  scoreText: 'text-amber-400',
  livesIcon: 'text-red-500',
  buttonBg: 'bg-blue-600',
  buttonHoverBg: 'bg-blue-700',
  modalBg: 'bg-slate-800',
};