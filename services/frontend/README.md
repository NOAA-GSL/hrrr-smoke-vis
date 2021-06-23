# HRRR Smoke Vis Frontend

The service that provides the user interface for the HRRR Smoke Vis project.

## Development

To run the frontend locally, you'll need to create a `.env` file with your environment variables.

```
NODE_ENV=development
DEBUG=HRRRSmoke*
```

Then you can run the server with `npm run dev`. By default the server listens on port 3000. You can change which port it uses by adding `HTTP_PORT` to your `.env` file.
