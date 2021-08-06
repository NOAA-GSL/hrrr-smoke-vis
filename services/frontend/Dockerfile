FROM node:14.17.4

WORKDIR /home/node/app/
ENV NODE_ENV=production

COPY package*.json ./
COPY Makefile .
RUN npm install && make

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
