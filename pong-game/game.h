#ifndef GAME_H
#define GAME_H

#include <SDL.h>
#include <SDL_ttf.h>
#include "ball.h"
#include "paddle.h"
#include <string>

class Game {
  private:
	SDL_Window *window;
	SDL_Renderer *renderer;
	TTF_Font *font;
	bool running;

	Ball ball;
	Paddle leftPaddle;
	Paddle rightPaddle;
	int scoreLeft;
	int scoreRight;
	int state;

	bool upPressedLeft;
	bool downPressedLeft;
	bool upPressedRight;
	bool downPressedRight;

	bool checkCollision(const Ball &b, const Paddle &p);
	SDL_Texture *renderText(const std::string &message, SDL_Color color);
	void drawTextureCentered(SDL_Texture *texture, int y);
	void drawNet();
	void drawScore();
	void handleInput();
	void resetGame();
	void update();
	void render();

  public:
	Game();
	~Game();
	bool init();
	void run();
};

#endif
