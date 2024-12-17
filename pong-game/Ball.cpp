#include <cstdlib>
#include "ball.h"

Ball::Ball(int width, int height)
	: x(SCREEN_WIDTH / 2 - width / 2), y(SCREEN_HEIGHT / 2 - height / 2),
	  w(width), h(height) {
	reset();
}

void Ball::reset() {
	x = SCREEN_WIDTH / 2.0f - w / 2;
	y = SCREEN_HEIGHT / 2.0f - h / 2;
	dx = (rand() % 2 == 0) ? 3.0f : -3.0f;
	dy = ((rand() % 5) - 2) * 2.0f;
	if (dy == 0)
		dy = 2.0f;
}
