.PHONY: trpc contract openapi graphql server-functions

# Requires Bun, GNU Parallel for two-process demonstrations, and installed dependencies.
trpc:
	parallel --jobs 2 --line-buffer --tag --halt now,done=1 ::: \
		'bun run --cwd trpc/server start' \
		'bun run --cwd trpc/front dev'

contract:
	parallel --jobs 2 --line-buffer --tag --halt now,done=1 ::: \
		'bun run --cwd shared-contract/server start' \
		'bun run --cwd shared-contract/front dev'

openapi:
	parallel --jobs 2 --line-buffer --tag --halt now,done=1 ::: \
		'bun run --cwd openapi-orval/server start' \
		'bun run --cwd openapi-orval/front dev'

graphql:
	parallel --jobs 2 --line-buffer --tag --halt now,done=1 ::: \
		'bun run --cwd graphql/server start' \
		'bun run --cwd graphql/front dev'

server-functions:
	bun run --cwd server-functions dev
