const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying FrameFor Setup...\n')

const files = [
  'package.json',
  'tsconfig.json',
  'types/index.ts',
  'types/i18n.ts',
  'app/package.json',
  'app/tsconfig.json',
  'app/prisma/schema.prisma',
  'app/lib/prisma.ts',
  'app/lib/supabase.ts',
  'mobile/package.json',
  'mobile/tsconfig.json',
  'mobile/app.json',
]

let allGood = true

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file))
  const icon = exists ? '✅' : '❌'
  console.log(`${icon} ${file}`)
  if (!exists) allGood = false
})

console.log('\n' + '='.repeat(50))

if (allGood) {
  console.log('✅ All files present!')
  console.log('\nNext steps:')
  console.log('1. Run: npm install')
  console.log('2. Setup Supabase')
  console.log('3. Configure .env files')
  console.log('4. Run: npm run db:push')
} else {
  console.log('❌ Some files are missing!')
  console.log('\nPlease copy all artifacts from Claude.')
}

console.log('')