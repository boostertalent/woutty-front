import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './', // Chemin vers votre app Next.js
})

const config = {
  testEnvironment: 'jest-environment-jsdom',
  reporters: ["default", "<rootDir>/jest-reporter.js"]
}

export default createJestConfig(config)