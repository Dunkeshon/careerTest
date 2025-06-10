import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const csvPath = path.join(process.cwd(), 'server', 'questions.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    
    const questions = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Check if image files exist and add fallback to default image
    const questionsWithImages = await Promise.all(
      questions.map(async (question) => {
        let imagePath = null
        
        // Check if question has a specific image
        if (question.Image) {
          const fullImagePath = path.join(process.cwd(), 'public', question.Image)
          try {
            await fs.access(fullImagePath)
            imagePath = question.Image
          } catch {
            // Image doesn't exist, will use default
          }
        }
        
        // If no specific image, check for default image
        if (!imagePath) {
          const defaultImagePath = path.join(process.cwd(), 'public', 'images', 'default', 'default.webp')
          try {
            await fs.access(defaultImagePath)
            imagePath = '/images/default/default.webp'
          } catch {
            // No default image either
            imagePath = null
          }
        }
        
        return {
          id: question['#'],
          question: question['Question (*when given maximum points (5/5))'],
          R: parseInt(question.R) || 0,
          I: parseInt(question.I) || 0,
          A: parseInt(question.A) || 0,
          S: parseInt(question.S) || 0,
          E: parseInt(question.E) || 0,
          C: parseInt(question.C) || 0,
          image: imagePath
        }
      })
    )

    return { questions: questionsWithImages }
  } catch (error) {
    console.error('Error loading questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load questions'
    })
  }
}) 