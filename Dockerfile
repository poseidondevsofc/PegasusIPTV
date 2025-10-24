# Imagem base com PHP 8.1 + Apache
FROM php:8.1-apache

# Ativa módulos necessários
RUN a2enmod rewrite

# Copia os arquivos da pasta public/ para o Apache
COPY public/ /var/www/html/

# Cria a pasta storage com permissões corretas
RUN mkdir -p /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 777 /var/www/html/storage

# Ajusta o Apache para permitir .htaccess
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Exposição da porta 80
EXPOSE 80

# Inicializa o Apache
CMD ["apache2-foreground"]
