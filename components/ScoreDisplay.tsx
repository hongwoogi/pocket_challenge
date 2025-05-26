
import React from 'react';
import { COLORS } from '../constants.ts';
import { HeartIcon } from './Icons.tsx';

interface ScoreDisplayProps {
  currentScore: number;
  highScore: number;
  lives: number;
  round: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ currentScore, highScore, lives, round }) => {
  return (
    <div className="w-full mb-4 p-3 sm:p-4 bg-slate-800 rounded-lg shadow-xl" role="region" aria-label="게임 점수판">
      <div className="flex justify-between items-center text-sm sm:text-lg">
        <div className="flex flex-col items-start">
          <p className={`${COLORS.textSecondary} text-xs sm:text-sm`} aria-label="최고 기록">최고 기록</p>
          <p className={`${COLORS.scoreText} font-bold text-xl sm:text-2xl`}>{highScore}</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <p className={`${COLORS.textSecondary} text-xs sm:text-sm`}>라운드 {round}</p>
          <p className={`${COLORS.scoreText} font-bold text-2xl sm:text-3xl`} aria-live="polite" aria-atomic="true">{currentScore}</p>
          <p className={`${COLORS.textSecondary} text-xs sm:text-sm`}>점수</p>
        </div>
        <div className="flex flex-col items-end">
           <p className={`${COLORS.textSecondary} text-xs sm:text-sm`}>남은 기회</p>
           <div className="flex" role="img" aria-label={`남은 기회 ${lives}개`}>
            {Array.from({ length: lives }).map((_, i) => (
              <HeartIcon key={`life-${i}`} className={`w-5 h-5 sm:w-7 sm:h-7 ${COLORS.livesIcon} ml-1`} />
            ))}
            {Array.from({ length: Math.max(0, 3-lives) }).map((_, i) => (
              <HeartIcon key={`empty-${i}`} className={`w-5 h-5 sm:w-7 sm:h-7 text-gray-600 ml-1`} />
            ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;