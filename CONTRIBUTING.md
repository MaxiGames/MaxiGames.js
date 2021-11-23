# Guidelines for developers or contributors

## Style guide

-   USE COMMON SENSE
-   KEEP CODE AS SIMPLE AS POSSIBLE
-   Always use braces and semicolons
-   Split long strings: So instead of `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."`, do:

```
(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed " +
    "do eiusmod tempor incididunt ut labore et dolore magna " +
    "aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
    "ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis " +
    "aute irure dolor in reprehenderit in voluptate velit esse " +
    "cillum dolore eu fugiat nulla pariatur. Excepteur sint " +
    "occaecat cupidatat non proident, sunt in culpa qui officia " +
    "deserunt mollit anim id est laborum."`
)
```

-   Use `a[]` instead of `Array<a>`
-   Wrap case bodies in braces
-   Use `const` wherever possible, and `let` over `var` otherwise.
-   Use `camelCase` for variables, `PascalCase` for classes, types, interfaces,
    and enums.
-   Fully annoate function signatures, including return types (except for toplevel
    commands for which no-one really knows :p)
-   Try to avoid the use of `any` type.
-   Prefer async/await to promise callbacks
-   `// spaces after comment markers`
-   When only exporting one item, use a default export, otherwise named exports.
-   Always use ES module syntax
-   Use descriptive variable names. Use plural for arrays.
-   Write useful comments; don't write any if unneeded
-   Use JSDoc style comments for functions
-   One newline between file header and code begin; 4 newlines between chunks (e.g.
    imports and code); 2 newlines between blocks (e.g. functions)

---

## Git Guidelines

-   _NEVER force push unless in dire circumstances_.
-   _NEVER commit directly to master_.
-   Commit _early_ and _often_. You can interactive rebase to clean everything up
    before pushing.
-   Keep commits as small as possible, don't do a bunch of work then commit
    everything at once
-   Use descriptive commit messages.
-   When pulling, _rebase instead of merge_: `git pull --rebase`.
-   _Don't push incomplete/partial code to master or beta branch._ Understand that
    other people will be pulling those changes every once in a while, and if those
    changes include partial stuff, then they suddenly can't run their code anymore
    after pulling those changes.
-   _Don't merge beta/master into a feature branch_. Rebase instead.
-   Do all major features on a _feature branch_. In order to avoid merge conflicts later,
    frequently rebase the feature branch back onto master/beta:
    `git rebase master`.
-   You can merge small feature branches into Beta.

## Scripts

These should usually be run in order.

**build**  
Compiles the typescript to javascript. The compiled JS is in `dist/`

**check-commands** Check that the commands (probably) won't crash the build...

**deploy-commands**  
Deploys the commands to discord's servers. Run this after updating the name of a
command or when adding a new command.

**start**  
Runs the production code in `dist/`. Remember to build first!

# Required files

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

---

## serviceAccountKeys.json

You will also need a `serviceAccountKey-dev.json` in the root directory. The
serviceAccountKey should look something like this. You can get this from the
firebase project > Project Settings > Service Accounts > Create Key/Generate a
new private key.

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

---

## Commands and Events

Each command and event is put in a separate file, which exports an `MGCommand` or
`MGEvent` respectively.

Commands go in `src/commands/`, and events go in `src/events/`.

After updating the name of a command/adding a new command, remember to run
`npm run deploy-commands` to push the changes.

---

## Key Scripts/Commands to use:

1. `npm run build`: builds it using the `tsc` command and stores the js in a directory named `dist`
2. `npm run deploy-commands`: deploy the updated slash commands
3. `npm run buildStart`: builds it, deploys slash commands and runs the bot
