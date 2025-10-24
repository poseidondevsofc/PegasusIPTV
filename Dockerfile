FROM php:8.1-apache

# Copia todos os arquivos da pasta public para o Apache
COPY public/ /var/www/html/

# Cria a pasta storage com permissões corretas (se necessário)
RUN mkdir -p /var/www/html/storage && chown -R www-data:www-data /var/www/html/storage

# Habilita o mod_rewrite do Apache
RUN a2enmod rewrite \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Expõe a porta 80
EXPOSE 80

# Inicializa o Apache
CMD ["apache2-foreground"]
