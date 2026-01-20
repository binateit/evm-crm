"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { useToast } from "@/lib/contexts/toast-context";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setTimeout(() => setIsMounted(true), 100);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login failed", result.error || "Invalid credentials");
        return;
      }

      if (result?.ok) {
        toast.success("Login successful", "Redirecting to dashboard...");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-end p-4 md:p-8 lg:p-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-banner.jpg"
          alt="Digital handshake background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,20,50,0.7)] to-[rgba(0,10,30,0.5)] z-10" />
      </div>

      {/* Login Card */}
      <div
        className={cn(
          "relative z-20 w-full max-w-md flex flex-col gap-5 transition-opacity duration-500",
          isMounted ? "opacity-100" : "opacity-0"
        )}
      >
        <Card className="bg-[rgba(10,25,50,0.95)] border border-[rgba(100,150,200,0.2)] rounded-2xl backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <CardHeader className="flex flex-col items-center gap-2 p-8 pb-4 text-center">
            {/* Logo */}
            <div className="mb-1">
              <Image src="/Hundia_Logo.png" alt="Logo" width={64} height={64} priority />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white m-0 tracking-tight">Distributor Portal</h1>
            <p className="text-sm text-white/90 m-0 font-normal">
              Sign in to manage your orders and account
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="px-8 py-2 pb-4 flex flex-col space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-white text-sm font-medium block">
                  Username
                </label>
                <InputText
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  className={cn("w-full", errors.username && "p-invalid")}
                  {...register("username")}
                />
                {errors.username && (
                  <small className="text-red-400 block mt-1">{errors.username.message}</small>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm font-medium block">
                  Password
                </label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Password
                      inputId="password"
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      feedback={false}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      pt={{
                        input: {
                          className: errors.password ? "p-invalid" : "",
                        },
                      }}
                    />
                  )}
                />
                {errors.password && (
                  <small className="text-red-400 block mt-1">{errors.password.message}</small>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-8 py-4">
              {/* Login Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                label={isSubmitting ? "Logging in..." : "Login"}
                className="w-full bg-gradient-to-br from-[#6b9f5f] to-[#5a8a4f] hover:from-[#5a8a4f] hover:to-[#4a7a3f] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              />

              {/* Forgot Password Link */}
              <Button
                type="button"
                text
                label="Forgot password?"
                disabled={isSubmitting}
                className="text-white/80 hover:text-white !p-0 !h-auto text-sm underline-offset-4"
              />
            </CardFooter>
          </form>
        </Card>

        {/* Bottom Text */}
        <p className="mt-8 text-center text-sm text-white/80">
          Streamlining your supply chain, one order at a time.
        </p>
      </div>
    </main>
  );
}
