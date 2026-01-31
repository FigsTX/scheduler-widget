"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";

const intakeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Valid ZIP code is required").max(10),
  phone: z
    .string()
    .min(10, "Valid phone number is required")
    .regex(/^[\d\s\-().+]+$/, "Invalid phone format"),
  email: z.string().email("Valid email is required"),
});

export type IntakeFormData = z.infer<typeof intakeSchema>;

interface IntakeFormProps {
  onSubmit: (data: IntakeFormData) => void;
}

export default function IntakeForm({ onSubmit }: IntakeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
  });

  return (
    <Card className="p-6 rounded-xl">
      <h3 className="text-base font-semibold text-foreground mb-5">
        Patient Information
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name rows — stacks into 2 rows on mobile, 4-col on sm+ */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-start">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="First"
              className="mt-1.5 rounded-xl"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Middle Name — secondary/smaller */}
          <div className="w-20 sm:w-24">
            <Label htmlFor="middleName" className="text-xs text-muted-foreground">
              Middle
            </Label>
            <Input
              id="middleName"
              placeholder="MI"
              className="mt-1.5 rounded-xl text-sm"
              {...register("middleName")}
            />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Last"
              className="mt-1.5 rounded-xl"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>

          {/* Suffix — secondary/smaller */}
          <div className="w-20">
            <Label htmlFor="suffix" className="text-xs text-muted-foreground">
              Suffix
            </Label>
            <Input
              id="suffix"
              placeholder="Jr."
              className="mt-1.5 rounded-xl text-sm"
              {...register("suffix")}
            />
          </div>
        </div>

        {/* DOB + Gender row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              className="mt-1.5 rounded-xl"
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(val) => setValue("gender", val, { shouldValidate: true })}>
              <SelectTrigger id="gender" className="mt-1.5 rounded-xl">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Address section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Address <span className="text-red-500">*</span>
          </Label>

          <Input
            placeholder="Street address"
            className="rounded-xl"
            {...register("street")}
          />
          {errors.street && (
            <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto_auto] gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Input
                placeholder="City"
                className="rounded-xl"
                {...register("city")}
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="State"
                className="rounded-xl"
                maxLength={2}
                {...register("state")}
              />
              {errors.state && (
                <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="ZIP"
                className="rounded-xl"
                {...register("zip")}
              />
              {errors.zip && (
                <p className="text-xs text-red-500 mt-1">{errors.zip.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="mt-1.5 rounded-xl"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="patient@email.com"
              className="mt-1.5 rounded-xl"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Confirm Appointment
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
