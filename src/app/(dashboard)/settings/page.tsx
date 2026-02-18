"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Bell, Palette, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/common/PageHeader";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/auth";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme, mounted } = useTheme();
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      bio: "",
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      // 실제 프로젝트에서는 API 호출로 프로필 업데이트
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("프로필 저장", {
        description: `${values.name}님의 프로필이 업데이트되었습니다.`,
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="설정"
        description="계정 설정 및 환경 설정을 관리합니다."
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">프로필</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">알림</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">외관</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">보안</span>
          </TabsTrigger>
        </TabsList>

        {/* 프로필 탭 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>
                프로필 정보를 업데이트합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4 max-w-lg"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input placeholder="홍길동" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>자기소개</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="자신에 대해 간단히 소개해주세요."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>최대 200자까지 입력 가능합니다.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isProfileLoading}>
                    {isProfileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      "변경사항 저장"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 탭 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                수신할 알림 유형을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "email-notifications", label: "이메일 알림", description: "중요 업데이트를 이메일로 받습니다." },
                { id: "push-notifications", label: "푸시 알림", description: "브라우저 푸시 알림을 허용합니다." },
                { id: "marketing", label: "마케팅 알림", description: "새로운 기능 및 프로모션 정보를 받습니다." },
                { id: "security-alerts", label: "보안 알림", description: "로그인 이상 탐지 시 알림을 받습니다.", defaultChecked: true },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between space-x-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={item.id}>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch id={item.id} defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 외관 탭 */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>외관 설정</CardTitle>
              <CardDescription>
                화면 테마와 표시 방식을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">테마</Label>
                <div className="grid grid-cols-3 gap-3 max-w-sm">
                  {[
                    { value: "light", label: "라이트" },
                    { value: "dark", label: "다크" },
                    { value: "system", label: "시스템" },
                  ].map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => setTheme(themeOption.value)}
                      disabled={!mounted}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        mounted && resolvedTheme === themeOption.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{themeOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 탭 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>보안 설정</CardTitle>
              <CardDescription>
                계정 보안을 강화하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 비밀번호 변경 */}
              <div className="space-y-4 max-w-lg">
                <h3 className="text-sm font-medium">비밀번호 변경</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="current-password">현재 비밀번호</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="현재 비밀번호"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">새 비밀번호</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="새 비밀번호 (대문자, 숫자 포함 8자 이상)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => toast.info("데모 모드", { description: "이 스타터킷에서는 비밀번호 변경이 지원되지 않습니다." })}
                  >
                    비밀번호 변경
                  </Button>
                </div>
              </div>

              {/* 2단계 인증 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>2단계 인증 (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    로그인 시 추가 인증을 요구합니다.
                  </p>
                </div>
                <Switch
                  onCheckedChange={() =>
                    toast.info("데모 모드", {
                      description: "이 스타터킷에서는 2FA가 지원되지 않습니다.",
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
