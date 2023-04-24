# Chat Application

This is a simple chat application that allows users to send messages to each other in real-time.

## Features

- Feature 1: Real-time messaging: Users can send messages to each other and receive them in real-time without the need to refresh the page.
- Feature 2: User authentication: Users must create an account or log in before they can start using the chat application.
- Feature 3: Online status: Users can see when other users are online and available to chat.
- Feature 4: Notifications: Users receive notifications when they receive a new message or when another user comes online.

## Technologies Used

Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine.

Express.js: A web application framework for Node.js.

MongoDB: A NoSQL database that stores user data and chat messages.

Tailwind CSS: A front-end framework for building responsive, mobile-first websites.

## Installation

To install this project, follow these steps:

1. Clone the repository: `git clone https://github.com/nbautsta/Chat-App.git`
2. Install dependencies: `npm install`

    API dependencies:
    "bcryptjs": "^2.4.3",
    "bson": "4.2.2",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.4",
    "ws": "^8.13.0"

    CLIENT dependencies:
    "autoprefixer": "^10.4.14",
    "axios": "^1.3.5",
    "bcryptjs": "^2.4.3",
    "lodash": "^4.17.21",
    "postcss": "^8.4.22",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.1"

3. Create a .env file and add your MongoDB URI and session secret:

    `MONGO_URL="mongodb+srv://admin:<password>@clusterbatch248.jeupjjp.mongodb.net/?retryWrites=true&w=majority"

    JWT_SECRET ="chatappapi"

    CLIENT_URL="http://127.0.0.1:5173"`

4. Run the project: 
      api: `nodemon start`
      client: `yarn dev`

## Usage

To use this project, follow these steps:

1. Open your browser and go to `http://127.0.0.1:5173`
2. Login with your credentials or create a new account
3. Use the interface to interact with the application