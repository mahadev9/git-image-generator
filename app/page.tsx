"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ImagePlus, Loader2, Bot, User, Gift, Download, X } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: ImageData[];
  timestamp: Date;
}

interface ImageData {
  data: string;
  mimeType: string;
  preview: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newImages.push({
          data: base64String,
          mimeType: file.type,
          preview: base64String,
        });

        if (newImages.length === files.length) {
          setSelectedImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `gift-image-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentImages = [...selectedImages];
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          images: currentImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response");
      }

      // Convert generated images to ImageData format if present
      const generatedImages: ImageData[] = data.images
        ? data.images.map((dataUrl: string) => ({
            data: dataUrl,
            mimeType: dataUrl.split(';')[0].split(':')[1],
            preview: dataUrl,
          }))
        : undefined;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
        images: generatedImages,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-red-50 via-amber-50 to-rose-50 dark:from-slate-950 dark:via-red-950 dark:to-slate-900 px-6">
      <Card className="w-full max-w-7xl h-screen flex flex-col shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 rounded-3xl">
        <CardHeader className="border-b bg-linear-to-r from-red-600 to-amber-600 text-white py-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Gift className="w-6 h-6" />
            </div>
            <div>Gift Image Generator</div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-16 animate-fade-in">
                  <div className="inline-flex p-6 bg-linear-to-br from-red-100 to-amber-100 dark:from-red-900/30 dark:to-amber-900/30 rounded-2xl mb-6">
                    <Gift className="w-20 h-20 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Welcome to Gift Image Generator
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Upload images and ask AI to create personalized gift card designs,
                    add festive elements, and generate creative suggestions
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                    <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      🎁 Create gift cards
                    </div>
                    <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-full text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      ✨ Add decorations
                    </div>
                    <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-full text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      🎨 Personalize designs
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-slide-up ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-md transition-all hover:shadow-lg ${
                      message.role === "user"
                        ? "bg-linear-to-br from-red-600 to-rose-600 text-white"
                        : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.images && message.images.length > 0 && (
                      <div className={`gap-3 mb-3 ${message.role === "assistant" ? "grid grid-cols-1" : "grid grid-cols-2"}`}>
                        {message.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative overflow-hidden rounded-xl cursor-pointer"
                            onClick={() => setEnlargedImage(img.preview)}
                          >
                            <img
                              src={img.preview}
                              alt={`${message.role === "assistant" ? "Generated" : "Uploaded"} ${idx + 1}`}
                              className={`rounded-xl border-2 border-white/50 dark:border-slate-600 w-full object-cover transition-transform group-hover:scale-105 ${
                                message.role === "assistant" ? "h-auto max-h-96" : "h-32"
                              }`}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(img.preview, idx);
                              }}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              title="Download image"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-white/70"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500 to-red-500 flex items-center justify-center shrink-0 shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-red-600 dark:text-red-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 space-y-4">
            {selectedImages.length > 0 && (
              <div className="flex gap-3 flex-wrap animate-fade-in">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Selected ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border-2 border-red-200 dark:border-red-700 shadow-md transition-transform group-hover:scale-105"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="shrink-0 h-12 w-12 rounded-xl border-2 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all dark:border-slate-600 dark:text-gray-100"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your images or describe what you'd like to know..."
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl border-2 focus-visible:ring-red-500 focus-visible:border-red-500 px-4 text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />

              <Button
                type="submit"
                disabled={
                  isLoading || (!input.trim() && selectedImages.length === 0)
                }
                className="shrink-0 h-12 px-6 rounded-xl bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-md hover:shadow-lg transition-all text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Image Lightbox Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(enlargedImage, 0);
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-all"
              title="Download"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              onClick={() => setEnlargedImage(null)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-all"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={enlargedImage}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
