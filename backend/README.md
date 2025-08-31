# Backend - My Simple Wallet

## API Documentation

### Authentication

*   **POST** `/api/auth/register`
    *   **Description:** Registers a new user.
    *   **Request Body:** `UserRequestCreate`
*   **POST** `/api/auth/login`
    *   **Description:** Authenticates a user and returns a JWT token.
    *   **Request Body:** `LoginRequest`
*   **POST** `/api/auth/refresh`
    *   **Description:** Refreshes a JWT token.
    *   **Request Body:** `RefreshRequest`
*   **POST** `/api/auth/logout`
    *   **Description:** Logs out the user and clears the session.

### Users

*   **GET** `/api/users/me`
    *   **Description:** Returns the currently logged-in user's information.
*   **PUT** `/api/users/me`
    *   **Description:** Updates the currently logged-in user's information.
    *   **Request Body:** `UserRequestUpdate`
*   **PATCH** `/api/users/me/parent`
    *   **Description:** Updates the parent of the currently logged-in user.
    *   **Request Body:** `UserRequestUpdateParent`
*   **PATCH** `/api/users/me/password`
    *   **Description:** Updates the password of the currently logged-in user.
    *   **Request Body:** `UserRequestUpdatePassword`
*   **GET** `/api/users/me/parent`
    *   **Description:** Returns all users that have the currently logged-in user as a parent.
*   **GET** `/api/users/{id}`
    *   **Description:** Returns a user by their ID.
    *   **Path Variable:** `id` (String)
*   **PATCH** `/api/users/{childId}/parent`
    *   **Description:** Updates the parent of a child user.
    *   **Path Variable:** `childId` (String)
    *   **Request Body:** `UserRequestUpdateChildParent`

### Accounts

*   **POST** `/api/accounts`
    *   **Description:** Creates a new account.
    *   **Request Body:** `AccountRequest`
*   **GET** `/api/accounts`
    *   **Description:** Returns a list of accounts for the logged-in user.
    *   **Query Parameter:** `isParent` (Boolean, optional) - If true, returns accounts for the entire family.
*   **GET** `/api/accounts/{id}`
    *   **Description:** Returns an account by its ID.
    *   **Path Variable:** `id` (Long)
*   **PUT** `/api/accounts/{id}`
    *   **Description:** Updates an account.
    *   **Path Variable:** `id` (Long)
    *   **Request Body:** `AccountRequest`
*   **DELETE** `/api/accounts/{id}`
    *   **Description:** Deletes an account.
    *   **Path Variable:** `id` (Long)

### Categories

*   **POST** `/api/categories`
    *   **Description:** Creates a new category.
    *   **Request Body:** `CategoryRequest`
*   **GET** `/api/categories`
    *   **Description:** Returns a list of categories for the logged-in user.
    *   **Query Parameter:** `isParent` (Boolean, optional) - If true, returns categories for the entire family.
*   **GET** `/api/categories/{id}`
    *   **Description:** Returns a category by its ID.
    *   **Path Variable:** `id` (Long)
*   **PUT** `/api/categories/{id}`
    *   **Description:** Updates a category.
    *   **Path Variable:** `id` (Long)
    *   **Request Body:** `CategoryRequest`
*   **DELETE** `/api/categories/{id}`
    *   **Description:** Deletes a category.
    *   **Path Variable:** `id` (Long)

### Transactions

*   **POST** `/api/transactions`
    *   **Description:** Creates a new transaction.
    *   **Request Body:** `TransactionRequest`
*   **GET** `/api/transactions`
    *   **Description:** Returns a paginated list of transactions for the logged-in user.
    *   **Query Parameters:**
        *   `isParent` (Boolean, optional, default: `false`) - If true, returns transactions for the entire family.
        *   `page` (Integer, optional) - Page number.
        *   `size` (Integer, optional) - Page size.
        *   `sort` (String, optional) - Sort order.
*   **GET** `/api/transactions/{id}`
    *   **Description:** Returns a transaction by its ID.
    *   **Path Variable:** `id` (Long)
*   **PUT** `/api/transactions/{id}`
    *   **Description:** Updates a transaction.
    *   **Path Variable:** `id` (Long)
    *   **Request Body:** `TransactionRequest`
*   **DELETE** `/api/transactions/{id}`
    *   **Description:** Deletes a transaction.
    *   **Path Variable:** `id` (Long)
*   **PATCH** `/api/transactions/{id}/effective`
    *   **Description:** Marks a transaction as effective.
    *   **Path Variable:** `id` (Long)
    *   **Request Body:** `TransactionEffectivationRequest`
*   **POST** `/api/transactions/batch`
    *   **Description:** Creates a batch of transactions (e.g., for installments).
    *   **Request Body:** `TransactionRequestWithInstallment`
*   **GET** `/api/transactions/month`
    *   **Description:** Returns a paginated list of transactions for a given month.
    *   **Query Parameters:**
        *   `isParent` (Boolean, optional, default: `false`) - If true, returns transactions for the entire family.
        *   `startDate` (String) - Start date of the month (e.g., "2025-08-01").
        *   `endDate` (String) - End date of the month (e.g., "2025-08-31").
        *   `page` (Integer, optional) - Page number.
        *   `size` (Integer, optional) - Page size.
        *   `sort` (String, optional) - Sort order.

### Loans

*   **POST** `/api/loan`
    *   **Description:** Creates a new loan.
    *   **Request Body:** `LoanRequest`

### Health Check

*   **GET** `/api/health`
    *   **Description:** Returns the health status of the API.