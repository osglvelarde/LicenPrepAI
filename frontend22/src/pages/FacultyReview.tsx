import React, { useState } from "react";
import { useStore } from "../lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { CheckCircle, Flag, MoreVertical, Check } from "lucide-react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "../lib/utils";
import { useToast } from "../components/ui/use-toast";

type ColumnId = "pending" | "approved" | "flagged";

const FacultyReview = () => {
  const { faculty, actions } = useStore();
  const { toast } = useToast();

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceColumn = source.droppableId as ColumnId;
    const destinationColumn = destination.droppableId as ColumnId;
    const itemId = faculty[sourceColumn][source.index].id;

    actions.moveMCQToCategory(itemId, sourceColumn, destinationColumn);

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
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn("animate-in", snapshot.isDragging && "shadow-lg")}
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
                <Badge variant="outline" className="text-xs">
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
            <CardDescription className="line-clamp-2">
              {item.stem}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0 flex justify-end gap-2">
            {columnId !== "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-500"
                onClick={onApprove}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {columnId !== "flagged" && (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-500"
                onClick={onFlag}
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </Draggable>
  );
};

export default FacultyReview;
