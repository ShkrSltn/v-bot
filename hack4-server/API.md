# API Instructions:

This document provides instructions for testing the application's API endpoints using Postman.

## Authentication Endpoints

### Register a New User

- **Method**: POST
- **URL**: `http://localhost:3000/auth/register`
- **Body** (JSON):

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

- **Response**: Returns an access token that should be used for authenticated requests

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

### Login

- **Method**: POST
- **URL**: `http://localhost:3000/auth/login`
- **Body** (JSON):

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

- **Response**: Returns an access token and user ID

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

### Get User Profile

- **Method**: GET
- **URL**: `http://localhost:3000/auth/profile`
- **Headers**:
  - Authorization: `Bearer {your_access_token}`
- **Response**: Returns user information from the JWT token

```json
{
  "sub": 1,
  "email": "test@example.com",
  "iat": 1699123456,
  "exp": 1699127056
}
```

## User Profile Endpoints

### Update User Profile

- **Method**: PUT
- **URL**: `http://localhost:3000/users/profile`
- **Headers**:
  - Authorization: `Bearer {your_access_token}`
- **Body** (JSON):

```json
{
  "name": "Updated Name",
  "age": 35,
  "jobTitle": "Software Developer",
  "maritalStatus": "Married",
  "address": "123 Main St"
}
```

- **Response**: Returns updated user profile

```json
{
  "status": "profile_updated",
  "user": {
    "userId": 1,
    "name": "Updated Name",
    "email": "test@example.com",
    "address": "123 Main St",
    "jobTitle": "Software Developer",
    "age": 35,
    "maritalStatus": "Married",
    "financialGoal": null
  }
}
```

### Set Financial Goal

- **Method**: PUT
- **URL**: `http://localhost:3000/users/financial-goal`
- **Headers**:
  - Authorization: `Bearer {your_access_token}`
- **Body** (JSON):

```json
{
  "goal": "I want to save $50,000 for a down payment on a house within the next 3 years"
}
```

- **Response**: Returns confirmation of the updated goal

```json
{
  "status": "goal_updated",
  "financialGoal": "I want to save $50,000 for a down payment on a house within the next 3 years"
}
```

### Get Financial Goal

- **Method**: GET
- **URL**: `http://localhost:3000/users/financial-goal`
- **Headers**:
  - Authorization: `Bearer {your_access_token}`
- **Response**: Returns the user's financial goal

### Delete Financial Goal

- **Method**: DELETE
- **URL**: `http://localhost:3000/users/financial-goal`
- **Headers**:
  - Authorization: `Bearer {your_access_token}`
- **Response**: Returns status code 204 (No Content) if successful

## AI Recommendation Endpoint

### Get Financial Recommendation

- **Method**: POST
- **URL**: `http://localhost:3000/ai/recommendations/{userId}`
- **Headers**:
  - Authorization: `Bearer {your_access_token}`
- **Body** (JSON, optional):

```json
{
  "maxTokens": 500,
  "temperature": 0.8
}
```

- **Response**: Returns AI-generated financial recommendation based on user profile and goal

```json
{
  "recommendation": "Based on your financial goals, we've prepared the following recommendation:\n\nSHORT-TERM STEPS:\n1. Create a dedicated savings account specifically for your house down payment\n2. Set up automatic transfers of $1,400 per month to reach your $50,000 goal in 3 years\n3. Review your current budget to identify areas where you can reduce spending\n\nMEDIUM-TERM STRATEGIES:\n1. Consider a high-yield savings account or CD ladder for your down payment funds\n2. Look into first-time homebuyer programs that might reduce the required down payment\n3. Start researching neighborhoods and housing markets in your target area\n\nLONG-TERM CONSIDERATIONS:\n1. Build an emergency fund separate from your down payment savings\n2. Maintain or improve your credit score to qualify for better mortgage rates\n3. Consider how homeownership will affect your overall financial plan\n\nStay focused on your goal, track your progress monthly, and adjust your savings rate if needed. You're making a great decision to plan ahead for this important purchase!\n\nPoppy AI Advisor"
}
```
