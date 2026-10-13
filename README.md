# Sistema Lavandus 

Sistema de información para lavanderías industriales. 

## Descripción

Una aplicación web hecha con SpringBoot + PostgreSQL para el backend, React para el frontend. El proyecto está realizado utilizando patrones de arquitectura MVC.

## Cómo usar?

1. Clonar el repositorio (generalmente en una carpeta dedicada lavandus/<clonar_aqui>)
2. Para correr el backend: .\mvnw.cmd spring-boot:run (en lavandus-api); para correr el front: npm run dev (en lavandus-front)
3. Para correr el servidor SMTP: docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit | SMTP: localhost:1025 · Bandeja web: http://localhost:8025
4. El servidor corre con variables de entorno:
$env:MAIL_HOST='localhost'
$env:MAIL_PORT='1025'
$env:MAIL_AUTH='false'
$env:MAIL_STARTTLS='false'
$env:MAIL_FROM='facturacion@lavandus.com'

## Comandos para desplegar en Docker

- proximamente...

## Authors

[@santiago_aguila]
[@gabiiak]

