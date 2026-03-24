![test badge](https://github.com/Omar-tn/Webhook-driven-pipeline/actions/workflows/ci.yml/badge.svg)

# Set Up:
##  1. initialize project

``` shell
npm init -y
```

##   2. install Runtime Dependencies

``` shell
npm inpm install express dotenv
```

##   3. Install Development Dependencies
``` shell
npm install -D typescript ts-node-dev @types/node @types/express
```

##    4. **initialize typescript**
```shell
npx tsc --init
```

## 5. install vitest
```bash
npm install -D vitest
```

# for database:
## 1.
```
npm i drizzle-orm postgres

```
## 2.
```
sudo service postgresql start
```
## 3.
```
sudo -u postgres psql
```
## 3.
``` 
CREATE DATABASE webhook;
```

## 4. 
```

ALTER USER postgres PASSWORD 'postgres';
\c webhook
```

## 5.
```text
npm install drizzle-orm pg
npm install -D drizzle-kit
```

## 6. make .env file with:
```text
DB_URL=postgresql://postgres:postgres@localhost:5432/webhook?sslmode=disable
```
## 7.
```text
npx drizzle-kit push
```

## 8. make drizzle.config.ts file with:
```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
schema: "./src/db/schema.ts",
out: "./src/db/migrations",
dialect: "postgresql",
dbCredentials: {
url: process.env.DB_URL!,
},
});
```



---

# Run/use
run and start the app:
## run debugging:

``` 
npm run ded
```
# use API:

## 1. Pipeline Registration:
### POST: /pipelines
### Body:
```json
{
  "sourceKey": "test",
  "target": "http://localhost:3000/dummy-target"
}
```
### Example:
```shell
curl -X POST http://localhost:3000/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "sourceKey": "test",
    "target": "http://localhost:3000/dummy-target"
  }
```
### Response:
```json
{ "message": "Pipeline created" }
```


> Note: sourceKey is unique and must be unique for each pipeline


## 2. Trigger pipeline:
### POST: webhook/:sourceKey
### Body:
```json
{
  "payload": "test"
}
```
### Example:
```shell
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d  '{
        "message": "hello"
      }'
```
### Response:
```text
======= Webhook Received =======
```

    





