.PHONY: invoke

install:
	yarn install

fmt:
	yarn lint

clean:
	rm -rf ./dist

build: install clean fmt
	yarn build

invoke:
	DRY_RUN=true sam local invoke --no-event

deploy:
	sam deploy
