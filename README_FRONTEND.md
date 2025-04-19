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

La visualización del frontend se realiza a través de **NGINX**, configurado para funcionar como balanceador de carga y servidor estático. Estos elementos de configuración se encuentran en el `Dockerfile` que se utiliza para levantar el contenedor.

El acceso al frontend desplegado se realiza en la IP y puertos configurados para el contenedor, por defecto puede accederse mediante `http://localhost:80`.

## Configuración del entorno

Adicionalmente, es necesario modificar el archivo `environment.ts` para que el frontend apunte al servidor de **Kong**, que gestiona el enrutamiento hacia los servicios del backend.
