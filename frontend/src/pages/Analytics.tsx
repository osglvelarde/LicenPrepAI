
import React from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

// Mock data for the heat map
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const generateHeatMapData = () => {
  const data: { day: string; hour: number; value: number; questions: number }[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      // Random intensity, higher during waking hours
      let intensity = Math.random();
      if (hour >= 8 && hour <= 22) {
        intensity *= 2;
      }
      intensity = Math.min(1, intensity);
      
      data.push({
        day: DAYS[day],
        hour,
        value: intensity,
        questions: Math.floor(intensity * 20)
      });
    }
  }
  
  return data;
};

const heatMapData = generateHeatMapData();

// Mock data for the timeline chart
const generateTimelineData = () => {
  const data: { date: string; correct: number; incorrect: number; total: number }[] = [];
  
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    const correct = Math.floor(Math.random() * 30) + 10;
    const incorrect = Math.floor(Math.random() * 15) + 5;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      correct,
      incorrect,
      total: correct + incorrect
    });
  }
  
  return data;
};

const timelineData = generateTimelineData();

const Analytics = () => {
  const { userStats } = useStore();
  
  // Color function for heat map
  const getColor = (value: number) => {
    // Emerald color scale from light to dark
    if (value < 0.1) return 'rgb(240, 253, 244)'; // emerald-50
    if (value < 0.2) return 'rgb(220, 252, 231)'; // emerald-100
    if (value < 0.3) return 'rgb(187, 247, 208)'; // emerald-200
    if (value < 0.4) return 'rgb(134, 239, 172)'; // emerald-300
    if (value < 0.5) return 'rgb(74, 222, 128)';  // emerald-400
    if (value < 0.6) return 'rgb(34, 197, 94)';   // emerald-500
    if (value < 0.7) return 'rgb(22, 163, 74)';   // emerald-600
    if (value < 0.8) return 'rgb(21, 128, 61)';   // emerald-700
    if (value < 0.9) return 'rgb(22, 101, 52)';   // emerald-800
    return 'rgb(6, 78, 59)';                      // emerald-900
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Badge variant="outline" className="flex gap-1 items-center">
          <span className="font-medium">Last updated:</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{userStats.questionsAnswered}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Accuracy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {Math.round((userStats.correctAnswers / userStats.questionsAnswered) * 100)}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {Math.round(userStats.timeSpent / 60)} hrs
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="animate-in">
        <TabsList>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Activity Heat Map</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex text-xs text-muted-foreground mb-1 px-10">
                {DAYS.map(day => (
                  <div key={day} className="flex-1 text-center font-medium">{day}</div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-rows-24 h-[480px]" style={{ gridTemplateRows: 'repeat(24, 1fr)' }}>
                  {Array.from({ length: 24 }).map((_, hourIndex) => (
                    <div key={hourIndex} className="flex items-center">
                      <div className="w-10 text-xs text-right pr-2 text-muted-foreground">
                        {hourIndex === 0 ? '12am' : hourIndex === 12 ? '12pm' : hourIndex > 12 ? `${hourIndex - 12}pm` : `${hourIndex}am`}
                      </div>
                      <div className="flex flex-1">
                        {DAYS.map((day) => {
                          const cell = heatMapData.find(d => d.day === day && d.hour === hourIndex);
                          return (
                            <TooltipProvider key={`${day}-${hourIndex}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex-1 h-5 m-[1px] p-0 rounded-sm"
                                    style={{ backgroundColor: getColor(cell?.value || 0) }}
                                  >
                                    <span className="sr-only">
                                      {day} at {hourIndex}:00 - {cell?.questions} questions
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">
                                    {day} at {hourIndex === 0 ? '12am' : hourIndex === 12 ? '12pm' : hourIndex > 12 ? `${hourIndex - 12}pm` : `${hourIndex}am`}
                                  </p>
                                  <p className="text-sm">{cell?.questions} questions answered</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-start items-center mt-4">
                <div className="text-xs text-muted-foreground mr-2">Less</div>
                <div className="flex">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((value) => (
                    <div
                      key={value}
                      className="w-6 h-4 rounded-sm"
                      style={{ backgroundColor: getColor(value) }}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground ml-2">More</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'calc(var(--radius) - 2px)',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Questions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="correct"
                      name="Correct Answers"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="incorrect"
                      name="Incorrect Answers"
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
