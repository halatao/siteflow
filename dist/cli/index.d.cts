#!/usr/bin/env node
import { Command } from 'commander';

declare function createProgram(): Command;
declare function main(argv?: string[]): Promise<void>;

export { createProgram, main };
