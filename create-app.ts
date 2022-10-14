/* eslint-disable import/no-extraneous-dependencies */
import chalk from "chalk";
import cpy from "cpy";
import fs from "fs";
import os from "os";
import path from "path";
import { makeDir } from "./helpers/make-dir";
import { tryGitInit } from "./helpers/git";
import { install } from "./helpers/install";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import type { PackageManager } from "./helpers/get-pkg-manager";

export class DownloadError extends Error {}

export async function createApp({
  appPath,
  packageManager,
  blog,
}: {
  appPath: string;
  packageManager: PackageManager;
  blog?: boolean;
}): Promise<void> {
  const template = blog ? "blog" : "default-nextra";
  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error("It is likely you do not have write permissions for this folder.");
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  console.log(`Creating a new Nextra app in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  console.log(chalk.bold(`Using ${packageManager}.`));
  /**
   * Create a package.json for the new project.
   */
  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
  };
  /**
   * Write it to disk.
   */
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(packageJson, null, 2) + os.EOL);
  /**
   * These flags will be passed to `install()`.
   */
  const installFlags = { packageManager, isOnline };
  /**
   * Default dependencies.
   */
  let dependencies = ["react", "react-dom", "next", "nextra", "nextra-theme-docs"];

  if (blog) {
    dependencies = [
      "react",
      "react-dom",
      "next",
      "nextra",
      "nextra-theme-blog",
      "gray-matter",
      "rss",
    ];
  }
  /**
   * Install package.json dependencies if they exist.
   */
  if (dependencies.length) {
    console.log();
    console.log("Installing dependencies:");
    for (const dependency of dependencies) {
      console.log(`- ${chalk.cyan(dependency)}`);
    }
    console.log();

    // TODO: pause install for now

    await install(root, dependencies, installFlags);
    // console.log("Install Complete: TODO: Replace");
  }

  console.log();
  /**
   * Copy the template files to the target directory.
   */
  await cpy("**", root, {
    parents: true,
    cwd: path.join(__dirname, "templates", template),
    rename: (name) => {
      switch (name) {
        case "gitignore": {
          return ".".concat(name);
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log(`${chalk.green("Success!")} Created ${appName} at ${appPath}`);

  console.log();

  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
  console.log("    Starts the development server.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`));
  console.log("    Builds the app for production.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} start`));
  console.log("    Runs the built app in production mode.");
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(`  ${chalk.cyan(`${packageManager} ${useYarn ? "" : "run "}dev`)}`);
  console.log();
}
