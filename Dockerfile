FROM node:current AS build

# Instala pacotes necessários
RUN apt-get update && apt-get install -y \
    g++ \
    make \
    python3 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production

###################
# PRODUCTION
###################

FROM node:current AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/data ./data

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
