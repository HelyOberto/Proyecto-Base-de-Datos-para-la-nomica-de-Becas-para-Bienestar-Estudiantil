# Imagen oficial de PHP en el server de Apache
FROM php:8.2-apache

# Instalamos las herramientas que le permiten a PHP conectarse a la base de datos mediante PDO
RUN docker-php-ext-install pdo pdo_mysql

# Mueve el proyecto donde Apache pueda encontrarlo (Sino no sirve)
COPY . /var/www/html/

# Le damos los permisos al servidor web para que pueda usar el proyecto
RUN chown -R www-data:www-data /var/www/html/

# Contenedor que escucha las peticiones del puerto web
EXPOSE 80