.PHONY: invoke

install:
	yarn install

fmt:
	yarn lint

clean:
	rm -rf ./dist

build: clean
	yarn build

invoke: build
	DRY_RUN=true sam local invoke --no-event

deploy: build
	sam deploy
