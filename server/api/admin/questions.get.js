import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { verifyAdminAuth } from '../../utils/adminAuth.js'

export default defineEventHandler(async (event) => {
  // Verify admin authentication
  await verifyAdminAuth(event)

  try {
    const csvPath = path.join(process.cwd(), 'server', 'questions.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    
    const questions = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Check if image files exist for each question
    const questionsWithImages = await Promise.all(
      questions.map(async (question) => {
        let imageExists = false
        let imagePath = null
        
        if (question.Image) {
          const fullImagePath = path.join(process.cwd(), 'public', question.Image)
          try {
            await fs.access(fullImagePath)
            imageExists = true
            imagePath = question.Image
          } catch {
            imageExists = false
          }
        }
        
        return {
          ...question,
          imageExists,
          imagePath: imageExists ? imagePath : null
        }
      })
    )

    return { questions: questionsWithImages }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load questions'
    })
  }
}) 