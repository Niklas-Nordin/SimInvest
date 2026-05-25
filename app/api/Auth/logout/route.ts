import { NextRequest, NextResponse } from "next/server";

export async function POST() {
    
  try {
    const res = NextResponse.json({ message: "Utloggning lyckades", status: 200 });

    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });

    return res;

  } catch (error) {

    return NextResponse.json({ message: "Serverfel", error }, { status: 500 });
  }
};
