
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Point, Velocity } from './types.ts';
import GameTable from './components/GameTable.tsx';
import ScoreDisplay from './components/ScoreDisplay.tsx';
import GameOverModal from './components/GameOverModal.tsx';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS,
  INITIAL_POCKET_RADIUS,
  POCKET_SHRINK_RATE,
  MAX_ROUNDS_FOR_SHRINK,
  MIN_POCKET_RADIUS_FACTOR,
  INITIAL_LIVES,
  FRICTION,
  MIN_VELOCITY_THRESHOLD,
  MAX_AIM_DRAG_DISTANCE,
  POWER_MULTIPLIER,
  COLORS,
  MAX_POCKET_ENTRY_SPEED,
  MAX_ROUNDS_FOR_AIM_LINE_FADE,
} from './constants.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [cueBallPosition, setCueBallPosition] = useState<Point>({ x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2 });
  const [pocketPosition, setPocketPosition] = useState<Point>(() => getRandomPocketPosition(INITIAL_POCKET_RADIUS));
  const [pocketRadius, setPocketRadius] = useState<number>(INITIAL_POCKET_RADIUS);
  const [ballVelocity, setBallVelocity] = useState<Velocity | null>(null);
  
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => parseInt(localStorage.getItem('pocketballHighScore') || '0', 10));
  const [lives, setLives] = useState<number>(INITIAL_LIVES);
  const [round, setRound] = useState<number>(1);

  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [currentDragPoint, setCurrentDragPoint] = useState<Point | null>(null);

  const gameTableRef = useRef<SVGSVGElement>(null);
  const animationFrameId = useRef<number | null>(null);

  function getRandomPocketPosition(pRadius: number): Point {
    const padding = pRadius + BALL_RADIUS + 10; // Ensure pocket is not too close to edge, +10 for safety
    return {
      x: Math.random() * (TABLE_WIDTH - 2 * padding) + padding,
      y: Math.random() * (TABLE_HEIGHT - 2 * padding) + padding,
    };
  }

  const resetBall = useCallback(() => {
    setCueBallPosition({ x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2 });
    setBallVelocity(null);
  }, []);

  const startNewRound = useCallback(() => {
    const newRoundNumber = round + 1;
    setRound(newRoundNumber);
    
    let newPocketRadius = INITIAL_POCKET_RADIUS;
    if (newRoundNumber <= MAX_ROUNDS_FOR_SHRINK) {
      newPocketRadius = INITIAL_POCKET_RADIUS * Math.pow(1 - POCKET_SHRINK_RATE, newRoundNumber - 1);
    } else {
      newPocketRadius = INITIAL_POCKET_RADIUS * Math.pow(1 - POCKET_SHRINK_RATE, MAX_ROUNDS_FOR_SHRINK -1);
    }
    newPocketRadius = Math.max(newPocketRadius, INITIAL_POCKET_RADIUS * MIN_POCKET_RADIUS_FACTOR);
    
    setPocketRadius(newPocketRadius);
    setPocketPosition(getRandomPocketPosition(newPocketRadius));
    resetBall();
    setGameState(GameState.IDLE);
  }, [round, resetBall]);

  const handleScore = useCallback(() => {
    setCurrentScore(prevScore => prevScore + 1);
    setGameState(GameState.SCORED);
    setTimeout(() => {
      startNewRound();
    }, 1000);
  }, [startNewRound]);

  const handleMiss = useCallback(() => {
    setLives(prevLives => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        setGameState(GameState.GAME_OVER);
        if (currentScore > highScore) {
          setHighScore(currentScore);
          localStorage.setItem('pocketballHighScore', currentScore.toString());
        }
      } else {
        setGameState(GameState.MISSED_TURN);
        setTimeout(() => {
          resetBall();
          setGameState(GameState.IDLE);
        }, 1000);
      }
      return newLives;
    });
  }, [currentScore, highScore, resetBall]); // lives removed from deps as it's updated via setter
  
  useEffect(() => {
    if (gameState !== GameState.SHOOTING || !ballVelocity) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    let newVelocity = { ...ballVelocity };
    let newPosition = { ...cueBallPosition };

    const gameLoop = () => {
      newPosition.x += newVelocity.dx;
      newPosition.y += newVelocity.dy;

      newVelocity.dx *= FRICTION;
      newVelocity.dy *= FRICTION;

      // Wall collisions
      if (newPosition.x - BALL_RADIUS < 0 || newPosition.x + BALL_RADIUS > TABLE_WIDTH) {
        newVelocity.dx *= -1;
        newPosition.x = Math.max(BALL_RADIUS, Math.min(TABLE_WIDTH - BALL_RADIUS, newPosition.x));
      }
      if (newPosition.y - BALL_RADIUS < 0 || newPosition.y + BALL_RADIUS > TABLE_HEIGHT) {
        newVelocity.dy *= -1;
        newPosition.y = Math.max(BALL_RADIUS, Math.min(TABLE_HEIGHT - BALL_RADIUS, newPosition.y));
      }
      
      setCueBallPosition({ ...newPosition });
      setBallVelocity({ ...newVelocity });

      const currentSpeed = Math.hypot(newVelocity.dx, newVelocity.dy);
      const distToPocket = Math.hypot(newPosition.x - pocketPosition.x, newPosition.y - pocketPosition.y);

      // Check if ball enters pocket area
      if (distToPocket < pocketRadius) {
        if (currentSpeed < MAX_POCKET_ENTRY_SPEED) {
          handleScore();
          return; // Stop loop
        }
        // If too fast, it passes over. Ball continues moving.
      }

      // Check if ball stopped
      if (currentSpeed < MIN_VELOCITY_THRESHOLD) {
        setBallVelocity(null); // Stop the ball
        // Check if it stopped inside the pocket (e.g. rolled in slowly or after deflection)
        const finalDistToPocket = Math.hypot(newPosition.x - pocketPosition.x, newPosition.y - pocketPosition.y);
        if (finalDistToPocket < pocketRadius) {
            handleScore();
        } else {
            handleMiss();
        }
        return; // Stop loop
      }
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, ballVelocity, cueBallPosition, pocketPosition, pocketRadius, handleScore, handleMiss]);


  const getSVGCoordinates = (event: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>): Point => {
    if (!gameTableRef.current) return { x: 0, y: 0 };
    const svgRect = gameTableRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return {
      x: clientX - svgRect.left,
      y: clientY - svgRect.top,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (gameState !== GameState.IDLE && gameState !== GameState.MISSED_TURN && gameState !== GameState.SCORED) return;
    if (gameState === GameState.MISSED_TURN || gameState === GameState.SCORED) { // Allow aiming immediately after messages
        setGameState(GameState.IDLE);
    }
    const coords = getSVGCoordinates(event);
    setDragStartPoint(coords); 
    setCurrentDragPoint(coords);
    setGameState(GameState.AIMING);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (gameState !== GameState.AIMING || !dragStartPoint) return;
    setCurrentDragPoint(getSVGCoordinates(event));
  };

  const handleMouseUp = () => {
    if (gameState !== GameState.AIMING || !dragStartPoint || !currentDragPoint) return;

    const dxDrag = currentDragPoint.x - dragStartPoint.x;
    const dyDrag = currentDragPoint.y - dragStartPoint.y;
    
    let dragDistance = Math.hypot(dxDrag, dyDrag);
    dragDistance = Math.min(dragDistance, MAX_AIM_DRAG_DISTANCE);

    if (dragDistance < 5) { 
      setGameState(GameState.IDLE);
      setDragStartPoint(null);
      setCurrentDragPoint(null);
      return;
    }

    const angle = Math.atan2(dyDrag, dxDrag);
    const power = dragDistance * POWER_MULTIPLIER;

    setBallVelocity({
      dx: -Math.cos(angle) * power,
      dy: -Math.sin(angle) * power,
    });

    setGameState(GameState.SHOOTING);
    setDragStartPoint(null);
    setCurrentDragPoint(null);
  };

  const handleTouchStart = (event: React.TouchEvent<SVGSVGElement>) => {
    if (gameState !== GameState.IDLE && gameState !== GameState.MISSED_TURN && gameState !== GameState.SCORED) return;
     if (gameState === GameState.MISSED_TURN || gameState === GameState.SCORED) {
        setGameState(GameState.IDLE);
    }
    const coords = getSVGCoordinates(event);
    setDragStartPoint(coords);
    setCurrentDragPoint(coords);
    setGameState(GameState.AIMING);
    event.preventDefault(); 
  };

  const handleTouchMove = (event: React.TouchEvent<SVGSVGElement>) => {
    if (gameState !== GameState.AIMING || !dragStartPoint) return;
    setCurrentDragPoint(getSVGCoordinates(event));
    event.preventDefault();
  };

  const handleTouchEnd = () => {
    // Same logic as mouseUp
    handleMouseUp(); 
  };

  const restartGame = () => {
    setCurrentScore(0);
    setRound(1);
    setLives(INITIAL_LIVES);
    setPocketRadius(INITIAL_POCKET_RADIUS);
    setPocketPosition(getRandomPocketPosition(INITIAL_POCKET_RADIUS));
    resetBall();
    setGameState(GameState.IDLE);
    setDragStartPoint(null);
    setCurrentDragPoint(null);
  };

  let aimLineProps = null;
  let aimLineOpacity = 1.0;

  if (round >= MAX_ROUNDS_FOR_AIM_LINE_FADE) {
    aimLineOpacity = 0.0;
  } else if (round > 1) { // Fade starts from round 2
    aimLineOpacity = 1.0 - (round - 1) / (MAX_ROUNDS_FOR_AIM_LINE_FADE - 1);
  }
  aimLineOpacity = Math.max(0, Math.min(1, aimLineOpacity)); // Clamp between 0 and 1


  if (gameState === GameState.AIMING && dragStartPoint && currentDragPoint && aimLineOpacity > 0) {
    const dxDrag = currentDragPoint.x - dragStartPoint.x;
    const dyDrag = currentDragPoint.y - dragStartPoint.y;
    let dragDistance = Math.hypot(dxDrag, dyDrag);
    dragDistance = Math.min(dragDistance, MAX_AIM_DRAG_DISTANCE);
    const angle = Math.atan2(dyDrag, dxDrag);

    aimLineProps = {
      x1: cueBallPosition.x,
      y1: cueBallPosition.y,
      x2: cueBallPosition.x - Math.cos(angle) * dragDistance,
      y2: cueBallPosition.y - Math.sin(angle) * dragDistance,
    };
  }

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-md mx-auto pt-4 sm:pt-8 pb-4">
      <ScoreDisplay
        currentScore={currentScore}
        highScore={highScore}
        lives={lives}
        round={round}
      />
      <GameTable
        ref={gameTableRef}
        cueBallPosition={cueBallPosition}
        pocketPosition={pocketPosition}
        pocketRadius={pocketRadius}
        aimLine={aimLineProps}
        aimLineOpacity={aimLineOpacity}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        gameState={gameState}
      />
      <div className="h-12 mt-4 flex items-center justify-center"> {/* Placeholder for messages to prevent layout shift */}
        {gameState === GameState.SCORED && (
          <p className={`text-xl font-bold ${COLORS.scoreText}`}>성공! 다음 라운드...</p>
        )}
        {gameState === GameState.MISSED_TURN && lives > 0 && (
          <p className="text-xl font-bold text-orange-400">실패! 다시 시도하세요.</p>
        )}
      </div>
      {gameState === GameState.GAME_OVER && (
        <GameOverModal currentScore={currentScore} highScore={highScore} onRestart={restartGame} />
      )}
      <p className={`mt-2 text-sm ${COLORS.textSecondary} text-center`}>
        공에서 드래그하여 조준하고 쏘세요.<br/>공을 포켓에 넣어 점수를 획득하세요.
      </p>
      <p className={`mt-1 text-xs ${COLORS.textSecondary} text-center`}>
        매 라운드마다 포켓이 작아집니다! (최대 {MAX_ROUNDS_FOR_SHRINK} 라운드까지)
      </p>
       <p className={`mt-1 text-xs ${COLORS.textSecondary} text-center`}>
        조준선은 {MAX_ROUNDS_FOR_AIM_LINE_FADE} 라운드부터 보이지 않습니다.
      </p>
    </div>
  );
};

export default App;