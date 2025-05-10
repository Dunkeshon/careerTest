export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // For now, we'll just echo back the received answers
  // Later we'll add the RIASEC calculation logic
  return {
    success: true,
    answers: body.answers,
    message: 'Answers received successfully'
  }
}) 