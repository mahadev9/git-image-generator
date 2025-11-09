import OpenAI, { toFile } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, images } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const enhancedPrompt = prompt;
    const imageModel = "gpt-image-1-mini";
    const imageCount = 1;
    const imageSize = "1024x1024";
    const imageQuality = "low";

    let generatedImages: string[] = [];
    let text = "";

    if (images && images.length > 0) {
      // Convert base64 images to File objects for images.edit
      const imageFiles = await Promise.all(
        images.map(async (image: any) => {
          // Remove data URL prefix if present
          const base64Data = image.data.includes(',')
            ? image.data.split(',')[1]
            : image.data;

          const imageBuffer = Buffer.from(base64Data, "base64");

          return await toFile(imageBuffer, "image.png", {
            type: image.mimeType || "image/png",
          });
        })
      );

      // Use images.edit when reference images are provided
      const imageResponse = await openai.images.edit({
        model: imageModel,
        image: imageFiles,
        prompt: enhancedPrompt,
        n: imageCount,
        size: imageSize,
        quality: imageQuality,
      });

      if (imageResponse.data && imageResponse.data[0]?.b64_json) {
        const imageBase64 = imageResponse.data[0].b64_json;
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        generatedImages.push(dataUrl);
      }
    } else {
      // generate image using gpt-image-1-mini when no reference images
      const imageResponse = await openai.images.generate({
        model: imageModel,
        prompt: enhancedPrompt,
        n: imageCount,
        size: imageSize,
        quality: imageQuality,
      });

      if (imageResponse.data && imageResponse.data[0]?.b64_json) {
        const imageBase64 = imageResponse.data[0].b64_json;
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        generatedImages.push(dataUrl);
      }
    }

    return NextResponse.json({
      text,
      images: generatedImages,
      hasImages: generatedImages.length > 0
    });

  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
