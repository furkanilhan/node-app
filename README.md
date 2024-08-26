# Node App

This is a Node.js application using TypeScript, ESLint, and Prettier for code quality and formatting. The application connects to a PostgreSQL database using Docker.

## Prerequisites

- Node.js (v18.x or higher)
- Docker and Docker Compose

## Getting Started

### 1. Clone the Repository

Clone this repository to your local machine:

```
git clone https://github.com/furkanilhan/node-app.git
cd node-app
```

### 2. Install Dependencies

Install the necessary dependencies using npm:

```
npm install
```

### 3. TypeScript Configuration

The TypeScript configuration file `tsconfig.json` is already set up to compile TypeScript files from the `src` directory to the `dist` directory. You can customize the configuration as needed.

### 4. Run the Application

#### 4.1 Build the Project

Compile the TypeScript code:

```
npm run build
```

#### 4.2 Start the Application

To start the application:

```
npm start
```

This will run the compiled JavaScript file from the `dist` directory.

### 5. Set Up the Database

The application uses PostgreSQL, which is managed through Docker Compose. To start the PostgreSQL database, use the following command:

```
docker-compose up -d
```

This command will start the PostgreSQL container with the specified configuration from the `docker-compose.yml` file.

### 6. Database Initialization

The Docker setup includes an `initdb` directory to initialize the database with scripts. Ensure any necessary SQL scripts for setting up tables or inserting data are placed in the `initdb` directory.

### 7. Lint and Format Code

The project uses ESLint and Prettier to maintain code quality and formatting. Use the following commands to lint and format the code:

#### Lint Code

To lint the code using ESLint:

```
npm run lint
```

#### Format Code

To format the code using Prettier:

```
npm run format
```

### 8. Running Tests

To run tests, use the following command (update the command if tests are implemented):

```
npm test
```

### Notes

- Ensure Docker and Docker Compose are installed and running on your machine.
- The PostgreSQL database credentials and configurations are defined in the `docker-compose.yml` file. Modify them as needed.
- The `initdb` folder contains SQL scripts for initializing the database on the first run.


