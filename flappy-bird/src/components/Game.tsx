import React, { useEffect, useRef, useState } from 'react';
import backgroundImageSrc from '../images/22422-3840x2160-desktop-4k-leaf-background-image.jpg';
import birdImageSrc from '../images/bird-fly.gif';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const OBSTACLE_WIDTH = 70;
const OBSTACLE_HEIGHT = 100;
const OBSTACLE_INTERVAL = 2000; 

interface Obstacle {
  x: number;
  y: number;
  creationTime: number;
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [birdY, setBirdY] = useState(CANVAS_HEIGHT / 2 - BIRD_HEIGHT / 2);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;

    const backgroundImage = new Image();
    backgroundImage.src = backgroundImageSrc;

    const birdImage = new Image();
    birdImage.src = birdImageSrc;

    backgroundImage.onload = () => {
      birdImage.onload = () => {
        const drawImages = () => {
          context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          context.drawImage(birdImage, 50, birdY, BIRD_WIDTH, BIRD_HEIGHT);
        };

        const drawObstacles = () => {
          context.fillStyle = 'red'; 
          obstacles.forEach((obs) => {
            context.fillRect(obs.x, obs.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
          });
        };

        const updateCanvas = () => {
          context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          drawImages();
          drawObstacles();
        };

        const gameLoop = () => {
          if (isGameOver) return;
          updateCanvas();
          requestAnimationFrame(gameLoop);
        };

        gameLoop();
      };
    };

    backgroundImage.onerror = () => {
      console.error('Error loading background image');
    };

    birdImage.onerror = () => {
      console.error('Error loading bird image');
    };

  }, [birdY, obstacles, isGameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGameOver) return;

      setObstacles((prev) => {
        const newObstacles = prev.map((obs) => ({ ...obs, x: obs.x - 5 }));
        const filteredObstacles = newObstacles.filter((obs) => obs.x > -OBSTACLE_WIDTH);

        if (Date.now() - (prev[0]?.creationTime || 0) > OBSTACLE_INTERVAL) {
          setScore((prevScore) => prevScore + 1);
          return [
            ...filteredObstacles,
            { x: CANVAS_WIDTH, y: Math.random() * (CANVAS_HEIGHT - OBSTACLE_HEIGHT), creationTime: Date.now() },
          ];
        }
        return filteredObstacles;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGameOver]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setBirdY((prev) => Math.max(prev - 20, 0));
      } else if (event.key === 'ArrowDown') {
        setBirdY((prev) => Math.min(prev + 20, CANVAS_HEIGHT - BIRD_HEIGHT));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkCollision = () => {
      obstacles.forEach((obstacle) => {
        if (
          birdY < obstacle.y ||
          birdY + BIRD_HEIGHT > obstacle.y + OBSTACLE_HEIGHT ||
          birdY < 0 ||
          birdY + BIRD_HEIGHT > CANVAS_HEIGHT
        ) {
          if (obstacle.x < 50 + BIRD_WIDTH && obstacle.x + OBSTACLE_WIDTH > 50) {
            setIsGameOver(true);
          }
        }
      });
    };

    checkCollision();
  }, [birdY, obstacles]);

  return (
    <div>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      <div className="scoreboard">
        Score: {score}
      </div>
      {isGameOver && <div className="game-over">Game Over</div>}
    </div>
  );
};

export default Game;
