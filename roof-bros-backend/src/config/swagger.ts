import fs from 'fs';
import swaggerJsdoc, {
  type OAS3Definition,
  type Components,
  type Tag,
  type Paths,
} from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import yaml from 'yamljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemasDir = path.resolve(__dirname, '../shared/schemas');

// Every *.yaml in src/shared/schemas is picked up, so adding a new spec file
// needs no change here.
const specFiles = fs
  .readdirSync(schemasDir)
  .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
  .filter((file) => file !== 'colorRoute.yaml')
  .sort()
  .map((file) => path.join(schemasDir, file));

const specDocs: OAS3Definition[] = specFiles.map((file) =>
  yaml.load(file),
) as OAS3Definition[];

const mergeSection = <K extends keyof Components>(
  _section: 'components',
  key: K,
): NonNullable<Components[K]> =>
  specDocs.reduce(
    (acc, doc) => ({ ...acc, ...(doc?.components?.[key] ?? {}) }),
    {} as NonNullable<Components[K]>,
  );

const paths: Paths = specDocs.reduce(
  (acc, doc) => ({ ...acc, ...(doc?.paths ?? {}) }),
  {} as Paths,
);

const tags: Tag[] = specDocs.flatMap((doc) => doc?.tags ?? []) as Tag[];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Roof Bros Backend API',
      version: '1.0.0',
      description: 'API documentation for the Roof Bros backend',
    },
    // Docs are served from /api/docs and the spec paths are written as
    // /v1/..., so requests from "Try it out" resolve to /api/v1/...
    servers: [
      {
        url: '/api',
        description: 'Current host',
      },
      {
        url: process.env.BETTER_AUTH_URL
          ? `${process.env.BETTER_AUTH_URL}/api`
          : 'https://roof-bros-backend-production.up.railway.app/api',
        description: 'Production / Configured URL',
      },
    ],
    tags,
    paths,
    components: {
      schemas: mergeSection('components', 'schemas'),
      responses: mergeSection('components', 'responses'),
      parameters: mergeSection('components', 'parameters'),
      securitySchemes: mergeSection('components', 'securitySchemes'),
    },
    // Endpoints opt in individually. A global requirement here would document
    // the public sign-in/sign-up routes as protected, which they are not.
  },
  // The spec files are merged into `definition` above. Handing them to
  // swagger-jsdoc as well makes it splice each file's root keys (`openapi`,
  // `info`, ...) into `paths`, so this stays empty. Point it at annotated
  // source files if JSDoc-based docs are ever added.
  apis: [] as string[],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * `withCredentials` lets "Try it out" send the HttpOnly session cookie, so the
 * protected routes are actually callable from the docs page after signing in.
 */
const swaggerUiOptions = {
  swaggerOptions: {
    withCredentials: true,
    persistAuthorization: true,
  },
  customSiteTitle: 'Roof Bros API Docs',
};

export { swaggerUi, swaggerSpec, swaggerUiOptions };
