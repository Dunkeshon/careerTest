import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { verifyAdminAuth } from '../../utils/adminAuth.js'

// Helper function to stringify CSV
function stringifyCSV(data) {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const rows = [headers]
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || ''
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    rows.push(values)
  })
  
  return rows.map(row => row.join(',')).join('\n')
}

export default defineEventHandler(async (event) => {
  // Verify admin authentication
  await verifyAdminAuth(event)

  try {
    const body = await readBody(event)
    const { questionId, imageType } = body

    if (imageType === 'question' && !questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question ID is required'
      })
    }

    let filePath
    if (imageType === 'default') {
      filePath = path.join(process.cwd(), 'public', 'images', 'default', 'default.webp')
    } else {
      filePath = path.join(process.cwd(), 'public', 'images', 'questions', `question-${questionId}.webp`)
    }

    // Delete the image file if it exists
    try {
      await fs.unlink(filePath)
    } catch (error) {
      // File might not exist, that's okay
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    // Update CSV if it's a question image
    if (imageType === 'question') {
      const csvPath = path.join(process.cwd(), 'server', 'questions.csv')
      const csvContent = await fs.readFile(csvPath, 'utf-8')
      
      const questions = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      })

      // Find and update the question
      const questionIndex = questions.findIndex(q => q['#'] === questionId)
      if (questionIndex === -1) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Question not found'
        })
      }

      questions[questionIndex].Image = ''

      // Write back to CSV using our custom function
      const csvData = stringifyCSV(questions)
      await fs.writeFile(csvPath, csvData)
    }

    return { success: true, message: 'Image deleted successfully' }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete image'
    })
  }
}) 