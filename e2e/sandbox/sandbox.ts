import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { rimrafSync } from 'rimraf';
import * as path from 'path';

export class Sandbox {
  private readonly projectPath: string = path.resolve(__dirname, 'app');

  install(version: string) {
    rimrafSync(path.resolve(this.projectPath));
    mkdirSync(this.projectPath);
    execSync(`npm init -y`, { cwd: this.projectPath });
    execSync(`npm install rrule-rust@${version}`, { cwd: this.projectPath });
  }

  uninstall() {
    rimrafSync(path.resolve(this.projectPath));
  }

  run<T>(code: () => T): T {
    writeFileSync(
      path.resolve(this.projectPath, 'index.js'),
      `
    const src_1 = require('rrule-rust');

    const code = ${code.toString()}; 

    console.log(JSON.stringify(code()));
`,
    );

    try {
      return JSON.parse(
        execSync('node index.js', { cwd: this.projectPath }).toString(),
      );
    } finally {
      rmSync(path.resolve(this.projectPath, 'index.js'));
    }
  }
}
