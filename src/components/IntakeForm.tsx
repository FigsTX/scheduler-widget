"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";

/* ──────────────────── Visit Reason Options ──────────────────── */
const visitReasonOptions = [
  "Annual Checkup",
  "Sick Visit",
  "Follow-up",
  "New Patient",
  "Specialist Referral",
  "Prescription Refill",
  "Lab Work",
  "Other",
] as const;

const policyholderRelationshipOptions = ["Self", "Spouse", "Child", "Other"] as const;

/* ──────────────────── Zod Schema ──────────────────── */
const intakeSchema = z
  .object({
    // Patient info (existing)
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

    // Reason for visit
    visitReason: z.string().min(1, "Reason for visit is required"),
    visitDetails: z.string().max(500, "Maximum 500 characters").optional(),

    // Insurance
    selfPay: z.boolean(),
    insuranceProvider: z.string().optional(),
    memberId: z.string().optional(),
    groupNumber: z.string().optional(),
    policyholderRelationship: z.string().optional(),
    policyholderName: z.string().optional(),
    policyholderDob: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.selfPay) {
      if (!data.insuranceProvider || data.insuranceProvider.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Insurance provider is required",
          path: ["insuranceProvider"],
        });
      }
      if (!data.memberId || data.memberId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Member ID is required",
          path: ["memberId"],
        });
      }
      if (!data.policyholderRelationship || data.policyholderRelationship.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Policyholder relationship is required",
          path: ["policyholderRelationship"],
        });
      }
      if (
        data.policyholderRelationship &&
        data.policyholderRelationship !== "Self"
      ) {
        if (!data.policyholderName || data.policyholderName.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Policyholder name is required",
            path: ["policyholderName"],
          });
        }
        if (!data.policyholderDob || data.policyholderDob.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Policyholder date of birth is required",
            path: ["policyholderDob"],
          });
        }
      }
    }
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      selfPay: false,
    },
  });

  const isSelfPay = watch("selfPay");
  const policyholderRelationship = watch("policyholderRelationship");

  return (
    <Card className="p-6 rounded-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
        {/* ───────── Patient Information ───────── */}
        <h3 className="text-base font-semibold text-foreground mb-5">
          Patient Information
        </h3>

        <div className="space-y-5">
          {/* Name rows */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-start">
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
        </div>

        {/* ───────── Reason for Visit ───────── */}
        <div className="border-t border-border pt-5 mt-5">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Reason for Visit
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="visitReason" className="text-sm font-medium">
                Visit Type <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val) =>
                  setValue("visitReason", val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="visitReason" className="mt-1.5 rounded-xl">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {visitReasonOptions.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visitReason && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.visitReason.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="visitDetails"
                className="text-xs text-muted-foreground"
              >
                Additional details (optional)
              </Label>
              <Textarea
                id="visitDetails"
                placeholder="Describe your symptoms or reason for visit..."
                className="mt-1.5 rounded-xl resize-none"
                maxLength={500}
                {...register("visitDetails")}
              />
              {errors.visitDetails && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.visitDetails.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ───────── Insurance Information ───────── */}
        <div className="border-t border-border pt-5 mt-5">
          <h3 className="text-base font-semibold text-foreground mb-5">
            Insurance Information
          </h3>

          <div className="space-y-4">
            {/* Self-pay toggle */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="selfPay"
                checked={isSelfPay}
                onCheckedChange={(checked) =>
                  setValue("selfPay", checked === true, { shouldValidate: true })
                }
              />
              <Label htmlFor="selfPay" className="text-sm font-medium cursor-pointer">
                I will be paying out-of-pocket (self-pay)
              </Label>
            </div>

            {/* Insurance fields — hidden when self-pay */}
            {!isSelfPay && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="insuranceProvider" className="text-sm font-medium">
                      Insurance Provider <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="insuranceProvider"
                      placeholder="e.g. Blue Cross Blue Shield"
                      className="mt-1.5 rounded-xl"
                      {...register("insuranceProvider")}
                    />
                    {errors.insuranceProvider && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.insuranceProvider.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="memberId" className="text-sm font-medium">
                      Member ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="memberId"
                      placeholder="Subscriber / Member ID"
                      className="mt-1.5 rounded-xl"
                      {...register("memberId")}
                    />
                    {errors.memberId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.memberId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="groupNumber"
                      className="text-xs text-muted-foreground"
                    >
                      Group Number (optional)
                    </Label>
                    <Input
                      id="groupNumber"
                      placeholder="Group #"
                      className="mt-1.5 rounded-xl text-sm"
                      {...register("groupNumber")}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="policyholderRelationship"
                      className="text-sm font-medium"
                    >
                      Policyholder Relationship{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("policyholderRelationship", val, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        id="policyholderRelationship"
                        className="mt-1.5 rounded-xl"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {policyholderRelationshipOptions.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.policyholderRelationship && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.policyholderRelationship.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Policyholder details — only when relationship ≠ Self */}
                {policyholderRelationship &&
                  policyholderRelationship !== "Self" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="policyholderName"
                          className="text-sm font-medium"
                        >
                          Policyholder Name{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="policyholderName"
                          placeholder="Full name"
                          className="mt-1.5 rounded-xl"
                          {...register("policyholderName")}
                        />
                        {errors.policyholderName && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.policyholderName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="policyholderDob"
                          className="text-sm font-medium"
                        >
                          Policyholder DOB{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="policyholderDob"
                          type="date"
                          className="mt-1.5 rounded-xl"
                          {...register("policyholderDob")}
                        />
                        {errors.policyholderDob && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.policyholderDob.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ───────── Submit ───────── */}
        <div className="pt-5 mt-5">
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
        </div>
      </form>
    </Card>
  );
}
