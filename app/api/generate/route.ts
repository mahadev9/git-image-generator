import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { prompt, images } = await req.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use Gemini 2.5 Flash Image model for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      systemInstruction: `You are a creative gift card designer and image enhancement specialist. Your role is to:

1. Create beautiful, festive gift card designs with vibrant colors and celebratory elements
2. Add decorative borders, ribbons, bows, and festive ornaments to images
3. Enhance images with gift-related themes like birthdays, holidays, celebrations, and special occasions
4. Suggest and implement creative layouts, typography, and color schemes
5. Personalize designs based on the user's input and uploaded images
6. Add festive elements such as confetti, sparkles, balloons, or seasonal decorations
7. Create warm, joyful, and celebratory atmospheres in the generated images

When generating images:
- Use bright, cheerful colors appropriate for celebrations
- Include gift-related elements like wrapped presents, ribbons, and bows
- Ensure high-quality, visually appealing compositions
- Add text or messages in elegant, readable fonts when requested
- Maintain a festive and joyful aesthetic
- Consider the occasion (birthday, holiday, thank you, etc.) and adjust the style accordingly

Be creative, festive, and helpful in transforming ordinary images into beautiful gift-worthy designs!`
    });

    let result;

    if (images && images.length > 0) {
      // If images are provided, include them in the prompt
      const imageParts = images.map((image: any) => ({
        inlineData: {
          data: image.data.split(",")[1], // Remove data:image/xxx;base64, prefix
          mimeType: image.mimeType,
        },
      }));

      result = await model.generateContent([prompt, ...imageParts]);
    } else {
      // Text-only generation
      result = await model.generateContent(prompt);
    }

    const response = await result.response;

    // Extract text and images from response
    const text = response.text();
    const generatedImages: string[] = [];

    // Check if response contains images
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            // Convert base64 image to data URL
            const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            generatedImages.push(dataUrl);
          }
        }
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
