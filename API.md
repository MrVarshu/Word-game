# Word Game API Documentation

## Authentication

### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "username": "string (min 5 chars, unique)",
    "password": "string (min 5 chars, must contain letters, digits, and one of $%*@)"
  }
  ```
- **Response:**
  - `200 OK`: `"User registered successfully"`
  - `400 Bad Request`: `{ "error": "Username already exists" }` or validation error

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `200 OK`: `{ "token": "JWT token" }`
  - `400 Bad Request`: `{ "error": "Invalid credentials" }`

---

## Game

> All `/api/games/**` endpoints require `Authorization: Bearer <token>`

### Start New Game
- **POST** `/api/games/start`
- **Response:**
  - `200 OK`: Game object
  - `400 Bad Request`: `{ "error": "DAILY_LIMIT_REACHED" }` if daily limit reached

### Submit Guess
- **POST** `/api/games/{gameId}/guess`
- **Body:**
  ```json
  {
    "guess": "ABCDE"
  }
  ```
- **Response:**
  - `200 OK`:
    ```json
    {
      "id": 1,
      "guessWord": "ABCDE",
      "guessNumber": 1,
      "evaluation": "[{\"letter\":\"A\",\"color\":\"GREEN\"},...]",
      "createdAt": "2025-09-16T12:00:00",
      "gameStatus": "IN_PROGRESS|WON|LOST",
      "message": "string",
      "isGameOver": false,
      "attemptsLeft": 4
    }
    ```
  - `400 Bad Request`: `{ "error": "Game already ended" }` or validation error

### Get All Guesses for a Game
- **GET** `/api/games/{gameId}/guesses`
- **Response:**
  - `200 OK`:
    ```json
    [
      {
        "id": 1,
        "guessWord": "ABCDE",
        "guessNumber": 1,
        "evaluation": "[{\"letter\":\"A\",\"color\":\"GREEN\"},...]",
        "createdAt": "2025-09-16T12:00:00"
      }
    ]
    ```

### Get Game History
- **GET** `/api/games/history`
- **Response:**
  - `200 OK`:
    ```json
    [
      {
        "id": "1",
        "targetWord": "APPLE",
        "guesses": ["ABCDE", "APPLE"],
        "status": "WON|LOST|IN_PROGRESS",
        "startTime": "2025-09-16T12:00:00",
        "endTime": "2025-09-16T12:10:00"
      }
    ]
    ```

### Get Game Status
- **GET** `/api/games/status`
- **Response:**
  - `200 OK`:
    ```json
    {
      "dailyLimitReached": false,
      "hasIncompleteGame": true,
      "incompleteGameId": 1
    }
    ```

### Get Game Details
- **GET** `/api/games/{gameId}`
- **Response:**
  - `200 OK`:
    ```json
    {
      "id": 1,
      "wordToGuess": "APPLE",
      "gameStatus": "IN_PROGRESS|WON|LOST",
      "attempts": 2,
      "guesses": [
        { "guessWord": "ABCDE", "evaluation": "...", "guessNumber": 1 }
      ],
      "message": "string"
    }
    ```
  - `403 Forbidden`: `{ "error": "Access denied" }` if not your game

---

## Admin (No role restriction yet, but intended for admin use)

> All `/api/admin/**` endpoints require `Authorization: Bearer <token>`

### Daily Report
- **GET** `/api/admin/report/day?date=YYYY-MM-DD`
- **Response:**
  - `200 OK`:
    ```json
    {
      "date": 12345,
      "wins": 10,
      "uniquePlayers": 5
    }
    ```

### User Report
- **GET** `/api/admin/report/user/{userId}?date=YYYY-MM-DD`
- **Response:**
  - `200 OK`:
    ```json
    {
      "date": 12345,
      "gamesPlayed": 3
    }
    ```

---

**Note:**
- All endpoints (except `/api/auth/**`) require a valid JWT token in the `Authorization` header.
- Admin endpoints are not currently restricted by role, but can be secured if needed.
