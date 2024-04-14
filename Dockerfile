FROM node:21-alpine3.18 AS build

WORKDIR /usr/src/app

COPY package*.json  ./

RUN npm ci

COPY . .

RUN npm run prisma:generate

RUN npm run build

ENV NODE_ENV production

###################
# PRODUCTION
###################

FROM node:21-alpine3.18 AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./

COPY  --from=build usr/src/app/dist ./dist
COPY  --from=build usr/src/app/node_modules ./node_modules
COPY  --from=build usr/src/app/data ./data

EXPOSE 3000
CMD [ "npm", "run", "start:prod"]