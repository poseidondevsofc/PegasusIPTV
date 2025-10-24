
FROM php:8.1-apache
COPY public/ /var/www/html/
RUN mkdir -p /var/www/html/storage && chown -R www-data:www-data /var/www/html/storage
RUN a2enmod rewrite
EXPOSE 80
CMD ["apache2-foreground"]
