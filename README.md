# Modus

From the latin for *standard* or *method*, Modus is a website built to help students track their grade progress using an SBLG(standards based learning grading) system.

Check it out [here](https://modus.maxglass.dev)!

# The stack

Modus follows the T3-Stack and was bootstrapped with [Create-T3-App](https://create.t3.gg).

- Hosted on [Vercel](https://vercel.com)
- MySQL cloud database on [Planetscale](https://planetscale.com)
- [Next.js 13](https://nextjs.org/)
- [React 18](https://reactjs.org)
- [Prisma](https://www.prisma.io/)
- [tRPC](https://trpc.io/)

# Running locally

There must be a MySQL server running on port 3306 as described the [schema](prisma/schema.prisma). Then simply run `yarn && yarn dev` and the site will be running locally at [localhost:3000](http://localhost:3000).
