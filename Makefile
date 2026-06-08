IMAGE = takenote-tests
HISTORY = $(PWD)/.allure-history

.PHONY: build run

build:
	docker build -t $(IMAGE) .

run: build
	docker run --rm \
	  -p 5050:5050 \
	  -v $(HISTORY):/app/allure-history \
	  -e BASE_URL=https://takenote.dev/app \
	  $(IMAGE)
