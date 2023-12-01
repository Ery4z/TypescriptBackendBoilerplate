# TypescriptBackendBoilerplate

## Introduction

Setting up a robust and scalable TypeScript project for backend development can be challenging. This project aims to streamline the process by providing a clean, well-structured TypeScript API backend. It comes equipped with a range of features and functionalities that are essential for modern backend development.

## Features

- **Unit Testing**: Integrated with Jest for comprehensive and efficient testing.
- **Build Utility Scripts**: Simplified scripts for building and managing the project.
- **Configured TypeScript Build Pipeline**: Pre-configured to get you started with minimal setup.
- **User Management System**: A fully functional user management system, including features like:
  - User creation, update, and soft deletion
  - JWT-based user authentication
  - Password recovery with hashed storage
  - Email verification
- **Database Abstraction Layer**: Abstracts the underlying database, allowing easy switching between MongoDB and SQLServer with minimal code changes.
- **Database Flexibility**: Easily switch between MongoDB and SQLServer databases.

## Getting Started

### Prerequisites

To run this project, you'll need Node.js and npm installed on your machine.

### Setup

1. **Clone the Repository**: `git clone https://github.com/Ery4z/TypescriptBackendBoilerplate.git`
2. **Navigate to Project Directory**: `cd TypescriptBackendBoilerplate`
3. **Install Dependencies**: `npm install`

### Configuration

Create a `.env` file based on the `template.env` file. Fill in the necessary secrets and configurations.

### Running the Project

- `npm run test`: Run the Jest tests.
- `npm run dev-server`: Start the development server with `tsc-watch`.
- `npm run build`: Build the project for production.

## Database Configuration

### Switching Database Types

To switch the database type used for the user service, modify the `./src/services/database.service.ts` file:

**For SQLServer:**

```typescript
databaseServiceUser = await createDatabaseServiceUser({
    databaseType: "SQLServer"
});
```

**For MongoDB:**

```typescript
databaseServiceUser = await createDatabaseServiceUser({
    databaseType: "MongoDB"
});
```

### Adding a New Database Connector

To add a new database option for the User management service:
1. Create the model files (`users.<new_database>.ts`, `emailValidators.<new_database>.ts`, `passwordRecovery.<new_database>.ts`) in `./src/models`.
2. Implement the `IDatabaseServerUser` interface in `./src/service/<new_database>/<new_database>ServiceUser.ts`.
3. Ensure that each `insert...` method in `IDatabaseServerUser` returns the ID of the inserted object.
4. Each model should have utility functions for converting between the internal database structure and the generic backend structure.

**Note:** The generic backend structure uses `_id` as a `string` to ensure database-agnostic handling of objects.

## Contributing

Contributions are welcome! Here are some areas where you can help:

- Adding examples for other database services.
- Expanding unit tests.
- Refactoring the project structure for better organization and scalability.

To contribute, feel free to fork the repository and submit pull requests.
