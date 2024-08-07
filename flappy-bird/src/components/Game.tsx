import React, { useEffect, useRef, useState } from 'react';
import backgroundImageSrc from '../images/22422-3840x2160-desktop-4k-leaf-background-image.jpg';
import birdImage1Src from '../images/bird-fly-1.png'; 
import birdImage2Src from '../images/bird-fly-2.png'; 
import obstacleBirdSmallSrc from '../images/obstacle-bird-small.png'; 
import obstacleBirdMediumSrc from '../images/obstacle-bird-medium.png'; 
import obstacleBirdLargeSrc from '../images/obstacle-bird-large.png'; 

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const OBSTACLE_INTERVAL = 3000; 
const OBSTACLE_SPEED = 4; 

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [birdY, setBirdY] = useState(CANVAS_HEIGHT / 2 - BIRD_WIDTH / 2);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [currentBirdImage, setCurrentBirdImage] = useState(birdImage1Src);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const backgroundImage = new Image();
    backgroundImage.src = backgroundImageSrc;

    const birdImage1 = new Image();
    birdImage1.src = birdImage1Src;

    const birdImage2 = new Image();
    birdImage2.src = birdImage2Src;

    const obstacleBirdSmall = new Image();
    obstacleBirdSmall.src = obstacleBirdSmallSrc;

    const obstacleBirdMedium = new Image();
    obstacleBirdMedium.src = obstacleBirdMediumSrc;

    const obstacleBirdLarge = new Image();
    obstacleBirdLarge.src = obstacleBirdLargeSrc;

    const drawMainBird = () => {
      const birdImage = new Image();
      birdImage.src = currentBirdImage;
      context.drawImage(birdImage, 50, birdY, BIRD_WIDTH, BIRD_HEIGHT);
    };

    const drawObstacles = () => {
      obstacles.forEach((obs) => {
        context.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);
      });
    };

    const updateCanvas = () => {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawMainBird();
      drawObstacles();
    };

    const gameLoop = () => {
      if (isGameOver) return;
      updateCanvas();
      requestAnimationFrame(gameLoop);
    };

    // Start the game loop after all images have loaded
    backgroundImage.onload = () => {
      birdImage1.onload = () => {
        birdImage2.onload = () => {
          obstacleBirdSmall.onload = () => {
            obstacleBirdMedium.onload = () => {
              obstacleBirdLarge.onload = () => {
                gameLoop();
              };
            };
          };
        };
      };
    };

    // Handle image load errors
    backgroundImage.onerror = () => console.error('Error loading background image');
    birdImage1.onerror = () => console.error('Error loading bird image 1');
    birdImage2.onerror = () => console.error('Error loading bird image 2');
    obstacleBirdSmall.onerror = () => console.error('Error loading small obstacle bird image');
    obstacleBirdMedium.onerror = () => console.error('Error loading medium obstacle bird image');
    obstacleBirdLarge.onerror = () => console.error('Error loading large obstacle bird image');
  }, [birdY, obstacles, isGameOver, currentBirdImage]);

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
    const birdAnimationInterval = setInterval(() => {
      setCurrentBirdImage((prevImage) =>
        prevImage === birdImage1Src ? birdImage2Src : birdImage1Src
      );
    }, 200); // Adjust this interval to change the animation speed

    return () => clearInterval(birdAnimationInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGameOver) return;

      setObstacles((prev) => {
        const newObstacles = prev.map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }));
        const filteredObstacles = newObstacles.filter((obs) => obs.x > -obs.width);

        // Create a new obstacle every OBSTACLE_INTERVAL
        if (filteredObstacles.length === 0 || Math.random() < 0.1) {
          setScore((prevScore) => prevScore + 1);

          const obstacleSize = Math.random();
          let obstacleImage, obstacleWidth, obstacleHeight;

          if (obstacleSize < 0.33) {
            obstacleImage = new Image();
            obstacleImage.src = obstacleBirdSmallSrc;
            obstacleWidth = BIRD_WIDTH;
            obstacleHeight = BIRD_HEIGHT;
          } else if (obstacleSize < 0.66) {
            obstacleImage = new Image();
            obstacleImage.src = obstacleBirdMediumSrc;
            obstacleWidth = BIRD_WIDTH * 1.5;
            obstacleHeight = BIRD_HEIGHT * 1.5;
          } else {
            obstacleImage = new Image();
            obstacleImage.src = obstacleBirdLargeSrc;
            obstacleWidth = BIRD_WIDTH * 2;
            obstacleHeight = BIRD_HEIGHT * 2;
          }

          const yPosition = Math.random() * (CANVAS_HEIGHT - obstacleHeight);

          return [
            ...filteredObstacles,
            { x: CANVAS_WIDTH, y: yPosition, width: obstacleWidth, height: obstacleHeight, image: obstacleImage },
          ];
        }
        return filteredObstacles;
      });
    }, OBSTACLE_INTERVAL / 3); 

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
          birdY < obstacle.y + obstacle.height &&
          birdY + BIRD_HEIGHT > obstacle.y &&
          50 < obstacle.x + obstacle.width &&
          50 + BIRD_WIDTH > obstacle.x
        ) {
          setIsGameOver(true);
        }
      });
    };

    checkCollision();
  }, [birdY, obstacles]);

  const handleRestart = () => {
    setIsGameOver(false);
    setObstacles([]);
    setScore(0);
    setBirdY(CANVAS_HEIGHT / 2 - BIRD_WIDTH / 2);
  };

  return (
    <div>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      <div className="scoreboard">
        Score: {score}
      </div>
      {isGameOver && (
        <div>
          <div className="game-over">Game Over</div>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default Game;
