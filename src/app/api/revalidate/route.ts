import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// ISR 수동 재검증 API
// Notion 웹훅이나 배포 스크립트에서 호출하여 캐시를 즉시 갱신
// POST /api/revalidate
// Body: { secret: string, path?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { secret?: string; path?: string };
    const { secret, path } = body;

    // 시크릿 키 검증
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: "유효하지 않은 시크릿 키입니다." },
        { status: 401 }
      );
    }

    // path가 지정된 경우 해당 경로만, 없으면 블로그 전체 재검증
    const pathToRevalidate = path ?? "/blog";
    revalidatePath(pathToRevalidate);

    return NextResponse.json({
      success: true,
      revalidated: pathToRevalidate,
      now: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "재검증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
