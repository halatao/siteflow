#!/usr/bin/env node
import { Command } from "commander";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerInitCommand } from "./commands/init.js";
import { registerValidateCommand } from "./commands/validate.js";

export function createProgram(): Command {
  const program = new Command();

  program.name("siteflow").description("Siteflow connector CLI");
  registerInitCommand(program);
  registerValidateCommand(program);
  registerDoctorCommand(program);

  return program;
}

export async function main(argv = process.argv): Promise<void> {
  await createProgram().parseAsync(argv);
}

const invokedPath = process.argv[1]?.replace(/\\/g, "/") ?? "";

if (
  invokedPath.endsWith("/cli/index.js") ||
  invokedPath.endsWith("/cli/index.cjs") ||
  invokedPath.endsWith("/cli/index.ts") ||
  invokedPath.endsWith("/siteflow") ||
  invokedPath.endsWith("/siteflow.cmd")
) {
  void main();
}
