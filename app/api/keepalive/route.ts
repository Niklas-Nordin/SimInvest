import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      success: true,
      message: "Database is awake",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}