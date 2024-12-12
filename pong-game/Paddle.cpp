#include "paddle.h"

Paddle::Paddle(float posX, float posY, int width, int height)
	: x(posX), y(posY), w(width), h(height) {
}

void Paddle::move(float dy, float boundary) {
	y += dy;
	if (y < 0)
		y = 0;
	if (y + h > boundary)
		y = boundary - h;
}
