import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// ── POST /api/admin/auth — admin login ────────────────
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const validEmail    = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;

    // ── Check credentials ─────────────────────────
    if (email !== validEmail || password !== validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Set admin session cookie ──────────────────
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,        // not accessible via JS
      secure:   true,        // HTTPS only
      sameSite: "strict",
      maxAge:   60 * 60 * 8, // 8 hours
      path:     "/",
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/admin/auth — admin logout ─────────────
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}

// ── GET /api/admin/auth — check if logged in ──────────
export async function GET() {
  const cookieStore = await cookies();
  const session     = cookieStore.get("admin_session");
  return NextResponse.json({
    authenticated: session?.value === "authenticated",
  });
}