import { NextResponse } from "next/server";

// Deprecated: Password resets must be completed client-side using the recovered session
// via supabase.auth.updateUser({ password }).
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Use client-side supabase.auth.updateUser during recovery.",
    },
    { status: 410 }
  );
}
