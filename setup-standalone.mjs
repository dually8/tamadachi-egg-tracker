import fs from 'node:fs/promises';
import path from 'node:path';

async function copyPublicToStandalone() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const standaloneDir = path.join(process.cwd(), '.next', 'standalone', 'public');

    await fs.mkdir(standaloneDir, { recursive: true })
    await fs.cp(publicDir, standaloneDir, { recursive: true })
  } catch (err) {
    console.error('Error copying public directory:', err);
    throw err;
  }
}

async function copyStaticToStandalone() {
  try {
    const staticDir = path.join(process.cwd(), '.next', 'static');
    const standaloneDir = path.join(process.cwd(), '.next', 'standalone', 'static');

    await fs.mkdir(standaloneDir, { recursive: true });
    await fs.cp(staticDir, standaloneDir, { recursive: true });
  } catch (err) {
    console.error('Error copying static directory:', err);
    throw err;
  }
}

async function main() {
  try {
    await copyPublicToStandalone();
    await copyStaticToStandalone();
    console.log('Successfully copied public and static directories to standalone build.');
  } catch (err) {
    console.error('Failed to set up standalone build:', err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});