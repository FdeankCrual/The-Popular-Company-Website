# High-Level Architecture

The Popular Company (TPC) internal platform was built to solve a critical issue: bridging a modern, high-performance web frontend with a zero-cost, infinitely scalable, and universally understood database (Google Sheets).

## System Overview

The system operates on a three-tier architecture:
1. **The Client (Next.js App Router):** Handles UI, optimistic state rendering, and drag-and-drop interactions.
2. **The Interceptor (Next.js API Route):** Acts as a singleton queue to protect the database from concurrency errors.
3. **The Database (Google Apps Script + Sheets):** The final source of truth that stores task data.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#1A1A1A,stroke:#FF6600,stroke-width:2px,color:#fff
    classDef server fill:#2A2A2A,stroke:#4CAF50,stroke-width:2px,color:#fff
    classDef database fill:#0F3460,stroke:#E94560,stroke-width:2px,color:#fff
    
    subgraph Client [Client-Side (React/Next.js)]
        UI[User Interface]
        State[Local React State Map]
        Debouncer[Debounced Auto-Save Engine]
    end

    subgraph Server [Server-Side (Next.js API)]
        Queue[Sequential Promise Queue]
        API_Route[/api/admin/data/]
    end

    subgraph DB [Google Infrastructure]
        GAS[Google Apps Script REST API]
        Sheet[(Google Sheet Database)]
    end

    %% Flow
    UI -->|1. User interacts| State
    State -->|2. Instantly updates UI| UI
    State -->|3. Pushes delta| Debouncer
    Debouncer -->|4. Fires after 1000ms| API_Route
    API_Route -->|5. Adds payload to| Queue
    Queue -->|6. Awaits previous, then executes| GAS
    GAS -->|7. Reads/Writes| Sheet
    GAS -.->|8. Returns success| Queue
    Queue -.->|9. Clears payload| API_Route

    class UI,State,Debouncer client
    class Queue,API_Route server
    class GAS,Sheet database
```

## Why Google Sheets?

For an agency, data transparency is key. Traditional databases (PostgreSQL, MongoDB) require technical expertise to query and manipulate. By using Google Sheets as a "Headless CMS/Database":
- Non-technical executives can instantly view data in a familiar spreadsheet format.
- Built-in historical versioning (Google Sheets Revision History).
- 100% free hosting and infinite scaling for text-based task management.

## The Google Apps Script (GAS) Bridge

Google Sheets cannot be natively queried like a SQL database from a Next.js frontend securely. To bridge this gap, a custom Google Apps Script (`Code.gs`) was written. 

This script intercepts `doGet()` and `doPost()` requests from the Next.js API, parses the JSON payload, and executes the corresponding `SpreadsheetApp` methods to manipulate the sheet cells. It essentially turns a simple spreadsheet into a full REST API.
