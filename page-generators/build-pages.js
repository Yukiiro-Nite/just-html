const fs = require('fs')
const path = require('path')
const quizGenerator = require('./quiz/quiz-generator')


const mathQuizData = require('./quiz/data/math-quiz.json')
const outputPath = path.join(process.cwd(), 'page/quiz/math-quiz')
const mathQuizPages = quizGenerator(mathQuizData)

mathQuizPages.forEach(writePage)



function writePage (page) {
  const pagePath = path.join(outputPath, page.path)
  const pageFullPath = path.join(outputPath, page.fullPath)
  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath, { recursive: true })
  }

  fs.writeFileSync(pageFullPath, page.content)
}