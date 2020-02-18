FROM nginx:stable-alpine

## Adjust permissions to run as regular user
RUN chmod 777 /var/cache/nginx /var/run /var/log/nginx
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY . /usr/share/nginx/html/
COPY nginx/*.html /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/

EXPOSE 8080
RUN sed -i "s/index.htm;/index.htm\n        try_files \$uri \$uri\/ \/index.html;/g" /etc/nginx/conf.d/default.conf
