
import React, { forwardRef } from 'react';
import { Point, GameState } from '../types.ts';
import { TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS, COLORS } from '../constants.ts';

interface GameTableProps {
  cueBallPosition: Point;
  pocketPosition: Point;
  pocketRadius: number;
  aimLine: { x1: number; y1: number; x2: number; y2: number } | null;
  aimLineOpacity: number;
  onMouseDown: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp: (event: React.MouseEvent<SVGSVGElement>) => void;
  onTouchStart: (event: React.TouchEvent<SVGSVGElement>) => void;
  onTouchMove: (event: React.TouchEvent<SVGSVGElement>) => void;
  onTouchEnd: (event: React.TouchEvent<SVGSVGElement>) => void;
  gameState: GameState;
}

const GameTable = forwardRef<SVGSVGElement, GameTableProps>(({
  cueBallPosition,
  pocketPosition,
  pocketRadius,
  aimLine,
  aimLineOpacity,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  gameState
}, ref) => {
  const canAim = gameState === GameState.IDLE || gameState === GameState.SCORED || gameState === GameState.MISSED_TURN;
  const tableCursor = canAim ? 'cursor-grab' : 
                      gameState === GameState.AIMING ? 'cursor-grabbing' : 'cursor-default';

  return (
    <div className={`relative shadow-2xl rounded-lg overflow-hidden border-4 border-yellow-700 ${COLORS.table} touch-none ${tableCursor}`}
         style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT }}>
      <svg
        ref={ref}
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        viewBox={`0 0 ${TABLE_WIDTH} ${TABLE_HEIGHT}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp} 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="touch-none"
        aria-label="당구 게임 테이블"
      >
        {/* Pocket */}
        <circle
          cx={pocketPosition.x}
          cy={pocketPosition.y}
          r={pocketRadius}
          className={`${COLORS.pocket}`}
          aria-label={`포켓 위치: x ${pocketPosition.x.toFixed(0)}, y ${pocketPosition.y.toFixed(0)}, 반지름 ${pocketRadius.toFixed(0)}`}
        />
        {/* Cue Ball */}
        <circle
          cx={cueBallPosition.x}
          cy={cueBallPosition.y}
          r={BALL_RADIUS}
          className={`${COLORS.ball} shadow-md`}
           aria-label={`흰 공 위치: x ${cueBallPosition.x.toFixed(0)}, y ${cueBallPosition.y.toFixed(0)}`}
        />
        {/* Aiming Line */}
        {aimLine && gameState === GameState.AIMING && aimLineOpacity > 0 && (
          <line
            x1={aimLine.x1}
            y1={aimLine.y1}
            x2={aimLine.x2}
            y2={aimLine.y2}
            strokeWidth="3"
            className={`${COLORS.aimLine}`}
            strokeDasharray="5,5"
            style={{ opacity: aimLineOpacity }}
            aria-hidden="true" 
          />
        )}
      </svg>
    </div>
  );
});

GameTable.displayName = 'GameTable';
export default GameTable;