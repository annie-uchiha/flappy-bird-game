import React, { useEffect, useRef, useState } from 'react';
import backgroundImageSrc from '../images/22422-3840x2160-desktop-4k-leaf-background-image.jpg';
import birdImageSrc from '../images/bird-fly.gif';

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const OBSTACLE_WIDTH = 50;
const MIN_OBSTACLE_HEIGHT = 30;
const MAX_OBSTACLE_HEIGHT = 150;
const OBSTACLE_INTERVAL = 3000; // Increased interval
const OBSTACLE_SPEED = 8;
const OBSTACLE_TYPES: Array<'top' | 'bottom'> = ['top', 'bottom'];

interface Obstacle {
  x: number;
  y: number;
  height: number;
  type: 'top' | 'bottom';
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
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const backgroundImage = new Image();
    backgroundImage.src = backgroundImageSrc;

    const birdImage = new Image();
    birdImage.src = birdImageSrc;

    const drawImages = () => {
      context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.drawImage(birdImage, 50, birdY, BIRD_WIDTH, BIRD_HEIGHT);
    };

    const drawObstacles = () => {
      context.fillStyle = 'red';
      obstacles.forEach((obs) => {
        if (obs.type === 'top') {
          context.fillRect(obs.x, 0, OBSTACLE_WIDTH, obs.height);
        } else {
          context.fillRect(obs.x, CANVAS_HEIGHT - obs.height, OBSTACLE_WIDTH, obs.height);
        }
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

    backgroundImage.onload = () => {
      birdImage.onload = () => {
        gameLoop();
      };
    };

    backgroundImage.onerror = () => console.error('Error loading background image');
    birdImage.onerror = () => console.error('Error loading bird image');
  }, [birdY, obstacles, isGameOver]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGameOver) return;

      setObstacles((prev) => {
        const newObstacles = prev.map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }));
        const filteredObstacles = newObstacles.filter((obs) => obs.x > -OBSTACLE_WIDTH);

        const currentTime = Date.now();
        if (currentTime - (prev[0]?.creationTime || 0) > OBSTACLE_INTERVAL) {
          setScore((prevScore) => prevScore + 1);

          const obstacleType: 'top' | 'bottom' = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
          const obstacleHeight = Math.random() * (MAX_OBSTACLE_HEIGHT - MIN_OBSTACLE_HEIGHT) + MIN_OBSTACLE_HEIGHT;
          const yPosition = obstacleType === 'top' ? 0 : CANVAS_HEIGHT - obstacleHeight;

          return [
            ...filteredObstacles,
            { x: CANVAS_WIDTH, y: yPosition, height: obstacleHeight, type: obstacleType, creationTime: currentTime },
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
        const isColliding = (
          birdY < (obstacle.type === 'top' ? obstacle.height : CANVAS_HEIGHT - obstacle.height) &&
          birdY + BIRD_HEIGHT > (obstacle.type === 'top' ? 0 : CANVAS_HEIGHT - obstacle.height) &&
          50 < obstacle.x + OBSTACLE_WIDTH &&
          50 + BIRD_WIDTH > obstacle.x
        );
        
        if (isColliding) {
          setIsGameOver(true);
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
