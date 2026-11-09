FROM node:24-alpine AS compilar
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=compilar /frontend/dist /usr/share/nginx/html
EXPOSE 8080
