import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Project } from '../types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const DATA_FILE = path.join(__dirname, '../../data/projects.json')

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function readProjects(): Promise<Project[]> {
  await ensureDataDir()
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeProjects(projects: Project[]) {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
}

router.get('/', async (req, res) => {
  const projects = await readProjects()
  const summaries = projects.map(p => ({
    id: p.id,
    name: p.name,
    ratio: p.ratio,
    thumbnail: p.thumbnail,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
  res.json(summaries)
})

router.get('/:id', async (req, res) => {
  const projects = await readProjects()
  const project = projects.find(p => p.id === req.params.id)
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }
  res.json(project)
})

router.post('/', async (req, res) => {
  const { name, ratio, elements, thumbnail } = req.body
  const projects = await readProjects()
  
  const newProject: Project = {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name || '未命名项目',
    ratio,
    elements: elements || [],
    thumbnail,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  
  projects.unshift(newProject)
  await writeProjects(projects)
  
  res.status(201).json(newProject)
})

router.put('/:id', async (req, res) => {
  const projects = await readProjects()
  const index = projects.findIndex(p => p.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' })
  }
  
  projects[index] = {
    ...projects[index],
    ...req.body,
    id: projects[index].id,
    createdAt: projects[index].createdAt,
    updatedAt: Date.now(),
  }
  
  await writeProjects(projects)
  res.json(projects[index])
})

router.delete('/:id', async (req, res) => {
  let projects = await readProjects()
  const exists = projects.find(p => p.id === req.params.id)
  
  if (!exists) {
    return res.status(404).json({ error: 'Project not found' })
  }
  
  projects = projects.filter(p => p.id !== req.params.id)
  await writeProjects(projects)
  
  res.json({ id: req.params.id, deleted: true })
})

export default router
