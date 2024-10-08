# Client Documentation

## Overview

This is the frontend of the project, providing a user interface for document collaboration. It uses React, TypeScript, and Vite to offer a responsive, real-time collaborative editing experience.

## Features

-   User authentication and authorization using JWT.

-   Real-time collaborative document editing.

-   Document versioning and rollback capabilities.

## Prerequisites

-   Node.js

-   Vite

## Installation

1.  **Install dependencies**:

```bash

yarn  install

```

2.  **Set up environment variables**:

Create a `.env` file using the template `.env.example`:

```bash

VITE_API_URL=http://localhost:5001

```

3.  **Run the development server**:

```bash

yarn  dev

```

## Building for Production

To build the project for production:

```bash

yarn  build

```

## Testing

To run tests using Vitest:

```bash

yarn  test

```

## Folder Structure

-   `src`: Contains all the source code.

-   `pages`: Different pages of the application (e.g., login, document list, etc.).

-   `components`: Reusable UI components.

-   `hooks`: Custom React hooks.

-   `api`: Functions for interacting with the API.

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
