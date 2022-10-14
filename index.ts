#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import chalk from "chalk";
import Commander from "commander";
import path from "path";
import prompts from "prompts";
import checkForUpdate from "update-check";
import { createApp, DownloadError } from "./create-app";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";

let projectPath: string = "";

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "--ts, --typescript",
    `

  Initialize as a TypeScript project.
`
  )
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the app using npm
`
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the app using pnpm
`
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.useNpm ? "npm" : !!program.usePnpm ? "pnpm" : getPkgManager();

async function run(): Promise<void> {
  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  // It runs when the response path has not been set
  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green("my-next-app")}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    );

    problems!.forEach((p) => console.error(`    ${chalk.red.bold("*")} ${p}`));
    process.exit(1);
  }

  try {
    await createApp({
      appPath: resolvedProjectPath,
      packageManager,
      typescript: program.typescript,
    });
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason;
    }
    // NO IDEA why createApp is being called again after there is a error
    await createApp({
      appPath: resolvedProjectPath,
      packageManager,
      typescript: program.typescript,
    });
  }
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add create-nextra-app"
          : packageManager === "pnpm"
          ? "pnpm add -g create-nextra-app"
          : "npm i -g create-nextra-app";

      console.log(
        chalk.yellow.bold("A new version of `create-nextra-app` is available!") +
          "\n" +
          "You can update by running: " +
          chalk.cyan(updateMessage) +
          "\n"
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(chalk.red("Unexpected error. Please report it as a bug:") + "\n", reason);
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
