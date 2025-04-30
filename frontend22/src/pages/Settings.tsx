import React, { useState } from "react";
import { useStore } from "../lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { useToast } from "../components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  modelTier: z.string(),
  tokenBudget: z.number().min(100000).max(1000000),
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark", "system"]),
});

type FormValues = z.infer<typeof formSchema>;

const tokenCostMap = {
  "gpt-3.5-turbo": 0.0015, // per 1K tokens
  "gpt-4": 0.03, // per 1K tokens
  "claude-3-opus": 0.025, // per 1K tokens
  "gemini-pro": 0.0035, // per 1K tokens
};

const Settings = () => {
  const { settings, actions } = useStore();
  const { toast } = useToast();

  const [tokenBudget, setTokenBudget] = useState(settings.tokenBudget);
  const [modelTier, setModelTier] = useState(settings.modelTier);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      modelTier: settings.modelTier,
      tokenBudget: settings.tokenBudget,
      notifications: true,
      theme: settings.theme,
    },
  });

  const calculateMonthlyCost = () => {
    const modelCostPerToken =
      tokenCostMap[modelTier as keyof typeof tokenCostMap] || 0.01;
    return ((tokenBudget / 1000) * modelCostPerToken).toFixed(2);
  };

  const onSubmit = (data: FormValues) => {
    actions.updateSettings({
      modelTier: data.modelTier,
      tokenBudget: data.tokenBudget,
      theme: data.theme,
    });

    toast({
      title: "Settings updated",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Account Settings */}
          <Card className="animate-in">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Push Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications about your quiz results and new
                        content.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Preference</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how LicenPrep AI appears to you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card className="animate-in">
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>
                Configure the AI model and token usage for generating practice
                questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="modelTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setModelTier(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">
                          GPT-3.5 Turbo (Fast)
                        </SelectItem>
                        <SelectItem value="gpt-4">GPT-4 (Accurate)</SelectItem>
                        <SelectItem value="claude-3-opus">
                          Claude 3 Opus (Comprehensive)
                        </SelectItem>
                        <SelectItem value="gemini-pro">
                          Gemini Pro (Balanced)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select which AI model to use for generating and validating
                      quiz content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Monthly Token Budget: {field.value.toLocaleString()}{" "}
                      tokens
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={100000}
                        max={1000000}
                        step={50000}
                        defaultValue={[field.value]}
                        onValueChange={(values) => {
                          field.onChange(values[0]);
                          setTokenBudget(values[0]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated monthly cost: ${calculateMonthlyCost()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Higher token budgets allow for more question generation and
                validation. Your account will only be charged for tokens
                actually used.
              </p>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Settings;
