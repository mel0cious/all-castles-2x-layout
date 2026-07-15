import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const tempDir = path.join(os.tmpdir(), '2x-layout-gh-pages')
const dryRun = process.argv.includes('--dry-run')
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GIT_TOKEN || ''

function run(command, args, cwd = rootDir) {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

function capture(command, args, cwd = rootDir) {
  try {
    return execFileSync(command, args, { cwd, encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function isGithubHttpsRemote(remoteUrl) {
  return /^https:\/\/github\.com\//i.test(remoteUrl)
}

function injectToken(remoteUrl, authToken) {
  if (!authToken || !isGithubHttpsRemote(remoteUrl)) {
    return remoteUrl
  }

  const url = new URL(remoteUrl)
  url.username = 'x-access-token'
  url.password = authToken
  return url.toString()
}

function branchExists(remote, branch) {
  const output = capture('git', ['ls-remote', '--heads', remote, branch])
  return output.length > 0
}

if (!existsSync(distDir)) {
  throw new Error('dist/ does not exist. Run the build before deploying.')
}

const remote = capture('git', ['remote', 'get-url', 'origin'])
const authRemote = injectToken(remote, token)

if (isGithubHttpsRemote(remote) && !token && !dryRun) {
  throw new Error(
    'GitHub Pages deploy needs authentication for this HTTPS remote. Set GITHUB_TOKEN or GH_TOKEN, or switch origin to an SSH URL.',
  )
}

const hasGhPagesBranch = branchExists(authRemote, 'gh-pages')

rmSync(tempDir, { recursive: true, force: true })
mkdirSync(path.dirname(tempDir), { recursive: true })

if (hasGhPagesBranch) {
  run('git', ['clone', '--depth', '1', '--branch', 'gh-pages', '--single-branch', authRemote, tempDir])
} else {
  run('git', ['clone', authRemote, tempDir])
  run('git', ['checkout', '--orphan', 'gh-pages'], tempDir)
  run('git', ['rm', '-rf', '--ignore-unmatch', '.'], tempDir)
}

function copyDirectoryContents(sourceDir, targetDir) {
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      cpSync(sourcePath, targetPath, { recursive: true, force: true })
    } else {
      cpSync(sourcePath, targetPath, { force: true })
    }
  }
}

copyDirectoryContents(distDir, tempDir)

run('git', ['add', '-A'], tempDir)

const userEmail = capture('git', ['config', '--get', 'user.email'], tempDir)
const userName = capture('git', ['config', '--get', 'user.name'], tempDir)

if (!userEmail) {
  run('git', ['config', 'user.email', 'deploy@example.com'], tempDir)
}

if (!userName) {
  run('git', ['config', 'user.name', 'Deploy Bot'], tempDir)
}

try {
  run('git', ['commit', '-m', 'Deploy site'], tempDir)
} catch {
  console.log('Nothing new to commit.')
}

if (dryRun) {
  console.log('Dry run complete. Skipping push.')
  rmSync(tempDir, { recursive: true, force: true })
  process.exit(0)
}

run('git', ['push', authRemote, 'gh-pages', '--force'], tempDir)
rmSync(tempDir, { recursive: true, force: true })