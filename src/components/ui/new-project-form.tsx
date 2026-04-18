"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, CircleCheck, ExternalLink } from "lucide-react";
import { useState } from "react";

const highlights = [
  {
    id: 1,
    feature: "Automated compliance checks",
  },
  {
    id: 2,
    feature: "Real-time collaboration features",
  },
  {
    id: 3,
    feature: "AI-powered document review",
  },
];

const plans = [
  {
    name: "Basic",
    features: [
      { feature: "Up to 5 active projects" },
      { feature: "Basic AI assistance" },
      { feature: "10GB cloud storage" },
      { feature: "Email support" },
    ],
    price: "$29",
    href: "#",
    isRecommended: false,
  },
  {
    name: "Professional",
    features: [
      { feature: "Unlimited projects" },
      { feature: "Advanced AI suite" },
      { feature: "50GB cloud storage" },
      { feature: "Priority support" },
      { feature: "Team collaboration" },
    ],
    price: "$79",
    href: "#",
    isRecommended: true,
  },
  {
    name: "Enterprise",
    features: [
      { feature: "Unlimited everything" },
      { feature: "Custom AI models" },
      { feature: "500GB cloud storage" },
      { feature: "Dedicated account manager" },
      { feature: "White-labeling options" },
    ],
    price: "$199",
    href: "#",
    isRecommended: false,
  },
];

interface NewProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectForm({ open, onOpenChange }: NewProjectFormProps) {
  const WORD_LIMITS = {
    projectName: 30,
    clientName: 20,
    projectContext: 100,
    description: 200,
  } as const;

  const [selected, setSelected] = useState(plans[0]);
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    projectContext: "",
    description: "",
    organization: "",
    region: "iad1",
  });
  const [wordLimitAlertsShown, setWordLimitAlertsShown] = useState<Record<string, boolean>>({});

  const countWords = (value: string) =>
    value.trim() ? value.trim().split(/\s+/).length : 0;

  const limitWords = (value: string, limit: number) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length <= limit) return value;
    return words.slice(0, limit).join(" ");
  };

  const handleLimitedFieldChange = (
    field: "projectName" | "clientName" | "projectContext" | "description",
    value: string
  ) => {
    const limit = WORD_LIMITS[field];
    const words = countWords(value);
    const reachedLimit = words >= limit;
    const exceeded = words > limit;

    if (reachedLimit && !wordLimitAlertsShown[field]) {
      window.alert(`You have reached the word limit for ${field}. Max allowed is ${limit} words.`);
      setWordLimitAlertsShown((prev) => ({ ...prev, [field]: true }));
    }

    if (!reachedLimit && wordLimitAlertsShown[field]) {
      setWordLimitAlertsShown((prev) => ({ ...prev, [field]: false }));
    }

    setFormData((prev) => ({
      ...prev,
      [field]: exceeded ? limitWords(value, limit) : value,
    }));
  };

  const isFieldAtLimit = (field: "projectName" | "clientName" | "projectContext" | "description") =>
    countWords(formData[field]) >= WORD_LIMITS[field];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", { ...formData, plan: selected.name });
    onOpenChange(false);
    // Reset form
    setFormData({
      projectName: "",
      clientName: "",
      projectContext: "",
      description: "",
      organization: "",
      region: "iad1",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Legal Project
          </DialogTitle>
          <DialogDescription>
            Fill in the project details below to get started with your new legal matter.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-7">
              <div className="space-y-4 md:space-y-6">
                {/* Project Name & Client */}
                <div className="md:flex md:items-center md:space-x-4">
                  <div className="md:w-1/2">
                    <Label htmlFor="projectName" className="font-medium">
                      Project Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      className={cn(
                        "mt-2",
                        isFieldAtLimit("projectName") &&
                          "border-red-500 bg-red-50 focus-visible:ring-red-500"
                      )}
                      placeholder="e.g., FY2025 GST Returns"
                      value={formData.projectName}
                      onChange={(e) => handleLimitedFieldChange("projectName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4 md:mt-0 md:w-1/2">
                    <Label htmlFor="clientName" className="font-medium">
                      Client Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      className={cn(
                        "mt-2",
                        isFieldAtLimit("clientName") &&
                          "border-red-500 bg-red-50 focus-visible:ring-red-500"
                      )}
                      placeholder="e.g., Meridian Corp Ltd."
                      value={formData.clientName}
                      onChange={(e) => handleLimitedFieldChange("clientName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="projectContext" className="font-medium">
                    Project Context<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="projectContext"
                    name="projectContext"
                    className={cn(
                      "mt-2",
                      isFieldAtLimit("projectContext") &&
                        "border-red-500 bg-red-50 focus-visible:ring-red-500"
                    )}
                    placeholder="Add project background, timeline, goal, and constraints..."
                    value={formData.projectContext}
                    onChange={(e) => handleLimitedFieldChange("projectContext", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {/* Organization */}
                <div>
                  <Label htmlFor="organization" className="font-medium">
                    Organization
                  </Label>
                    <Select
                      value={formData.organization}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          organization: value ?? "",
                        })
                      }
                    >
                    <SelectTrigger id="organization" className="mt-2 w-full">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Momentext Legal</SelectItem>
                      <SelectItem value="2">Tax Advisory Division</SelectItem>
                      <SelectItem value="3">Compliance Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region */}
                <div>
                  <Label htmlFor="region" className="font-medium">
                    Region
                  </Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          region: value ?? "",
                        })
                      }
                    >
                    <SelectTrigger id="region" className="mt-2">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fra1">
                        eu-central-1 (Frankfurt, Germany)
                      </SelectItem>
                      <SelectItem value="iad1">
                        us-east-1 (Washington, D.C., USA)
                      </SelectItem>
                      <SelectItem value="lhr1">
                        eu-west-2 (London, United Kingdom)
                      </SelectItem>
                      <SelectItem value="sfo1">
                        us-west-1 (San Francisco, USA)
                      </SelectItem>
                      <SelectItem value="sin1">
                        ap-southeast-1 (Singapore)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For best performance, choose a region closest to your
                    operations
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="font-medium">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className={cn(
                      "mt-2",
                      isFieldAtLimit("description") &&
                        "border-red-500 bg-red-50 focus-visible:ring-red-500"
                    )}
                    placeholder="Brief description of the project scope and objectives..."
                    value={formData.description}
                    onChange={(e) => handleLimitedFieldChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Plan Selection */}
              <h4 className="mt-14 font-medium">
                Plan type<span className="text-red-500">*</span>
              </h4>
              <RadioGroup
                value={selected.name}
                onValueChange={(value) =>
                  setSelected(
                    plans.find((plan) => plan.name === value) || plans[0]
                  )
                }
                className="mt-4 space-y-4"
              >
                {plans.map((plan) => (
                  <label
                    key={plan.name}
                    htmlFor={plan.name}
                    className={cn(
                      "relative block cursor-pointer rounded-md border bg-background transition",
                      selected.name === plan.name
                        ? "border-primary/20 ring-2 ring-primary/20"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start space-x-4 px-6 py-4">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                        <RadioGroupItem value={plan.name} id={plan.name} />
                      </div>
                      <div className="w-full">
                        <p className="leading-6">
                          <span className="font-semibold text-foreground">
                            {plan.name}
                          </span>
                          {plan.isRecommended && (
                            <Badge variant="secondary" className="ml-2">
                              recommended
                            </Badge>
                          )}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden={true}
                              />
                              {feature.feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-b-md border-t border-border bg-muted px-6 py-3">
                      <a
                        href={plan.href}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline hover:underline-offset-4"
                      >
                        Learn more
                        <ExternalLink className="h-4 w-4" aria-hidden={true} />
                      </a>
                      <div>
                        <span className="text-lg font-semibold text-foreground">
                          {plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Right Column - Info Card */}
            <div className="lg:col-span-5">
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold text-foreground">
                    Choose the right plan for your legal team
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Our flexible plans are designed to scale with your team&apos;s
                    needs. All plans include core legal AI features with varying
                    levels of storage and support.
                  </p>
                  <ul className="mt-4 space-y-1">
                    {highlights.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center space-x-2 py-1.5 text-foreground"
                      >
                        <CircleCheck className="h-5 w-5 text-primary" />
                        <span className="truncate text-sm">{item.feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className="mt-4 inline-flex items-center gap-1 text-sm text-primary"
                  >
                    Learn more
                    <ExternalLink className="h-4 w-4" aria-hidden={true} />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-10" />
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
