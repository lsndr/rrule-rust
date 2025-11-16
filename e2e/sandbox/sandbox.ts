import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { rimrafSync } from 'rimraf';
import * as path from 'path';

export interface SandboxOptions {
  esm?: boolean;
  cpu?: string[];
}

export class Sandbox {
  private readonly projectPath: string;
  private readonly esm: boolean;
  private readonly cpu: string[];

  public constructor(options?: SandboxOptions) {
    this.projectPath = path.resolve(__dirname, 'app');
    this.esm = options?.esm ?? false;
    this.cpu = options?.cpu ?? [];
  }

  public install(): void {
    rimrafSync(path.resolve(this.projectPath));
    mkdirSync(this.projectPath);
    execSync(`npm init -y`, { cwd: this.projectPath });

    if (this.esm) {
      execSync(`npm pkg set type=module`, { cwd: this.projectPath });
    }

    let cmd = `npm install rrule-rust@${this.getVersion()}`;

    if (this.cpu.length > 0) {
      cmd += ` --cpu ${this.cpu.join(' --cpu ')}`;
    }

    execSync(cmd, {
      cwd: this.projectPath,
    });
  }

  public uninstall(): void {
    rimrafSync(path.resolve(this.projectPath));
  }

  public run<T>(code: () => T): T {
    writeFileSync(
      path.resolve(this.projectPath, 'index.js'),
      `
      ${
        this.esm
          ? `import * as lib from 'rrule-rust';`
          : `const lib = require('rrule-rust');`
      }

    const code = ${code.toString().replaceAll('__vite_ssr_import_0__', 'lib')};

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
