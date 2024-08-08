import React, { useEffect, useRef, useState } from 'react';
import backgroundImageSrc from '../images/22422-3840x2160-desktop-4k-leaf-background-image.jpg';
import birdImage1Src from '../images/bird-fly-1.png';
import birdImage2Src from '../images/bird-fly-2.png';
import obstacleBirdSmall1Src from '../images/obstacle-bird-small-1.png';
import obstacleBirdSmall2Src from '../images/obstacle-bird-small-2.png';
import obstacleBirdMedium1Src from '../images/obstacle-bird-medium-1.png';
import obstacleBirdMedium2Src from '../images/obstacle-bird-medium-2.png';
import obstacleBirdLarge1Src from '../images/obstacle-bird-large-1.png';
import obstacleBirdLarge2Src from '../images/obstacle-bird-large-2.png';

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_SPEED = 5; // Speed at which obstacles move
const OBSTACLE_INTERVAL = 3000; // Interval for creating new obstacle set

interface Obstacle {
  x: number;
  y: number;
  height: number;
  type: 'top' | 'bottom';
  size: 'small' | 'medium' | 'large';
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [birdY, setBirdY] = useState(CANVAS_HEIGHT / 2 - BIRD_HEIGHT / 2);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [birdFrame, setBirdFrame] = useState(0);

  // Load images
  const backgroundImage = new Image();
  backgroundImage.src = backgroundImageSrc;

  const birdImages = [
    new Image(),
    new Image()
  ];
  birdImages[0].src = birdImage1Src;
  birdImages[1].src = birdImage2Src;

  const obstacleImages = {
    top: {
      small: [new Image(), new Image()],
      medium: [new Image(), new Image()],
      large: [new Image(), new Image()],
    },
    bottom: {
      small: [new Image(), new Image()],
      medium: [new Image(), new Image()],
      large: [new Image(), new Image()],
    }
  };

  obstacleImages.top.small[0].src = obstacleBirdSmall1Src;
  obstacleImages.top.small[1].src = obstacleBirdSmall2Src;
  obstacleImages.top.medium[0].src = obstacleBirdMedium1Src;
  obstacleImages.top.medium[1].src = obstacleBirdMedium2Src;
  obstacleImages.top.large[0].src = obstacleBirdLarge1Src;
  obstacleImages.top.large[1].src = obstacleBirdLarge2Src;

  obstacleImages.bottom.small[0].src = obstacleBirdSmall1Src;
  obstacleImages.bottom.small[1].src = obstacleBirdSmall2Src;
  obstacleImages.bottom.medium[0].src = obstacleBirdMedium1Src;
  obstacleImages.bottom.medium[1].src = obstacleBirdMedium2Src;
  obstacleImages.bottom.large[0].src = obstacleBirdLarge1Src;
  obstacleImages.bottom.large[1].src = obstacleBirdLarge2Src;

  // Preload images
  const loadImages = () => {
    const allImages = [
      backgroundImage,
      ...birdImages,
      ...Object.values(obstacleImages.top).flat(),
      ...Object.values(obstacleImages.bottom).flat()
    ];

    return Promise.all(allImages.map(img => 
      new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Error loading image'));
      })
    ));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    loadImages().then(() => {
      const drawImages = () => {
        context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const birdImage = birdImages[birdFrame % birdImages.length];
        context.drawImage(birdImage, 50, birdY, BIRD_WIDTH, BIRD_HEIGHT);
      };

      const drawObstacles = () => {
        obstacles.forEach((obs) => {
          const image = obstacleImages[obs.type][obs.size][birdFrame % 2];
          context.drawImage(image, obs.x, obs.type === 'top' ? 0 : CANVAS_HEIGHT - obs.height, OBSTACLE_WIDTH, obs.height);
        });
      };

      const updateCanvas = () => {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawImages();
        drawObstacles();
      };

      const gameLoop = () => {
        if (isGameOver) return;
        setBirdFrame(prev => (prev + 1) % birdImages.length); // Animate bird
        updateCanvas();
        requestAnimationFrame(gameLoop);
      };

      gameLoop();
    }).catch(error => console.error(error));

  }, [birdY, obstacles, isGameOver, birdFrame]);

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
    let obstacleTimer = Date.now();

    const createObstacle = () => {
      const sizes: ('small' | 'medium' | 'large')[] = ['small', 'large', 'medium'];
      const currentSizeIndex = Math.floor(Date.now() / OBSTACLE_INTERVAL) % sizes.length;
      const obstacleSize = sizes[currentSizeIndex];
      const obstacleHeight = getObstacleHeight(obstacleSize);

      const obstacleType: 'top' | 'bottom' = Math.random() > 0.5 ? 'top' : 'bottom';
      const yPosition = obstacleType === 'top'
        ? Math.random() * (CANVAS_HEIGHT - obstacleHeight)
        : CANVAS_HEIGHT - obstacleHeight;

      return { x: CANVAS_WIDTH, y: yPosition, height: obstacleHeight, type: obstacleType, size: obstacleSize };
    };

    const updateObstacles = () => {
      if (isGameOver) return;

      setObstacles(prev => {
        const newObstacles = prev.map(obs => ({ ...obs, x: obs.x - OBSTACLE_SPEED }));
        const filteredObstacles = newObstacles.filter(obs => obs.x > -OBSTACLE_WIDTH);

        if (Date.now() - obstacleTimer > OBSTACLE_INTERVAL) {
          obstacleTimer = Date.now();
          return [...filteredObstacles, createObstacle()];
        }

        return filteredObstacles;
      });
    };

    const interval = setInterval(updateObstacles, 100);

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
          birdY + BIRD_HEIGHT > obstacle.y + obstacle.height ||
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

  const getObstacleHeight = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return 50;
      case 'medium': return 100;
      case 'large': return 150;
      default: return 50;
    }
  };

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
