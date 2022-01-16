const fs = require('fs');
const Path = require('path');
const handlebars = require('handlebars');

const rawQuestionTemplate = fs.readFileSync(Path.join(__dirname, './templates/question.mustache'), 'utf8');
const rawSummaryTemplate = fs.readFileSync(Path.join(__dirname, './templates/summary.mustache'), 'utf8');
const questionTemplate = handlebars.compile(rawQuestionTemplate);
const summaryTemplate = handlebars.compile(rawSummaryTemplate);


const quizGenerator = (quizData) => {
  const questions = quizData.questions.map((question, index) => ({ ...question, index }));
  const quizPages = createQuestionPages(quizData.quizName, questions.length, questions[0], questions.slice(1))

  return quizPages;
}

const createQuestionPages = (quizName, totalQuestions, question, nextQuestions, pastAnswers = []) => {
  // A question is like a node.
  // An answer is like an edge to the next question.
  // A page exists for every question node.
  // A page exists for every end node after the last question's answers.

  // End Case: We're at the last question
  if (nextQuestions.length === 0) {
    const currentPage = createQuestionPage(quizName, totalQuestions, question, pastAnswers)
    const summaryPages = question.answers.map((answer, index) => {
      const indexedAnswer = { ...answer, index }
      const nextAnswers = [].concat(pastAnswers, indexedAnswer)
      return createSummaryPage(quizName, totalQuestions, nextAnswers)
    })

    return [].concat(currentPage, summaryPages)
  } else {
    const currentPage = createQuestionPage(quizName, totalQuestions, question, pastAnswers)
    const restPages = question.answers.map((answer, index) => {
      const indexedAnswer = { ...answer, index }
      const nextAnswers = [].concat(pastAnswers, indexedAnswer)
      return createQuestionPages(quizName, totalQuestions, nextQuestions[0], nextQuestions.slice(1), nextAnswers)
    })
    
    return restPages.reduce((allPages, pages) => allPages.concat(pages), [currentPage])
  }
}

const createSummaryPage = (quizName, totalQuestions, answers) => {
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const score = (correctAnswers / totalQuestions * 100).toFixed(0);
  const summaryTemplateData = {
    quizName,
    correctAnswers,
    totalQuestions,
    score
  }
  const content = summaryTemplate(summaryTemplateData)
  const path = getAnswerPath(answers)
  const fileName = 'index.html'
  const fullPath = Path.join(path, fileName)
  
  return {
    content,
    path,
    fileName,
    fullPath
  }
}

const createQuestionPage = (quizName, totalQuestions, question, answers) => {
  const questionTemplateData = {
    quizName,
    question: question.question,
    answers: question.answers,
    questionsAnswered: answers.length,
    totalQuestions,
    correctAnswers: answers.filter(answer => answer.isCorrect).length
  }
  const content = questionTemplate(questionTemplateData)
  const path = getAnswerPath(answers)
  const fileName = `index.html`
  const fullPath = Path.join(path, fileName)

  return {
    content,
    path,
    fileName,
    fullPath
  }
}

const getAnswerPath = (answers) => {
  return answers && answers.length > 0
    ? './' + answers.map((answer) => answer.index).join('/')
    : './'
}

module.exports = quizGenerator;