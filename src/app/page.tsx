import Link from "next/link";
import { ArrowRight, Shield, Zap, Code2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// 주요 기능 목록
const features = [
  {
    icon: Shield,
    title: "인증 시스템",
    description: "NextAuth v5 기반의 안전한 인증. JWT 세션, Credentials Provider, 미들웨어 보호 라우트를 포함합니다.",
  },
  {
    icon: Zap,
    title: "빠른 개발",
    description: "React Hook Form + Zod 유효성 검사, Zustand 상태관리, shadcn/ui 컴포넌트로 즉시 개발을 시작하세요.",
  },
  {
    icon: Layers,
    title: "프로덕션 준비",
    description: "TypeScript 엄격 모드, TailwindCSS v4, 다크모드, 반응형 레이아웃이 모두 설정된 상태로 제공됩니다.",
  },
];

// 기술 스택 배지 목록
const techStack = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "TailwindCSS v4",
  "shadcn/ui",
  "NextAuth v5",
  "Zustand",
  "React Hook Form",
  "Zod",
  "Lucide React",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero 섹션 */}
        <section className="container mx-auto px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-4">
            <Code2 className="mr-1 h-3 w-3" />
            Next.js 15 스타터킷
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            프로덕션 준비가 완료된
            <br />
            <span className="text-primary">Next.js 스타터킷</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            반복적인 프로젝트 초기 설정 시간을 줄이세요. 인증, 상태관리, UI 컴포넌트,
            다크모드가 모두 설정된 상태로 바로 개발을 시작할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                무료로 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">로그인하기</Link>
            </Button>
          </div>
        </section>

        {/* 기능 카드 섹션 */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">주요 기능</h2>
            <p className="text-muted-foreground">
              개발에 필요한 모든 것이 준비되어 있습니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 기술 스택 섹션 */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">기술 스택</h2>
          <p className="text-muted-foreground mb-8">
            최신 기술로 구성된 견고한 기반
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-sm py-1 px-3">
                {tech}
              </Badge>
            ))}
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">지금 바로 시작하세요</CardTitle>
              <CardDescription>
                데모 계정으로 모든 기능을 체험해보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>관리자: admin@example.com / Admin1234</p>
                <p>일반: user@example.com / User1234</p>
              </div>
              <Button size="lg" asChild>
                <Link href="/login">
                  데모 체험하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
