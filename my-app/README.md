## Online Marketplace

A React and Node.js marketplace application for clients and freelancers. Clients can browse listings, submit requests, track orders, message freelancers, and leave reviews. Freelancers can create listings, manage requests, update order progress, and view payout information.

## Technology

- React 19 with Vite
- Express 5 and Node.js
- MySQL 8+
- Tailwind CSS and Lucide React

## Project Structure

```text
my-app/
  src/                 React frontend
  server/              Express API and database scripts
  public/              Static frontend assets
```

## Requirements

- Node.js 18 or newer
- npm
- MySQL 8 or newer

## Database Setup

1. From the `my-app/` directory, create the database, tables, triggers, and seed data:

	```bash
	mysql -u root -p < server/setup.sql
	```

	The script creates the `fiverr_clone` database, restores the application tables and indexes, loads the supplied sample data, and recreates the database triggers.

2. Create `server/.env` with the credentials for the MySQL account that owns the database:

	```env
	DB_HOST=localhost
	DB_USER=appuser
	DB_PASSWORD=your_mysql_password
	DB_NAME=fiverr_clone
	DB_PORT=3306
	```

	Do not commit `.env` or real passwords.

## Install Dependencies

Install frontend dependencies:

```bash
cd my-app
npm install
```

Install backend dependencies:

```bash
cd my-app/server
npm install
```

## Run Locally

Open two terminals from the `my-app` directory.

Terminal 1, start the API on port 5000:

```bash
cd server
npm start
```

Terminal 2, start the Vite frontend on port 5173:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend sends API requests to `http://localhost:5000`.

## Available Scripts

From `my-app/`:

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

From `my-app/server/`:

- `npm start` starts the Express server with nodemon.

## Notes

- Message history is stored as CSV files in `server/messages/`.
- Existing database data is not included in this repository.
- For a production deployment, configure CORS, use a restricted database user, and store secrets in the hosting provider's environment settings.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
