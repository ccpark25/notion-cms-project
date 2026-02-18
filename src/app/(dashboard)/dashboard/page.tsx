import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Activity, TrendingUp, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "대시보드",
};

// 데모 통계 데이터
const stats = [
  {
    title: "총 사용자",
    value: "1,234",
    change: "+12%",
    description: "전월 대비",
    icon: Users,
  },
  {
    title: "활성 세션",
    value: "89",
    change: "+4%",
    description: "현재 접속 중",
    icon: Activity,
  },
  {
    title: "월 매출",
    value: "₩4,590,000",
    change: "+19%",
    description: "전월 대비",
    icon: TrendingUp,
  },
  {
    title: "보안 알림",
    value: "0",
    change: "정상",
    description: "활성 위협 없음",
    icon: ShieldCheck,
  },
];

// 데모 사용자 데이터
const recentUsers = [
  { id: "1", name: "관리자", email: "admin@example.com", role: "admin", status: "활성" },
  { id: "2", name: "사용자", email: "user@example.com", role: "user", status: "활성" },
  { id: "3", name: "김철수", email: "kim@example.com", role: "user", status: "비활성" },
  { id: "4", name: "이영희", email: "lee@example.com", role: "user", status: "활성" },
  { id: "5", name: "박민준", email: "park@example.com", role: "user", status: "활성" },
];

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description={`안녕하세요, ${session?.user?.name ?? "사용자"}님! 오늘도 좋은 하루 되세요.`}
      />

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{stat.change}</span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 최근 사용자 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 사용자</CardTitle>
          <CardDescription>
            최근 가입한 사용자 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "관리자" : "일반"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "활성" ? "outline" : "secondary"}
                      className={user.status === "활성" ? "text-green-600 border-green-600" : ""}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
