FROM php:8.2-cli

WORKDIR /var/www

COPY . .

RUN apt-get update && apt-get install -y \
    zip unzip curl libzip-dev \
    && docker-php-ext-install pdo pdo_mysql

EXPOSE 8000
