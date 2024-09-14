# API Documentation

## Overview

This is the backend of the project, responsible for managing the database, authentication, real-time collaboration using WebSocket, and document versioning.

## Features

-   JWT-based authentication.

-   Document management: create, update, delete, and version control.

-   WebSocket integration using Hocuspocus and Yjs for real-time collaboration.

## Prerequisites

-   Node.js

-   MongoDB

## Installation

1.  **Install dependencies**:

```bash
yarn install
```

2.  **Set up environment variables**:

Create a `.env` file using the template `.env.example`:

```bash
PORT=5001
MONGODB_URI=<Your  MongoDB  URI>
JWT_SECRET=<Your  JWT  secret>
```

3.  **Run the server**:

```bash
yarn start
```

## Testing

To run the tests:

```bash
yarn  test
```

## API Endpoints

-   **Authentication**

-   `POST /api/auth/register`: Register a new user.

-   `POST /api/auth/login`: Log in a user and return a JWT token.

-   **Documents**

-   `GET /api/documents`: Get a list of documents.

-   `POST /api/documents`: Create a new document.

-   `PUT /api/documents/:id`: Update a document.

-   `DELETE /api/documents/:id`: Delete a document (only by creator).

-   **WebSocket for Collaboration**

-   The WebSocket server runs on `ws://localhost:5001` and handles real-time document collaboration using Yjs.

MIT License

Copyright (c) 2024 Daniel Campos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
