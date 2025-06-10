import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import formidable from 'formidable'
import sharp from 'sharp'
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

  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        return mimetype && (mimetype.includes('image/png') || mimetype.includes('image/webp') || mimetype.includes('image/jpeg'))
      }
    })

    const [fields, files] = await form.parse(event.node.req)
    const questionId = fields.questionId?.[0]
    const imageType = fields.imageType?.[0] || 'question' // 'question' or 'default'
    const file = files.image?.[0]

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No image file provided'
      })
    }

    if (imageType === 'question' && !questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question ID is required for question images'
      })
    }

    // Process image with sharp to ensure proper format
    let fileName
    let targetDir
    
    if (imageType === 'default') {
      fileName = 'default.webp'
      targetDir = path.join(process.cwd(), 'public', 'images', 'default')
    } else {
      fileName = `question-${questionId}.webp`
      targetDir = path.join(process.cwd(), 'public', 'images', 'questions')
    }

    const targetPath = path.join(targetDir, fileName)

    // Process and save image as square
    await sharp(file.filepath)
      .resize(350, 350, { fit: 'cover', position: 'center' })
      .webp({ quality: 100 })
      .toFile(targetPath)

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

      questions[questionIndex].Image = `/images/questions/${fileName}`

      // Write back to CSV using our custom function
      const csvData = stringifyCSV(questions)
      await fs.writeFile(csvPath, csvData)
    }

    return { 
      success: true, 
      message: 'Image uploaded successfully',
      imagePath: imageType === 'default' ? `/images/default/${fileName}` : `/images/questions/${fileName}`
    }
  } catch (error) {
    console.error('Upload error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image'
    })
  }
}) 