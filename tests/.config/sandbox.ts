import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { rimrafSync } from 'rimraf';
import isCi from 'is-ci';
import * as path from 'path';

export interface SandboxOptions {
  esm?: boolean;
  cpu?: string[];
}

export interface RunOptions {
  env?: Record<string, string | undefined>;
}

export class Sandbox {
  private readonly projectPath: string;
  private readonly esm: boolean;

  public constructor(options?: SandboxOptions) {
    this.projectPath = path.resolve(__dirname, 'sandbox');
    this.esm = options?.esm ?? false;
  }

  public install(): void {
    rimrafSync(path.resolve(this.projectPath));
    mkdirSync(this.projectPath);
    execSync(`npm init -y`, { cwd: this.projectPath });

    if (this.esm) {
      execSync(`npm pkg set type=module`, { cwd: this.projectPath });
    }

    const cmd = `npm install rrule-rust@${this.getVersion()}`;

    execSync(cmd, {
      cwd: this.projectPath,
    });
  }

  public uninstall(): void {
    rimrafSync(path.resolve(this.projectPath));
  }

  public run<T>(code: () => T, options?: RunOptions): T {
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
        execSync('node index.js', {
          cwd: this.projectPath,
          env: {
            ...process.env,
            ...options?.env,
          },
        }).toString(),
      );
    } finally {
      rmSync(path.resolve(this.projectPath, 'index.js'));
    }
  }

  private getVersion() {
    let version = process.env['E2E_LIBRARY_VERSION'];

    if (!version) {
      if (isCi) {
        throw new Error('E2E_LIBRARY_VERSION is required');
      }

      console.warn(
        'E2E_LIBRARY_VERSION is not set, using "next" for local testing',
      );

      version = 'next';
    }

    return version;
  }
}
