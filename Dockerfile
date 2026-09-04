FROM node:24-alpine

WORKDIR /app

COPY node_modules/ /app/node_modules/

COPY dist/ /app/dist/

CMD [ "node", "/app/dist/src/index.js" ]
