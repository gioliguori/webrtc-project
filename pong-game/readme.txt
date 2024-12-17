comando per compilare :

g++ main.cpp Game.cpp Ball.cpp Paddle.cpp -o pong \
-I/opt/homebrew/include/SDL2 -L/opt/homebrew/lib \
-lSDL2 -lSDL2_ttf -std=c++17