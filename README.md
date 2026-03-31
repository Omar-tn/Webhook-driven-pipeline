![test badge](https://github.com/Omar-tn/Webhook-driven-pipeline/actions/workflows/ci.yml/badge.svg)

# Webhook-driven-pipeline
##  A webhook driven pipeline that can be used to trigger actions on events.

# Docker set up:
## Run the system (one command)
```bash
docker compose up --build
```


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
### Body syntax:
```json
{
  "sourceKey": "test",
  "targets": [
    "http://localhost:3000/dummy-target"
  ],
  "action": {
    "type": "filter",
    "field": "msg",
    "equals": "hello"
  }
}
```
### Example:
```shell
curl -X POST http://localhost:3000/pipelines   
-H "Content-Type: application/json"   
-d '{
"sourceKey": "test",
"targets": [
    "http://localhost:3000/dummy-target"
    ],
"action": {
    "type": "filter",
    "field": "msg",
    "equals": "hello"
    }
}
```
### Response:
```json
{ "message": "Pipeline created" }
```


> Note: sourceKey is unique and must be unique for each pipeline action.


## 2. Trigger pipeline:
### POST: /webhook/:sourceKey
### Headers:
```json
{
  "action": "test"
}
```

}
### Body:
```json
{
  "payload": "test"
}
```
### Example:
```shell
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json", "action": "test" \
  -H "action: test" \
  -d  '{
        "message": "hello"
      }'
```
### Response:
```json
{
    "res":  "======= Webhook Received =======",
    "following":  "event created with id: 5",
    "id": 5
}
```

## 3. Get the status of an event:
### GET: /events:id
### Example:
```
curl -X GET http://localhost:3000/events/5
```
### Response:
```json
{
  "Event":{
    "id":12,
    "status":"success",
    "sourceKey":"test",
    "action":"filter"
  },
  "Log":{
    "messages":[
      "Processing event",
      "Action filter completed for pipeline: 1 of key: test with action: test",
      "Forwarding to : http://localhost:3000/dummy-target",
      "Attempt 1 => http://localhost:3000/dummy-target",
      "Success",
      "Success and delivered"
      ]},
  "Delivery":{
    "messages":[{
      "target":"http://localhost:3000/dummy-target","status":"success","attempts":1
    }]
  }
    
}
```


---

# Actions:
## 1. filter:
### Body syntax:
```json
{
    "type": "filter",
    "field": "msg",
    "equals": "hello"
}
```
---

## 2. Transform: change field/s name/s
mapping old filed name (value) to new filed name (field)
### Body syntax:
```json
{
    "type": "transform",
    "field": "message",
    "value": "msg"
}
```

### or

```json
{ 
  "type": "transform",
  "map": {
    "newFieldName1": "oldFieldName1",
    ,
    ,
    ,
  }
}
```

--- 

## 3. Validate:
### Body syntax:
```json
{ 
  "type": "validate",
  "required": ["msg"]
}
```
---
# Architecture:
-   ##  flow
###  Register (pipelines) → DB (pipelines) 
### Webhook event → DB (events) → Queue → Execute (event) → Bring DB(pipelines) → Action → Delivery → DB (logs) → Retry when failed

### GET event status →  Bring DB(logs + delivery) 

-   ##  separation of concerns
- 1. project source folder contains separate folders for:
     -  api: contains the API logic for handling requests and responses.
     -  db: contains the database logic for interacting with the database.
     -  core: contains the actions and tools and method logic for the application.

-   ## database schema:
     -  events: store the sourceKey and action and status of each event.
     -  logs: store the logs of each event.
     -  pipelines: store the sourceKey and targets and action of each pipeline.
     -  delivery: store the status and attempts of each target delivery.


---

# Design decisions:
  - ## DataBase design: events and logs are persisted
  - ## Queue processing: async of execution in background
  - ## interface: unify the json in communications
  - ## unify webhooks: all webhooks have the same endpoint but dynamic binding with the sourceKey to execute.
  - ## pipeline: each pipeline has a sourceKey and can have multiple targets and one action.
  - ## actions: filter, transform, validate






    





