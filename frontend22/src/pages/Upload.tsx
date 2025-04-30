import React, { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadCloud, FileType, X, Check, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadFile = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
};

const Upload = () => {
  const { textbooks, actions } = useStore();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((file) => {
        simulateUpload(file.id);
      });
    }
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "processing" } : f
          )
        );

        // Simulate processing delay
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "complete" } : f
            )
          );

          // Add to the store after "processing"
          const uploadedFile = files.find((f) => f.id === fileId);
          if (uploadedFile) {
            actions.addTextbook({
              id: uploadedFile.id,
              title: uploadedFile.file.name,
              pages: Math.floor(Math.random() * 500) + 100,
              uploadedAt: new Date().toISOString(),
              status: "processed",
              mimeType: uploadedFile.file.type,
              chapters: ["Chapter 1", "Chapter 2", "Chapter 3"],
            });
          }
        }, 2000);
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((file) => {
        simulateUpload(file.id);
      });
    }
  };

  const getStatusBadge = (status: UploadFile["status"], mimeType: string) => {
    switch (status) {
      case "uploading":
        return <Badge variant="outline">Uploading</Badge>;
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            Processing
          </Badge>
        );
      case "complete":
        return (
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Complete
            </Badge>
            {!mimeType.includes("pdf") && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                OCR Fallback
              </Badge>
            )}
          </div>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Upload Learning Materials
        </h1>
      </div>

      <Card
        className={cn(
          "border-2 border-dashed animate-in",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        )}
      >
        <CardContent
          className="flex flex-col items-center justify-center space-y-4 px-6 py-10"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <UploadCloud className="h-10 w-10 text-primary" />
            </div>
            <div className="flex flex-col space-y-1 text-center">
              <h3 className="font-semibold text-lg">Upload files</h3>
              <p className="text-sm text-muted-foreground pb-2 max-w-xs">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, PPT, PPTX, DOC, DOCX (max 100MB)
              </p>
            </div>
          </div>
          <Input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.ppt,.pptx,.doc,.docx"
          />
          <Button onClick={() => inputRef.current?.click()}>
            Select Files
          </Button>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      {file.file.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4" />
                        <span>
                          {file.file.type || "application/octet-stream"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                    </TableCell>
                    <TableCell>
                      {file.status === "uploading" ? (
                        <div className="w-full space-y-1">
                          <Progress value={file.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                      ) : (
                        getStatusBadge(file.status, file.file.type)
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        disabled={
                          file.status === "uploading" ||
                          file.status === "processing"
                        }
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {textbooks.length > 0 && (
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Processed Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {textbooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.pages}</TableCell>
                    <TableCell>
                      {new Date(book.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          book.status === "processed" ? "default" : "outline"
                        }
                      >
                        {book.status === "processing"
                          ? "Processing"
                          : book.status === "processed"
                          ? "Ready"
                          : "Failed"}
                      </Badge>
                      {!book.mimeType.includes("pdf") && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          OCR Fallback
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
