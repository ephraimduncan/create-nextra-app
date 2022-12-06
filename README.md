# Create Nextra App

The easiest way to get started with Nextra is by using `create-nextra-app`. This CLI tool enables you to quickly start building a new Next.js based Nextra application, with everything set up for you. You can create a new app using the default Nextra template. To get started, use the following command:

```bash
npx create-nextra-app@latest
# or
yarn create nextra-app
# or
pnpm create nextra-app
```

Or, for a [Nextra Blog Theme](https://nextra.vercel.app/themes/blog)

```bash
npx create-nextra-app@latest --blog
# or
yarn create nextra-app --blog
# or
pnpm create nextra-app --blog
```

To create a new app in a specific folder, you can send a name as an argument. For example, the following command will create a new Next.js app called `blog-app` in a folder with the same name:

```bash
npx create-nextra-app@latest blog-app
# or
yarn create nextra-app blog-app
# or
pnpm create nextra-app blog-app
```
## Options

`create-nextra-app` comes with the following options:

- **--b, --blog** - Initialize as a Nextra Blog Theme.
- **--use-npm** - Explicitly tell the CLI to bootstrap the app using npm. To bootstrap using yarn we recommend to run `yarn create next-app`
- **--use-pnpm** - Explicitly tell the CLI to bootstrap the app using pnpm. To bootstrap using pnpm we recommend running `pnpm create next-app`

## Why use Create Nextra App?

`create-nextra-app` allows you to create a new Next.js based Nextra app within seconds. It includes a number of benefits:

- **Interactive Experience**: Running `npx create-nextra-app` (with no arguments) launches an interactive experience that guides you through setting up a project.
- **Zero Dependencies**: Initializing a project is as quick as one second. Create Nextra App has zero dependencies.
- **Offline Support**: Create Next App will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Tested**: The package is tested using the same integration test suite as Next.js itself, ensuring it works as expected with every release.
