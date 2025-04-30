import React, { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  Flag,
  MoreVertical,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type ColumnId = "pending" | "approved" | "flagged";

const FacultyReview = () => {
  const { faculty, actions } = useStore();
  const { toast } = useToast();

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Same column and position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Get the item that was moved
    const sourceColumn = source.droppableId as ColumnId;
    const destinationColumn = destination.droppableId as ColumnId;
    const itemId = faculty[sourceColumn][source.index].id;

    // Move the item in the store
    actions.moveMCQToCategory(itemId, sourceColumn, destinationColumn);

    // Show notification
    toast({
      title: "Item moved",
      description: `Question moved to ${destinationColumn}`,
    });
  };

  const handleApproveAll = () => {
    faculty.pending.forEach((item) => {
      actions.moveMCQToCategory(item.id, "pending", "approved");
    });

    toast({
      title: "Batch action successful",
      description: `${faculty.pending.length} questions approved`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Faculty Review</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleApproveAll}>
            <Check className="mr-2 h-4 w-4" />
            Approve All
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export to CSV</DropdownMenuItem>
              <DropdownMenuItem>Send for expert review</DropdownMenuItem>
              <DropdownMenuItem>Archive all</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="px-3 py-1">
                Pending ({faculty.pending.length})
              </Badge>
            </div>
            <Droppable droppableId="pending">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "space-y-4 min-h-[300px] p-1",
                    snapshot.isDraggingOver && "bg-muted/50 rounded-lg"
                  )}
                >
                  {faculty.pending.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      columnId="pending"
                      onApprove={() =>
                        actions.moveMCQToCategory(
                          item.id,
                          "pending",
                          "approved"
                        )
                      }
                      onFlag={() =>
                        actions.moveMCQToCategory(item.id, "pending", "flagged")
                      }
                    />
                  ))}
                  {provided.placeholder}
                  {faculty.pending.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-sm text-muted-foreground">
                        <p>No pending items</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Approved Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="px-3 py-1">
                Approved ({faculty.approved.length})
              </Badge>
            </div>
            <Droppable droppableId="approved">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "space-y-4 min-h-[300px] p-1",
                    snapshot.isDraggingOver && "bg-muted/50 rounded-lg"
                  )}
                >
                  {faculty.approved.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      columnId="approved"
                      onApprove={() => {}}
                      onFlag={() =>
                        actions.moveMCQToCategory(
                          item.id,
                          "approved",
                          "flagged"
                        )
                      }
                    />
                  ))}
                  {provided.placeholder}
                  {faculty.approved.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-sm text-muted-foreground">
                        <p>No approved items</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Flagged Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="destructive" className="px-3 py-1">
                Flagged ({faculty.flagged.length})
              </Badge>
            </div>
            <Droppable droppableId="flagged">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "space-y-4 min-h-[300px] p-1",
                    snapshot.isDraggingOver && "bg-muted/50 rounded-lg"
                  )}
                >
                  {faculty.flagged.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      columnId="flagged"
                      onApprove={() =>
                        actions.moveMCQToCategory(
                          item.id,
                          "flagged",
                          "approved"
                        )
                      }
                      onFlag={() => {}}
                    />
                  ))}
                  {provided.placeholder}
                  {faculty.flagged.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-sm text-muted-foreground">
                        <p>No flagged items</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

type ItemCardProps = {
  item: any;
  index: number;
  columnId: ColumnId;
  onApprove: () => void;
  onFlag: () => void;
};

const ItemCard = ({
  item,
  index,
  columnId,
  onApprove,
  onFlag,
}: ItemCardProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Card
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={cn(
                "animate-in cursor-pointer",
                snapshot.isDragging && "shadow-lg",
                "transition hover:shadow-lg"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Question #{index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.difficulty}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-green-500 flex items-center">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            GPT-4 verified (2.8% hallucination risk)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 text-muted-foreground">
                  {item.stem}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 flex justify-end gap-2">
                {columnId !== "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove();
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {columnId !== "flagged" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFlag();
                    }}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Question Details
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Category: {item.category} | Difficulty: {item.difficulty}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="text-base">
                <strong>Stem:</strong> {item.stem}
              </div>

              <div className="space-y-2">
                {item.answers?.map((answer: any, idx: number) => (
                  <div key={answer.id} className="flex items-start gap-2">
                    <span
                      className={cn(
                        "font-semibold",
                        answer.id === item.correctAnswer
                          ? "text-green-600 underline"
                          : ""
                      )}
                    >
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{answer.text}</span>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                <strong>Explanation:</strong> {item.explanation}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Draggable>
  );
};

export default FacultyReview;
