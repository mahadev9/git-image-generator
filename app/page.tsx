"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ImagePlus, Loader2, Gift } from "lucide-react";

// Types
import { Message, ImageData } from "./types";

// Utils
import {
  downloadImage,
  copyImageToClipboard,
  fileToImageData,
  scrollToBottom,
  focusInput,
} from "./utils";

// API Helpers
import {
  generateResponse,
  convertGeneratedImages,
  createMessage,
} from "./api-helpers";

// Components
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { MessageBubble } from "@/components/MessageBubble";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Toast } from "@/components/Toast";

export default function Home() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    scrollToBottom(scrollAreaRef);
  }, [messages]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if an image is already selected
    if (selectedImages.length > 0) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Convert file to ImageData
    const file = files[0];
    const imageData = await fileToImageData(file);
    setSelectedImages([imageData]);
  };

  const removeImage = () => {
    setSelectedImages([]);
  };

  const handleEditImage = (images: ImageData[]) => {
    setSelectedImages(images);
    focusInput();
  };

  const handleCopyImage = async (imageUrl: string) => {
    const success = await copyImageToClipboard(imageUrl);
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedImages.length === 0) return;

    // Create user message
    const userMessage = createMessage(
      "user",
      input,
      selectedImages.length > 0 ? [...selectedImages] : undefined
    );

    // Update UI state
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentImages = [...selectedImages];
    setSelectedImages([]);
    setIsLoading(true);

    try {
      // Call API
      const data = await generateResponse(input, currentImages);

      // Convert generated images
      const generatedImages = convertGeneratedImages(data.images);

      // Create assistant message
      const assistantMessage = createMessage(
        "assistant",
        data.text,
        generatedImages
      );

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);

      // Create error message
      const errorMessage = createMessage("assistant", `Error: ${error.message}`);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-red-50 via-green-50 to-emerald-50 dark:from-slate-950 dark:via-green-950 dark:to-slate-900 px-6">
      <Card className="w-full max-w-7xl h-screen flex flex-col shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 rounded-3xl">
        {/* Header */}
        <CardHeader className="border-b bg-linear-to-r from-red-600 to-green-700 text-white py-4 relative overflow-hidden">
          {/* Animated Confetti */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="confetti" />
            ))}
            {[...Array(4)].map((_, i) => (
              <div key={`j-${i}`} className="confetti-j">J</div>
            ))}
          </div>
          
          <CardTitle className="flex items-center gap-2 text-xl font-bold relative z-10">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm ring-2 ring-yellow-400/30">
              <Gift className="w-6 h-6" />
            </div>
            <div>Gift Box</div>
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 && <WelcomeScreen />}

              {messages.map((message, messageIndex) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  messageIndex={messageIndex}
                  isLatest={messageIndex === messages.length - 1}
                  copiedImage={copiedImage}
                  onEnlargeImage={setEnlargedImage}
                  onDownloadImage={downloadImage}
                  onEditImage={handleEditImage}
                  onCopyImage={handleCopyImage}
                />
              ))}

              {isLoading && <LoadingIndicator />}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 space-y-4">
            {/* Selected Image Preview */}
            {selectedImages.length > 0 && (
              <div className="flex gap-3 flex-wrap animate-fade-in">
                <div className="relative group">
                  <img
                    src={selectedImages[0].preview}
                    alt="Selected image"
                    className="w-24 h-24 object-cover rounded-xl border-2 border-red-200 dark:border-red-700 shadow-md transition-transform group-hover:scale-105"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="shrink-0 h-12 w-12 rounded-xl border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all dark:border-slate-600 dark:text-gray-100"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Create your perfect gift..."
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl border-2 focus-visible:ring-green-600 focus-visible:border-green-600 px-4 text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />

              <Button
                type="submit"
                disabled={
                  isLoading || (!input.trim() && selectedImages.length === 0)
                }
                className="shrink-0 h-12 px-6 rounded-xl bg-linear-to-r from-red-600 to-green-700 hover:from-red-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Gift className="w-5 h-5 text-white" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Notifications */}
      {enlargedImage && (
        <ImageLightbox
          imageUrl={enlargedImage}
          onClose={() => setEnlargedImage(null)}
          onDownload={downloadImage}
        />
      )}

      {showToast && (
        <Toast message="Only one image at a time. Please remove the current image first." />
      )}
    </div>
  );
}
