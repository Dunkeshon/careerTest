import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const answers = body.answers // Array of { questionId: number, score: number }
  
  // Read and parse the questions CSV
  const questionsPath = join(process.cwd(), 'server', 'questions.csv')
  const questionsContent = readFileSync(questionsPath, 'utf-8')
  const questions = parse(questionsContent, {
    columns: true,
    skip_empty_lines: true
  })

  // Initialize scores for each category
  const scores = {
    R: 0, // Realistic
    I: 0, // Investigative
    A: 0, // Artistic
    S: 0, // Social
    E: 0, // Enterprising
    C: 0  // Conventional
  }

  // Calculate scores
  answers.forEach(answer => {
    const question = questions.find(q => q['#'] === answer.questionId.toString())
    if (!question) return

    // Find the category that has score 4 for this question
    const category = Object.keys(scores).find(cat => parseInt(question[cat]) === 4)
    if (!category) return

    // Convert user's answer (1-5) to points (0-4)
    // 5 -> 4 points, 4 -> 3 points, 3 -> 2 points, 2 -> 1 point, 1 -> 0 points
    const points = answer.score - 1
    scores[category] += points
  })

  // Find the highest scoring category
  const highestCategory = Object.entries(scores).reduce((a, b) => 
    scores[a] > scores[b[0]] ? a : b[0]
  )

  // Get category descriptions
  const categoryDescriptions = {
    R: 'Realistic - Practical, physical, hands-on, mechanical',
    I: 'Investigative - Analytical, intellectual, scientific, explorative',
    A: 'Artistic - Creative, original, independent, chaotic',
    S: 'Social - Helpful, cooperative, supportive, healing',
    E: 'Enterprising - Persuasive, leadership, managing, competitive',
    C: 'Conventional - Detail-oriented, organized, clerical'
  }

  return {
    success: true,
    scores,
    highestCategory,
    categoryDescription: categoryDescriptions[highestCategory],
    message: 'Test results calculated successfully'
  }
}) 