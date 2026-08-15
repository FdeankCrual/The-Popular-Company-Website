# The Sequential Promise Queue

The most significant backend challenge in this project was managing concurrency with the Google Apps Script (GAS) API.

## The Google Sheets Concurrency Problem

Google Sheets is not a traditional ACID-compliant database. It is a collaborative spreadsheet interface wrapped with an API. 
If a user rapidly adds 5 rows in the React frontend (via Optimistic UI), the frontend will dispatch 5 simultaneous `POST` requests to the Next.js API. 

If Next.js forwards all 5 requests concurrently to Google Apps Script, Google throws a **429 Too Many Requests** error, or worse, multiple scripts attempt to edit the same row simultaneously, resulting in a **Concurrency Lock**. Data gets overwritten or lost permanently.

## The Solution: A Node.js Singleton Queue

To solve this, we built a global request interceptor inside `/api/admin/data/route.ts`. 

Instead of executing `fetch()` immediately, every incoming request is pushed into a shared, memory-resident `taskQueue`. A processing loop (`processQueue`) ensures that only **one** request is executing against the Google Apps Script API at any given time.

```mermaid
flowchart TD
    %% Define Styles
    classDef frontend fill:#1A1A1A,stroke:#FF6600,stroke-width:2px,color:#fff
    classDef nextjs fill:#2A2A2A,stroke:#4CAF50,stroke-width:2px,color:#fff
    classDef google fill:#0F3460,stroke:#E94560,stroke-width:2px,color:#fff

    F[Frontend (Optimistic UI)] -->|Req 1| API[/api/admin/route.ts]
    F -->|Req 2| API
    F -->|Req 3| API

    subgraph API Route [Next.js Singleton Queue Interceptor]
        API --> Enqueue
        Enqueue --> QueueBox[Task Queue: Req1, Req2, Req3]
        QueueBox --> Loop{Is Queue Processing?}
        Loop -- No --> Process[Process Req 1]
        Loop -- Yes --> Wait[Wait in Queue]
    end

    Process --> GAS[Google Apps Script]
    GAS -->|Req 1 Success| Loop2{Process Next?}
    Loop2 -->|Process Req 2| GAS

    class F frontend
    class API,Enqueue,QueueBox,Loop,Process,Wait,Loop2 nextjs
    class GAS google
```

## Why this is Engineering Magic

1. **Zero Data Loss:** The user can smash the keyboard, generating 50 instant state changes. The Next.js queue absorbs the chaos, holding the requests in memory, and drip-feeds them to Google Sheets one by one.
2. **Abstracted Complexity:** Because of the Optimistic UI on the frontend, the user has absolutely no idea this queue exists. To them, the app feels as fast as a local desktop application.
