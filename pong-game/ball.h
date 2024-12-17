#ifndef BALL_H
#define BALL_H

#include "constants.h"

class Ball {
  public:
	float x, y;
	float dx, dy;
	int w, h;

	Ball(int width, int height);
	void reset();
};

#endif
