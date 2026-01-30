const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('guest123', 10)

    const user = await prisma.user.upsert({
        where: { username: 'guest' },
        update: {},
        create: {
            username: 'guest',
            password: hashedPassword,
            role: 'VIEWER',
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

export { }
