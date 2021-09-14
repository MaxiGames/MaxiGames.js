# Notes for developers or contributors

## Style guide

- Use common sense
- Use `string[]` instead of `Array<string>`
- Use `let` instead of `var`, and `const` whenever possible
- Use `camelCase` for variables, `PascalCase` for classes, types, interfaces,
  enums.
- `// spaces after comment markers`
- When only exporting one item, use a default export, otherwise named exports.
- Always use ES module syntax
- Descriptive variable names... most of the time
- Write useful comments; don't write any if unneeded

## Git Guidelines

- _NEVER force push unless dire circumstances_.
- _NEVER commit directly to master_.
- Commit _early_ and _often_. You can interactive rebase to clean everything up
  before pushing.
- Keep commits as small as possible, don't do a bunch of work then commit
  everything at once
- Use descriptive commit messages.
- When pulling, _rebase instead of merge_: `git pull --rebase`.
- _Don't push incomplete/partial code to master or beta branch._ Understand that
  other people will be pulling those changes every once in a while, and if those
  changes include partial stuff, then they suddenly can't run their code anymore
  after pulling those changes.
- _Don't merge beta/master into a feature branch_. Rebase instead.
- Do everything on a _feature branch_. In order to avoid merge conflicts later,
  frequently rebase the feature branch back onto master/beta:
  `git rebase master`.

## Scripts

These should usually be run in order.

**build**  
Compiles the typescript to javascript. The compiled JS is in `dist/`

**check-commands** Check that the commands won't crash the build...

**deploy-commands**  
Deploys the commands to discord's servers. Run this after updating the name of a
command or when adding a new command.

**start**  
Runs the production code in `dist/`. Remember to build first!

## config.json

You need a `config-dev.json` in the root directory (same directory as this file)
in order to run this. The `config-*.json` looks something like this.

```json
{
  "tokenId": "xxx",
  "guildId": "xxx",
  "clientId": "xxx"
}
```

In development, the bot uses `config-dev.json`, and in production it uses
`config-prod.json`. It determines prod vs dev via the `NODE_ENV` environment
variable.

## serviceAccountKeys.json

You will also need a `serviceAccountKey-dev.json` in the root directory.
The serviceAccountKey should look something like this. You can get this from the firebase project > Project Settings > Service Accounts > Create Key/Generate a new private key.

```json
{
  "type": "xxx",
  "project_id": "xxx",
  "private_key_id": "xxx",
  "private_key": "xxx",
  "client_email": "xxx",
  "client_id": "114283896720536374549",
  "auth_uri": "xxx",
  "token_uri": "xxx",
  "auth_provider_x509_cert_url": "xxx",
  "client_x509_cert_url": "xxx"
}
```

## Commands and Events

Each command and event is put in a separate file, which exports a `MyCommand` or
a `MyEvent` respectively.

Commands go in `src/commands/`, and events go in `src/events/`. When adding a
new command/event, remember to update
`src/commands/index.ts`/`src/events.index.ts` to include the new event in the
exported object/array.

After updating the name of a command/adding a new command, remember to run
`npm run deploy-commands` to push the changes.

# Command to run to initialise Firebase (temporary)

- For neon_paradox: GOOGLE_APPLICATION_CREDENTIALS=/Users/wenyuan/Documents/GitHub/MaxiGames.js/serviceAccountKey-dev.json npm run start
