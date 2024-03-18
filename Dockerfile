FROM node:21-alpine3.18 As build

WORKDIR /usr/src/app

COPY package*.json  ./

RUN npm ci

COPY . .

RUN npm run build

RUN echo "DATABASE_URL=postgres://recipe:RecipePassword@postgres:5432/recipe" > .env

RUN npm run prisma:generate

ENV NODE_ENV production

###################
# PRODUCTION
###################

FROM node:21-alpine3.18 As production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./

COPY  --from=build usr/src/app/dist ./dist
COPY  --from=build usr/src/app/node_modules ./node_modules

EXPOSE 3000
CMD [ "npm", "run", "start:prod"]