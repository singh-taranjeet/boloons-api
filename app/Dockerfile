FROM --platform=linux/amd64 node:16

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV production
EXPOSE 4000
ENV PORT 4000
COPY . .
CMD ["npm","run", "start"]