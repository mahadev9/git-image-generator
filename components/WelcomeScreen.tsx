import { Gift } from "lucide-react";

export const WelcomeScreen = () => (
  <div className="text-center text-muted-foreground py-16 animate-fade-in">
    <div className="inline-flex p-6 bg-linear-to-br from-red-100 to-green-100 dark:from-red-900/30 dark:to-green-900/30 rounded-2xl mb-6">
      <Gift className="w-20 h-20 text-red-600 dark:text-red-400" />
    </div>
    <p className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
      Welcome to Gift Box
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
      Upload images and ask AI to create personalized gifts, add festive
      elements, and generate creative suggestions
    </p>
    <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
      <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
        🎁 Create gift cards
      </div>
      <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-xs text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
        ✨ Add decorations
      </div>
      <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        🎨 Personalize gift boxes
      </div>
    </div>
  </div>
);
