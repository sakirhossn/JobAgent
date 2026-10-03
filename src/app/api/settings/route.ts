import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { category: "asc" },
    });
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json(); // Map of { key: value } or array of settings
    if (Array.isArray(body)) {
      for (const item of body) {
        await prisma.setting.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: {
            key: item.key,
            value: String(item.value),
            category: item.category || "GENERAL",
          },
        });
      }
    } else {
      for (const [key, value] of Object.entries(body)) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), category: "GENERAL" },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
