# Project Name

Acentis Collaborative Editor

## Overview

This project provides a collaborative platform for editing documents in real time. It consists of two main parts:

-   **API**: The backend, responsible for managing users, documents, and version control.

-   **Client**: The frontend, providing an interface for users to interact with the platform.

## Features

-   Real-time document collaboration using WebSocket and Yjs.

-   JWT-based user authentication and authorization.

-   Document versioning with the ability to rollback changes.

## Technology Stack

-   **Frontend**: React, TypeScript, Vite.

-   **Backend**: Node.js, Express, MongoDB, Hocuspocus WebSocket server.

-   **Testing**: Vitest (frontend), Jest (backend).

## Setup Instructions

### Prerequisites

-   Node.js

-   Yarn or npm

-   MongoDB

### Setup

1.  **Clone the repository**:

```bash

git clone <repository-url>

cd <project-directory>

```

2.  **Set up environment variables**:

Create a `.env` file in both the `api` and `client` directories using the provided `.env.example` files.

3.  **Install dependencies**:

-   Backend (API):

```bash

cd api

yarn install

```

-   Frontend (Client):

```bash

cd client

yarn install

```

4.  **Run the development servers**:

-   Backend (API):

```bash

cd api

yarn start

```

-   Frontend (Client):

```bash

cd client

yarn dev

```

## Testing

1.  **API Tests**:

-   Run Jest tests:

```bash

cd api

yarn test

```

2.  **Client Tests**:

-   Run Vitest tests:

```bash

cd client

yarn test

```

MIT License

Copyright (c) 2024 [Your Name]

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
