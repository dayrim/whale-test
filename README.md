# Telegram Bot Project

This project is a Node.js-based Telegram bot designed to interact with users by providing a personalized greeting and administrative capabilities.

## Demo

Preview this bot in telegram https://t.me/WhaleTestAppBot

## Features

- `/start` Command: Users can initiate interaction with the bot. The bot will respond with a message and a web app button that, when clicked, displays the user's first name as a greeting on a simple webpage.
- User Persistence: The bot stores user information in a database, making it accessible for future interactions and additional functionality.
- `/adminhello <telegram_id> <text>` Command: Admins can send personalized messages to users by invoking this command followed by the user's Telegram ID and the intended message.

## Getting Started

### Installation

Clone the repository and install dependencies:

```sh
git clone your-repo-link
cd your-repo-directory
yarn install
```
### Configuration

```sh
TELEGRAM_BOT_TOKEN=XXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXX
TELEGRAM_WEBHOOK_DOMAIN=test.domain.net
POSTGRES_PASSWORD=pass
POSTGRES_USER=admin
POSTGRES_DB=db
POSTGRES_PORT=23423
POSTGRES_HOST=localhost
WEB_URL=http://dest.domain.net/
```

### Running the bot

```sh
yarn dev
```

### Build for production

```sh
yarn build
```

### Project Structure
The project follows a monorepo pattern and includes the following directories:

app/backend: Contains the Telegram bot source code.
app/web: A simple Svelte web application that greets users.

### Utilities

- Node.js for the runtime environment.
- Telegraf for interacting with the Telegram Bot API.
- TypeORM for database management.
- Svelte for the web frontend.

### Deploying
The bot can be deployed on any Node.js compatible hosting service. Ensure the environment variables are set up in your hosting service's configuration.