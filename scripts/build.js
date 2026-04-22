const fs = require('node:fs/promises');
const path = require('node:path');

async function copyDirRecursive(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const distDir = path.join(root, 'dist');

  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  await copyDirRecursive(path.join(root, 'src'), path.join(distDir, 'src'));
  await copyDirRecursive(path.join(root, 'data'), path.join(distDir, 'data'));

  const packageJson = {
    name: 'secure-js-sample-dist',
    version: '1.0.0',
    private: true,
    type: 'commonjs',
    main: './src/index.js'
  };

  await fs.writeFile(
    path.join(distDir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );

  process.stdout.write('Build complete: dist/ created.\n');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
