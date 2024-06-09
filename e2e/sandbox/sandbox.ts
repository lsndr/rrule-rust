import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { rimrafSync } from 'rimraf';
import * as path from 'path';

export type SandboxOptions = {
  esm: boolean;
};

export class Sandbox {
  private readonly projectPath: string;
  private readonly esm: boolean;
  constructor(options: SandboxOptions) {
    this.projectPath = path.resolve(__dirname, 'app');
    this.esm = options.esm;
  }

  install() {
    rimrafSync(path.resolve(this.projectPath));
    mkdirSync(this.projectPath);
    execSync(`npm init -y`, { cwd: this.projectPath });

    if (this.esm) {
      execSync(`npm pkg set type=module`, { cwd: this.projectPath });
    }

    execSync(`npm install rrule-rust@${this.getVersion()}`, {
      cwd: this.projectPath,
    });
  }

  uninstall() {
    rimrafSync(path.resolve(this.projectPath));
  }

  run<T>(code: () => T): T {
    writeFileSync(
      path.resolve(this.projectPath, 'index.js'),
      `
      ${
        this.esm
          ? `import * as src_1 from 'rrule-rust';`
          : `const src_1 = require('rrule-rust');`
      }

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

  private getVersion() {
    const version = process.env['E2E_LIBRARY_VERSION'];

    if (!version) {
      throw new Error('E2E_LIBRARY_VERSION is required');
    }

    return version;
  }
}
