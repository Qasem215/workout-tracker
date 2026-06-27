import type { Exercise, Trophy, ParsedWorkoutData, Difficulty, TrophyTier } from '../types'

type Section = 'none' | 'workouts' | 'trophies'

function parseField(line: string, field: string): string | null {
  const prefix = `- **${field}**:`
  if (line.trimStart().startsWith(prefix)) {
    return line.slice(line.indexOf(prefix) + prefix.length).trim()
  }
  return null
}

function parseReward(value: string): number {
  const match = value.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function parseWorkoutsMd(raw: string): ParsedWorkoutData {
  const exercises: Exercise[] = []
  const trophies: Trophy[] = []

  let section: Section = 'none'
  let difficulty: Difficulty = 'Beginner'
  let muscleGroup = ''
  let tier: TrophyTier = 'Bronze'

  let currentExercise: Partial<Exercise> | null = null
  let currentTrophy: Partial<Trophy> | null = null

  const flushExercise = () => {
    if (currentExercise?.name && currentExercise.difficulty && currentExercise.muscleGroup) {
      exercises.push({
        name: currentExercise.name,
        difficulty: currentExercise.difficulty,
        muscleGroup: currentExercise.muscleGroup,
        equipment: currentExercise.equipment ?? '',
        alternative: currentExercise.alternative ?? '',
        description: currentExercise.description ?? '',
      })
    }
    currentExercise = null
  }

  const flushTrophy = () => {
    if (currentTrophy?.name && currentTrophy.tier && currentTrophy.condition) {
      trophies.push({
        name: currentTrophy.name,
        tier: currentTrophy.tier,
        condition: currentTrophy.condition,
        reward: currentTrophy.reward ?? 0,
      })
    }
    currentTrophy = null
  }

  for (const raw_line of raw.split('\n')) {
    const line = raw_line.trimEnd()

    if (line === '---') {
      flushExercise()
      continue
    }

    // H1 headers — determine section or difficulty
    if (line.startsWith('# ')) {
      const heading = line.slice(2).trim()

      if (heading === 'Workout Database') {
        section = 'workouts'
        continue
      }
      if (heading === 'Trophy Registry') {
        flushExercise()
        flushTrophy()
        section = 'trophies'
        continue
      }
      if (heading.startsWith('Difficulty:')) {
        flushExercise()
        difficulty = heading.replace('Difficulty:', '').trim() as Difficulty
        continue
      }
      continue
    }

    // H2 headers — muscle group or trophy tier
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim()

      if (section === 'workouts' && heading.startsWith('Muscle Group:')) {
        flushExercise()
        muscleGroup = heading.replace('Muscle Group:', '').trim()
        continue
      }
      if (section === 'trophies' && heading.startsWith('Tier:')) {
        flushTrophy()
        tier = heading.replace('Tier:', '').trim() as TrophyTier
        continue
      }
      continue
    }

    // H3 headers — exercise name or trophy name
    if (line.startsWith('### ')) {
      const name = line.slice(4).trim()

      if (section === 'workouts') {
        flushExercise()
        currentExercise = { name, difficulty, muscleGroup }
        continue
      }
      if (section === 'trophies') {
        flushTrophy()
        currentTrophy = { name, tier }
        continue
      }
      continue
    }

    // Field lines
    if (line.trimStart().startsWith('- **')) {
      if (section === 'workouts' && currentExercise) {
        const equipment = parseField(line, 'Equipment')
        if (equipment !== null) { currentExercise.equipment = equipment; continue }

        const alternative = parseField(line, 'Alternative')
        if (alternative !== null) { currentExercise.alternative = alternative; continue }

        const description = parseField(line, 'Description')
        if (description !== null) { currentExercise.description = description; continue }
      }

      if (section === 'trophies' && currentTrophy) {
        const condition = parseField(line, 'Condition')
        if (condition !== null) { currentTrophy.condition = condition; continue }

        const reward = parseField(line, 'Reward')
        if (reward !== null) { currentTrophy.reward = parseReward(reward); continue }
      }
    }
  }

  // Flush any trailing items
  flushExercise()
  flushTrophy()

  return { exercises, trophies }
}

export async function fetchAndParseWorkouts(base = ''): Promise<ParsedWorkoutData> {
  const url = `${base}/workouts.md`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch workouts.md: ${res.status}`)
  const text = await res.text()
  return parseWorkoutsMd(text)
}
