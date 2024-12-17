#include "game.h"
#include <iostream>
#include <ctime>

// Costruttore della classe Game
Game::Game()
	: window(nullptr), renderer(nullptr), font(nullptr), running(true),
	  ball(10, 10), leftPaddle(20, (SCREEN_HEIGHT - 60) / 2, 10, 60),
	  rightPaddle(SCREEN_WIDTH - 30, (SCREEN_HEIGHT - 60) / 2, 10, 60),
	  scoreLeft(0), scoreRight(0), state(0), upPressedLeft(false),
	  downPressedLeft(false), upPressedRight(false), downPressedRight(false) {
	srand(static_cast<unsigned int>(time(nullptr)));
}

// Distruttore della classe Game
Game::~Game() {
	if (font)
		TTF_CloseFont(font);
	if (renderer)
		SDL_DestroyRenderer(renderer);
	if (window)
		SDL_DestroyWindow(window);
	TTF_Quit();
	SDL_Quit();
}

// Inizializza SDL e i componenti del gioco
bool Game::init() {
	if (SDL_Init(SDL_INIT_VIDEO) < 0) {
		std::cerr << "Failed to initialize SDL: " << SDL_GetError()
				  << std::endl;
		return false;
	}

	if (TTF_Init() == -1) {
		std::cerr << "Failed to initialize SDL_ttf: " << TTF_GetError()
				  << std::endl;
		SDL_Quit();
		return false;
	}

	window = SDL_CreateWindow("Pong Multiplayer", SDL_WINDOWPOS_CENTERED,
							  SDL_WINDOWPOS_CENTERED, SCREEN_WIDTH,
							  SCREEN_HEIGHT, SDL_WINDOW_SHOWN);
	if (!window) {
		std::cerr << "Failed to create window: " << SDL_GetError() << std::endl;
		TTF_Quit();
		SDL_Quit();
		return false;
	}

	renderer = SDL_CreateRenderer(
		window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
	if (!renderer) {
		std::cerr << "Failed to create renderer: " << SDL_GetError()
				  << std::endl;
		SDL_DestroyWindow(window);
		TTF_Quit();
		SDL_Quit();
		return false;
	}

	font = TTF_OpenFont("fonts/Roboto/Roboto-Regular.ttf", 24);
	if (!font) {
		std::cerr << "Failed to load font: " << TTF_GetError() << std::endl;
		SDL_DestroyRenderer(renderer);
		SDL_DestroyWindow(window);
		TTF_Quit();
		SDL_Quit();
		return false;
	}

	return true;
}

// Controlla la collisione tra la pallina e una racchetta
bool Game::checkCollision(const Ball &b, const Paddle &p) {
	return !(b.x + b.w < p.x || b.x > p.x + p.w || b.y + b.h < p.y ||
			 b.y > p.y + p.h);
}

// Rende un testo in una texture SDL
SDL_Texture *Game::renderText(const std::string &message, SDL_Color color) {
	SDL_Surface *surface = TTF_RenderText_Solid(font, message.c_str(), color);
	if (!surface) {
		std::cerr << "Error rendering text: " << TTF_GetError() << std::endl;
		return nullptr;
	}
	SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surface);
	SDL_FreeSurface(surface);
	return texture;
}

// Disegna una texture centrata sullo schermo
void Game::drawTextureCentered(SDL_Texture *texture, int y) {
	int w, h;
	SDL_QueryTexture(texture, nullptr, nullptr, &w, &h);
	SDL_Rect dest = {(SCREEN_WIDTH - w) / 2, y, w, h};
	SDL_RenderCopy(renderer, texture, nullptr, &dest);
}

// Disegna la rete centrale del campo
void Game::drawNet() {
	SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
	for (int i = 0; i < SCREEN_HEIGHT; i += 20) {
		SDL_RenderDrawLine(renderer, SCREEN_WIDTH / 2, i, SCREEN_WIDTH / 2,
						   i + 10);
	}
}

// Disegna il punteggio sullo schermo
void Game::drawScore() {
	SDL_Color white = {255, 255, 255, 255};
	std::string scoreText =
		std::to_string(scoreLeft) + " - " + std::to_string(scoreRight);
	SDL_Texture *scoreTexture = renderText(scoreText, white);
	if (scoreTexture) {
		SDL_Rect dest = {SCREEN_WIDTH / 2 - 50, 10, 100, 30};
		SDL_RenderCopy(renderer, scoreTexture, nullptr, &dest);
		SDL_DestroyTexture(scoreTexture);
	}
}

// Gestisce l'input dell'utente
void Game::handleInput() {
	SDL_Event e;
	while (SDL_PollEvent(&e)) {
		if (e.type == SDL_QUIT) {
			running = false;
		} else if (e.type == SDL_KEYDOWN) {
			switch (e.key.keysym.sym) {
			case SDLK_ESCAPE:
				running = false;
				break;
			case SDLK_w:
				upPressedLeft = true;
				break;
			case SDLK_s:
				downPressedLeft = true;
				break;
			case SDLK_UP:
				upPressedRight = true;
				break;
			case SDLK_DOWN:
				downPressedRight = true;
				break;
			case SDLK_SPACE:
				if (state == 0) {
					resetGame();
					state = 1;
				} else if (state == 2) {
					state = 0;
				}
				break;
			default:
				break;
			}
		} else if (e.type == SDL_KEYUP) {
			switch (e.key.keysym.sym) {
			case SDLK_w:
				upPressedLeft = false;
				break;
			case SDLK_s:
				downPressedLeft = false;
				break;
			case SDLK_UP:
				upPressedRight = false;
				break;
			case SDLK_DOWN:
				downPressedRight = false;
				break;
			default:
				break;
			}
		}
	}
}

// Reimposta il gioco
void Game::resetGame() {
	ball.reset();
	leftPaddle = Paddle(20, (SCREEN_HEIGHT - 60) / 2, 10, 60);
	rightPaddle = Paddle(SCREEN_WIDTH - 30, (SCREEN_HEIGHT - 60) / 2, 10, 60);
	scoreLeft = 0;
	scoreRight = 0;
}

// Aggiorna lo stato del gioco
void Game::update() {
	if (state != 1)
		return;

	float paddleSpeed = 5.0f;
	if (upPressedLeft)
		leftPaddle.move(-paddleSpeed, SCREEN_HEIGHT);
	if (downPressedLeft)
		leftPaddle.move(paddleSpeed, SCREEN_HEIGHT);
	if (upPressedRight)
		rightPaddle.move(-paddleSpeed, SCREEN_HEIGHT);
	if (downPressedRight)
		rightPaddle.move(paddleSpeed, SCREEN_HEIGHT);

	ball.x += ball.dx;
	ball.y += ball.dy;

	if (ball.y <= 0 || ball.y + ball.h >= SCREEN_HEIGHT) {
		ball.dy = -ball.dy;
	}

	if (ball.x <= 0) {
		scoreRight++;
		ball.reset();
	} else if (ball.x + ball.w >= SCREEN_WIDTH) {
		scoreLeft++;
		ball.reset();
	}

	if (checkCollision(ball, leftPaddle) || checkCollision(ball, rightPaddle)) {
		ball.dx = -ball.dx;
		ball.dy += ((rand() % 5) - 2);
	}

	if (scoreLeft >= 5 || scoreRight >= 5) {
		state = 2;
	}
}

// Disegna tutto sullo schermo
void Game::render() {
	SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
	SDL_RenderClear(renderer);

	if (state == 0) {
		SDL_Texture *startText =
			renderText("Press SPACE to Start", {255, 255, 255, 255});
		if (startText) {
			drawTextureCentered(startText, SCREEN_HEIGHT / 2 - 25);
			SDL_DestroyTexture(startText);
		}
	} else if (state == 1) {
		drawNet();
		drawScore();

		SDL_Rect ballRect = {(int) ball.x, (int) ball.y, ball.w, ball.h};
		SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
		SDL_RenderFillRect(renderer, &ballRect);

		SDL_Rect leftRect = {(int) leftPaddle.x, (int) leftPaddle.y,
							 leftPaddle.w, leftPaddle.h};
		SDL_Rect rightRect = {(int) rightPaddle.x, (int) rightPaddle.y,
							  rightPaddle.w, rightPaddle.h};
		SDL_RenderFillRect(renderer, &leftRect);
		SDL_RenderFillRect(renderer, &rightRect);
	} else if (state == 2) {
		std::string winnerText =
			(scoreLeft >= 5) ? "Player 1 Wins!" : "Player 2 Wins!";
		SDL_Texture *winnerTexture =
			renderText(winnerText, {255, 255, 255, 255});
		if (winnerTexture) {
			drawTextureCentered(winnerTexture, SCREEN_HEIGHT / 2 - 25);
			SDL_DestroyTexture(winnerTexture);
		}
		SDL_Texture *restartText =
			renderText("Press SPACE to Restart", {255, 255, 255, 255});
		if (restartText) {
			drawTextureCentered(restartText, SCREEN_HEIGHT / 2 + 25);
			SDL_DestroyTexture(restartText);
		}
	}

	SDL_RenderPresent(renderer);
}

// Ciclo principale del gioco
void Game::run() {
	while (running) {
		handleInput();
		update();
		render();
		SDL_Delay(16); // ~60fps
	}
}
