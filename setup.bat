@echo off
cd /d d:\TalentDash
echo Installing npm dependencies...
npm install
echo.
echo Generating Prisma client...
npx prisma generate
echo.
echo Done! Now set up your .env.local with DATABASE_URL and DIRECT_URL from Neon,
echo then run: npx prisma migrate dev --name init
echo Then run: npx prisma db seed
echo Finally: npm run dev
