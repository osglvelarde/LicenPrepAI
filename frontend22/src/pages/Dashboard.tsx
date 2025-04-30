import React from "react";
import { useStore } from "../lib/store";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { UploadCloud } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { textbooks, systemProgress, streak } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* System Progress Cards */}
        {systemProgress.slice(0, 6).map((system) => (
          <Card key={system.system} className="animate-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {system.system}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-2">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${system.progress * 2.51} ${
                      251 - system.progress * 2.51
                    }`}
                    strokeDashoffset="0"
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{system.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Streak Card */}
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Your Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="text-6xl font-bold">🔥</div>
            <Badge className="px-3 py-1 text-lg" variant="outline">
              {streak}-day streak
            </Badge>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Keep it up! Study every day to maintain your streak.
            </p>
          </CardFooter>
        </Card>

        {/* Upload First Textbook Card (conditional) */}
        {textbooks.length === 0 ? (
          <Card className="animate-in">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
              <UploadCloud className="h-16 w-16 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Upload your first textbook to start learning
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link to="/upload">Upload Textbook</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="animate-in">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {textbooks.map((textbook) => (
                  <li
                    key={textbook.id}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{textbook.title}</span>
                    <Badge
                      className={
                        textbook.status === "processed"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {textbook.status === "processing"
                        ? "Processing"
                        : textbook.status === "processed"
                        ? "Ready"
                        : "Failed"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link to="/upload">Upload More</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Latency & Token Footer */}
      <footer className="fixed bottom-0 right-0 p-4 hidden md:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-card text-card-foreground rounded-full px-3 py-1 text-xs shadow-sm">
                <span className="text-muted-foreground">
                  Latency: 124ms | Tokens: 287
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Last request performance metrics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>
    </div>
  );
};

export default Dashboard;
