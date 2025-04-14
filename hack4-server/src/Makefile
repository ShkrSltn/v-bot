
# ----------- ⚙️ Config ----------
SRC_DIR=src
OUT_DIR=dist
ENTRY=$(SRC_DIR)/index.ts
EMAIL_TEST=testSend.ts

# ----------- 🔨 Commands ---------

# Transpile TypeScript to JS
build:
	npx tsc

# Run compiled JS
start:
	node $(OUT_DIR)/index.js

# Watch + run (auto-restarts)
dev:
	npm run start:dev

# Run a TS file without compiling
run:
	npx tsx $(ENTRY)

# Run test email script
test-email:
	npx tsx $(EMAIL_TEST)

# Lint the code
lint:
	npx eslint $(SRC_DIR) --ext .ts

# Format with Prettier
format:
	npx prettier --write "$(SRC_DIR)/**/*.ts"

# Clean build output
clean:
	rm -rf $(OUT_DIR)

# Install deps
install:
	npm install

# Reinstall from scratch
reinstall:
	rm -rf node_modules package-lock.json
	npm install

# Help menu
help:
	@echo "🤖 Available commands:"
	@echo "  make build         - Compile TypeScript"
	@echo "  make start         - Run compiled JS"
	@echo "  make dev           - Run in watch mode (nodemon)"
	@echo "  make run           - Run TS file directly (tsx)"
	@echo "  make test-email    - Run the test email script"
	@echo "  make lint          - Run ESLint"
	@echo "  make format        - Format code with Prettier"
	@echo "  make clean         - Remove dist/"
	@echo "  make install       - npm install"
	@echo "  make reinstall     - Fresh reinstall"


# make dev          # run your app in watch mode
# make test-email   # run your chatbot email tester
# make lint         # clean up your code
# make format       # auto format everything