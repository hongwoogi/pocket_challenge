
import React from 'react';
import { COLORS } from '../constants.ts';

interface GameOverModalProps {
  currentScore: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ currentScore, highScore, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="alertdialog" aria-labelledby="gameOverHeading" aria-describedby="gameOverDescription">
      <div className={`${COLORS.modalBg} p-6 sm:p-8 rounded-xl shadow-2xl text-center w-full max-w-sm sm:max-w-md`}>
        <h2 id="gameOverHeading" className={`text-3xl sm:text-4xl font-extrabold ${COLORS.textPrimary} mb-4`}>게임 종료!</h2>
        <div id="gameOverDescription">
          <p className={`${COLORS.textSecondary} text-lg sm:text-xl mb-2`}>내 점수: <span className={`${COLORS.scoreText} font-bold`}>{currentScore}</span></p>
          <p className={`${COLORS.textSecondary} text-base sm:text-lg mb-6`}>최고 기록: <span className={`${COLORS.scoreText} font-bold`}>{highScore}</span></p>
          {currentScore > 0 && currentScore === highScore && (
            <p className="text-green-400 font-semibold text-md sm:text-lg mb-6">최고 기록 경신!</p>
          )}
        </div>
        <button
          onClick={onRestart}
          className={`w-full ${COLORS.buttonBg} hover:${COLORS.buttonHoverBg} ${COLORS.textPrimary} font-bold py-3 px-6 rounded-lg text-lg sm:text-xl transition-colors duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50`}
        >
          다시 시작
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;