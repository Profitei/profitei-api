FROM node:current-alpine AS build

# Instala pacotes em ordem alfabética
RUN apk add --no-cache g++ make musl-locales python3

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run prisma:generate && npm run build

ENV NODE_ENV production

###################
# PRODUCTION
###################

FROM node:current-alpine AS production

# Instala pacotes em ordem alfabética e combina as instruções RUN
RUN apk add --no-cache musl-locales

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/data ./data

# Define o locale para UTF-8
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
