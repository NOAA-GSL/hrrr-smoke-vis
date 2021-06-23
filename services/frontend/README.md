# HRRR Smoke Vis Frontend

The service that provides the user interface for the HRRR Smoke Vis project.

Requires **[Node 14.17](https://nodejs.dev/)**

## Development

To run the frontend locally, you'll need to create a `.env` file with your environment variables.

```
NODE_ENV=development
DEBUG=HRRRSmoke*
```

Then you can run the server with `npm run dev`. By default the server listens on port 3000. You can change which port it uses by adding `HTTP_PORT` to your `.env` file.

### Tests

Tests are run with [Cypress](https://cypress.io). You can start up the Cypress UI with `npm run cy:open`. For development, you can run

```
npm run dev & npm run cy:open
```

to start both the development server and the Cypress UI.

In addition to test specs in the `cypress/` directory, we lint our JavaScript with [ESLint](https://eslint.org/) and format it using [Prettier](https://prettier.io/). Cypress, ESLint, and Prettier are all run when you run `npm test`.
