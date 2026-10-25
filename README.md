# Prueba #1 - Programación Web

## Requisitos
Node.js (LTS) y pnpm (`npm install -g pnpm`)

## Pasos para correr el proyecto
1. pnpm install
2. pnpm run start
3. La API queda en http://localhost:8000

La base de datos (db.sqlite) se crea sola al iniciar.
Si aparece "Could not locate the bindings file", ejecutar: pnpm rebuild better-sqlite3

## Rutas
- /users (POST, PUT, GET, DELETE)
- /payments (POST, PUT, GET, DELETE)
- /reports/payments-per-user (GET)
- /reports/payments-with-iva (GET)