# Manual del Frontend

Este documento describe el proceso para instalar, compilar y ejecutar el frontend del proyecto.

## Requisitos previos

- Tener instalado **Node.js** y **npm**
- Tener instalado **Angular CLI**
- Clonar este repositorio

## Instalación de dependencias

Una vez clonado el repositorio, se deben instalar las dependencias del proyecto ejecutando el siguiente comando en la raíz del frontend:

```bash
npm install
```

## Ejecución en desarrollo

Para ejecutar el proyecto en modo desarrollo se utiliza el siguiente comando:

```bash
ng serve
```

Esto levanta el servidor local de Angular para acceder a la aplicación desde el navegador.

## Generación del artefacto

Para generar el artefacto de producción, se debe construir el proyecto Angular. Esto crea los archivos listos para desplegar:

```bash
ng build
```

Este comando genera una carpeta `dist/` en la raíz del proyecto. Dicha carpeta contiene el artefacto final del frontend.

## Despliegue

El contenido de la carpeta `dist/` es utilizado dentro del `Dockerfile`. En este archivo, se copia el subdirectorio correspondiente al nombre del proyecto Angular (por ejemplo, `frontend-browser`) dentro del contenedor Docker. Esto permite tener los archivos necesarios para cargar correctamente la página web.

## Ejecución en servidor

La visualización del frontend se realiza a través de **NGINX**, configurado para funcionar como balanceador de carga y servidor estático.

Una vez construido y desplegado el contenedor, NGINX servirá el contenido generado del frontend de manera continua en la URL configurada (por ejemplo, `http://ngx.com`).
