# Notes for developers or contributors

## **Scripts**

These should usually be run in order.

**build**  
Compiles the typescript to javascript. The compiled JS is in `dist/`

**check-commands**
Check that the commands won't crash the build...

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

## Commands and Events

Each command and event is put in a separate file, which exports a `MyCommand` or
a `MyEvent` respectively.

Commands go in `src/commands/`, and events go in `src/events/`. When adding a
new command/event, remember to update
`src/commands/index.ts`/`src/events.index.ts` to include the new event in the
exported object/array.

After updating the name of a command/adding a new command, remember to run
`npm run deploy-commands` to push the changes.

## Style guide

- use common sense
- `// spaces after comment markers`
- descriptive variable names... most of the time
- write useful comments; don't write any if unneeded
