#ifndef PADDLE_H
#define PADDLE_H

#include "constants.h"

class Paddle {
  public:
	float x, y;
	int w, h;

	Paddle(float posX, float posY, int width, int height);
	void move(float dy, float boundary);
};

#endif
