import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

export async function GET(request: Request) {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL + "?action=getMoney", {
      method: "GET"
    });

    if (response.ok) {
        const result = await response.json();
        // Convert string booleans back to actual booleans for the frontend
        const parseBools = (arr: any[]) => arr.map(obj => {
          const newObj = { ...obj };
          Object.keys(newObj).forEach(k => {
            if (newObj[k] === "true") newObj[k] = true;
            if (newObj[k] === "false") newObj[k] = false;
          });
          return newObj;
        });

        if (result.incomes) result.incomes = parseBools(result.incomes);
        if (result.expenses) result.expenses = parseBools(result.expenses);
        if (result.employees) result.employees = parseBools(result.employees);
        if (result.emis) result.emis = parseBools(result.emis);

        return NextResponse.json(result);
    } else {
        return NextResponse.json({ error: "Google Script Error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error reading money data from DB:", error);
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      redirect: "follow"
    });

    if (response.ok) {
        const result = await response.json();
        return NextResponse.json(result);
    } else {
        return NextResponse.json({ error: "Google Script Error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error writing money data to DB:", error);
    return NextResponse.json({ error: "Failed to write data" }, { status: 500 });
  }
}
