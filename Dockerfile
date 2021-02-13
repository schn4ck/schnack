FROM node:lts-buster

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install @schnack/plugin-auth-github

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "server" ]
