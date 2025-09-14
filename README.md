# Wordgame - Full Stack Wordle Clone

A complete Wordle game implementation with Spring Boot backend and React frontend.

## Project Structure

```
wordgame/
├── backend/           # Spring Boot REST API
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
├── frontend/          # React TypeScript App
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Technology Stack

### Backend
- **Spring Boot 3.5.5** - REST API framework
- **Spring Security** - JWT authentication
- **Spring Data JPA** - Database ORM
- **H2 Database** - In-memory database
- **Maven** - Build tool

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Features

- 🔐 **User Authentication** - JWT-based login/register
- 🎮 **Wordle Game Logic** - 6 attempts, 5-letter words
- 🎨 **Color-coded Feedback** - Green/Orange/Grey letter evaluation
- ⌨️ **Virtual Keyboard** - Click or type to play
- 📱 **Responsive Design** - Works on all devices
- 👑 **Admin Dashboard** - View game statistics and reports

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- npm or yarn

### Running the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8088`

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Game
- `POST /api/game/start` - Start new game
- `POST /api/game/guess` - Submit word guess
- `GET /api/game/current` - Get current game state

### Admin
- `GET /api/admin/reports` - Get daily reports (Admin only)

## Game Rules

1. Guess the 5-letter word in 6 attempts
2. Each guess must be a valid 5-letter word
3. After each guess, tiles change color:
   - 🟩 **Green**: Letter is correct and in right position
   - 🟨 **Orange**: Letter is in word but wrong position
   - ⬜ **Grey**: Letter is not in the word

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.