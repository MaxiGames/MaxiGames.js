FROM node:18

WORKDIR /main

COPY package*.json ./

RUN npm install

COPY . .

# copy environment varibales into the extconfigs
RUN echo "$API_TOKEN" > ./extconfigs/api-token.json
RUN echo "$CONFIG_PROD" > ./extconfigs/config-prod.json
RUN echo "$CONFIG_DEV" > ./extconfigs/config-dev.json
RUN echo "$SERVICEACCOUNTKEY_PROD" > ./extconfigs/serviceAccountKey-prod.json
RUN echo "$SERVICEACCOUNTKEY_DEV" > ./extconfigs/serviceAccountKey-dev.json

EXPOSE 8080

ENV NODE_ENV=production

CMD [ "npm", "run", "buildStart-prod" ]