FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libicu-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl

#  Install Redis extension
RUN pecl install redis-5.3.7 \
    && docker-php-ext-enable redis

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

#  Copy composer files FIRST (better caching)
COPY composer.json composer.lock ./

#  Install dependencies BEFORE copying the rest of the app
RUN composer install --no-interaction --optimize-autoloader --no-dev

#  Now copy the rest of the application
COPY . .

#  Set permissions AFTER copying all files
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Expose port
EXPOSE 8000

# Better startup command with error handling
CMD php artisan optimize && \
    php artisan storage:link && \
    php artisan serve --host=0.0.0.0 --port=8000