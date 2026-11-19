/**
 * 一堂(yitang)方法论技能包。
 *
 * 将打包在本包 `skills/` 目录下的方法论 SKILL.md 注册到 `ctx.skills`,
 * 供用户与智能体作为工作方法论调用。参照 skill-office 的 provider 形态,
 * 但不依赖外部包:仅解析 name / description / whenToUse 三个简单字段。
 *
 * @module @local/yitang
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cordis 插件身份。 */
export const name = 'yitang'
/** 依赖技能注册表服务。 */
export const inject = ['skills']

/** 打包技能的来源 rank,与 BUNDLED_SKILL_RANK 一致。 */
const SKILL_RANK = 600
/** 提供者名称。 */
const PROVIDER_NAME = 'yitang'

/** 解析 SKILL.md 的简易 frontmatter(仅支持 name/description/whenToUse 单行字段)。 */
function parseSkill(raw, path) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(raw)
  if (!match) throw new Error(`${path}: missing YAML frontmatter`)
  const fields = new Map()
  for (const line of match[1].split(/\r?\n/u)) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1)
    fields.set(key, value)
  }
  const skillName = fields.get('name')
  const description = fields.get('description')
  if (typeof skillName !== 'string' || skillName.length === 0) throw new Error(`${path}: frontmatter requires name`)
  if (typeof description !== 'string' || description.length === 0) throw new Error(`${path}: frontmatter requires description`)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(skillName)) throw new Error(`${path}: invalid skill name "${skillName}"`)
  return {
    name: skillName,
    description,
    ...fields.has('whenToUse') ? { whenToUse: fields.get('whenToUse') } : {},
    content: raw.slice(match[0].length).trim(),
  }
}

/** 注册打包的方法论技能。 */
export function apply(ctx) {
  const skillRoot = fileURLToPath(new URL('./skills/', import.meta.url))
  if (!isAbsolute(skillRoot)) throw new Error('yitang: skillRoot must be absolute')
  const reported = new Map()

  async function listSkillDirs() {
    return (await readdir(skillRoot, { withFileTypes: true, encoding: 'utf8' }))
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
  }

  async function readSkill(skillDir, signal) {
    const path = join(skillRoot, skillDir, 'SKILL.md')
    let raw
    try {
      raw = await readFile(path, { encoding: 'utf8', signal })
    } catch (error) {
      if (signal?.aborted === true) throw error
      return { kind: 'failed', error, persistent: error?.code === 'ENOENT' || error?.code === 'ENOTDIR' }
    }
    try {
      return { kind: 'loaded', skill: parseSkill(raw, path) }
    } catch (error) {
      return { kind: 'failed', error, persistent: true }
    }
  }

  function failed(skillDir, read) {
    const failure = String(read.error)
    if (reported.get(skillDir) !== failure) {
      reported.set(skillDir, failure)
      ctx.logger.warn(`yitang: skill "${skillDir}" unavailable: ${failure}`)
    }
    return read
  }

  ctx.skills.registerProvider(control => ({
    name: PROVIDER_NAME,
    async list(options) {
      let dirs
      try {
        dirs = await listSkillDirs()
      } catch (error) {
        if (options.signal?.aborted === true) throw error
        ctx.logger.warn(`yitang: failed to list skills directory ${skillRoot}: ${error}`)
        return { candidates: [], complete: false }
      }
      const reads = await Promise.all(dirs.map(async dir => {
        const read = await readSkill(dir, options.signal)
        return { dir, read: read.kind === 'failed' ? failed(dir, read) : read }
      }))
      const candidates = []
      for (const { dir, read } of reads) {
        if (read.kind !== 'loaded') continue
        const directory = join(skillRoot, dir)
        candidates.push({
          name: read.skill.name,
          description: read.skill.description,
          ...read.skill.whenToUse !== undefined ? { whenToUse: read.skill.whenToUse } : {},
          invocation: { modelInvocable: true, userInvocable: true },
          provider: PROVIDER_NAME,
          source: 'bundled',
          rank: SKILL_RANK,
          resourceBase: { kind: 'directory', path: directory },
          locator: join(directory, 'SKILL.md'),
        })
      }
      return { candidates, complete: reads.every(({ read }) => read.kind === 'loaded' || read.persistent) }
    },
    async get(candidate, options) {
      const { rank: _rank, locator: _locator, ...summary } = candidate
      const dir = candidate.locator.slice(skillRoot.length + 1).split('/')[0]
      const read = await readSkill(dir, options.signal)
      if (read.kind === 'failed') {
        if (!read.persistent) throw read.error
        control.invalidate()
        return undefined
      }
      return { ...summary, content: read.skill.content }
    },
  }))
}
