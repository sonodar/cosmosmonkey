.PHONY: deps clean build

deps:
	dep ensure

fmt:
	go fmt ./...

clean:
	rm -rf ./dist

build: deps clean fmt
	mkdir -p ./dist
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ./dist/cosmosmonkey main.go

invoke: build
	DRY_RUN=true sam local invoke --no-event

package:
	sam package --template-file template.yaml --output-template-file cloudformation.yml \
      --s3-bucket qlife-work-dev --s3-prefix sam-src

deploy: package
	sam deploy --stack-name CosmosMonkeyStack --template-file cloudformation.yml --capabilities CAPABILITY_NAMED_IAM \
	  --parameter-overrides LogTimezone=Asia/Tokyo
