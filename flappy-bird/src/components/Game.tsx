import React, { useEffect, useRef, useState } from 'react';
import backgroundImageSrc from '../images/22422-3840x2160-desktop-4k-leaf-background-image.jpg';
import birdImageSrc from '../images/bird-fly.gif';
import obstacleImageSrc from '../images/obstacle-bottom.png'; 
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const OBSTACLE_WIDTH = 140; // Width of the obstacle
const OBSTACLE_MIN_HEIGHT = 300; // Minimum height of the obstacle
const OBSTACLE_MAX_HEIGHT = 600; // Maximum height of the obstacle
const OBSTACLE_INTERVAL = 3000; // Interval in milliseconds
const OBSTACLE_SPEED = 10; // Speed at which the obstacle moves

interface Obstacle {
  x: number;
  y: number;
  height: number;
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

    const obstacleImage = new Image();
    obstacleImage.src = obstacleImageSrc;

    const drawImages = () => {
      context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.drawImage(birdImage, 50, birdY, BIRD_WIDTH, BIRD_HEIGHT);
    };

    const drawObstacles = () => {
      obstacles.forEach((obs) => {
        context.drawImage(obstacleImage, obs.x, CANVAS_HEIGHT - obs.height, OBSTACLE_WIDTH, obs.height);
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
        obstacleImage.onload = () => {
          gameLoop();
        };
      };
    };

    backgroundImage.onerror = () => console.error('Error loading background image');
    birdImage.onerror = () => console.error('Error loading bird image');
    obstacleImage.onerror = () => console.error('Error loading obstacle image');
  }, [birdY, obstacles, isGameOver]);

  useEffect(() => {
    const obstacleInterval = setInterval(() => {
      if (isGameOver) return;

      const height = Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT) + OBSTACLE_MIN_HEIGHT;
      const y = CANVAS_HEIGHT - height;

      setObstacles((prev) => [
        ...prev,
        { x: CANVAS_WIDTH, y, height }
      ]);
      setScore((prev) => prev + 1);
    }, OBSTACLE_INTERVAL);

    return () => clearInterval(obstacleInterval);
  }, [isGameOver]);

  useEffect(() => {
    const moveObstacles = () => {
      setObstacles((prev) => {
        const updatedObstacles = prev
          .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
          .filter((obs) => obs.x + OBSTACLE_WIDTH > 0); // Remove obstacles that move off-screen

        return updatedObstacles;
      });
    };

    const interval = setInterval(moveObstacles, 100);

    return () => clearInterval(interval);
  }, [isGameOver]);

  useEffect(() => {
    const checkCollision = () => {
      for (const obs of obstacles) {
        if (
          50 + BIRD_WIDTH > obs.x && // Check if the bird is within the horizontal bounds of the obstacle
          50 < obs.x + OBSTACLE_WIDTH && // Check if the bird is within the horizontal bounds of the obstacle
          birdY < CANVAS_HEIGHT - obs.height && // Check if the bird is within the vertical bounds of the obstacle
          birdY + BIRD_HEIGHT > CANVAS_HEIGHT - obs.height // Check if the bird is within the vertical bounds of the obstacle
        ) {
          setIsGameOver(true);
          break;
        }
      }
    };

    checkCollision();
  }, [birdY, obstacles]);

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
