"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { PATIENT_ONBOARDING_QUESTIONS } from "@/lib/onboarding-data";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WelcomeFlow() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [isFinishing, setIsFinishing] = React.useState(false);

  const activeQuestion = PATIENT_ONBOARDING_QUESTIONS[currentIdx];
  const isLast = currentIdx === PATIENT_ONBOARDING_QUESTIONS.length - 1;

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: option }));
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentIdx((idx) => idx + 1);
    }
  };

  const handleComplete = () => {
    setIsFinishing(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1800);
  };

  return (
    <Card className="w-full max-w-xl overflow-hidden border border-ai/15 bg-white/90 backdrop-blur-md shadow-[var(--shadow-large)] ai-glow relative">
      <CardBody className="p-8 sm:p-10">
        <AnimatePresence mode="wait">
          {isFinishing ? (
            <motion.div
              key="finishing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center space-y-6"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-ai to-ai-light text-white shadow-lg shadow-ai/25 animate-bounce">
                <Sparkles className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-navy">
                  Personalization Complete!
                </h2>
                <p className="text-sm text-ink-soft max-w-sm">
                  Helix AI is tailoring your health insights. Redirecting you to your dashboard...
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* AI Avatar & Welcome */}
              {currentIdx === 0 && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-ai-soft/40 border border-ai/10">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ai to-ai-light text-white shadow-[0_4px_12px_rgba(147,51,234,0.15)]">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-navy flex items-center gap-1.5">
                      Helix AI <Sparkles className="h-3.5 w-3.5 text-ai" />
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Welcome! Let&apos;s personalize your healthcare experience.
                    </p>
                  </div>
                </div>
              )}

              {/* Question Header */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-ai">
                  Question {currentIdx + 1} of {PATIENT_ONBOARDING_QUESTIONS.length}
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-navy leading-tight">
                  {activeQuestion.question}
                </h2>
              </div>

              {/* Single Select Options */}
              <div className="grid gap-3 mt-6">
                {activeQuestion.options.map((option) => {
                  const isSelected = answers[activeQuestion.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "w-full px-5 py-4 text-left text-sm font-semibold rounded-xl border transition-all duration-200",
                        isSelected
                          ? "border-ai bg-ai-soft/10 text-ai shadow-[0_2px_8px_rgba(147,51,234,0.06)]"
                          : "border-border-soft bg-surface hover:border-ai/30 hover:bg-ai-soft/3 text-ink-soft hover:text-navy"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Footer Controls */}
              <div className="pt-6 border-t border-border-soft flex items-center justify-between mt-8">
                {/* Dots indicators */}
                <div className="flex gap-2">
                  {PATIENT_ONBOARDING_QUESTIONS.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all duration-300",
                        idx === currentIdx ? "w-4 bg-ai" : idx < currentIdx ? "bg-ai/40" : "bg-border-soft"
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNext}
                    className="text-ink-soft hover:text-navy text-sm font-semibold"
                  >
                    Skip
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    className="bg-ai hover:bg-ai-light border-transparent shadow-[0_4px_12px_rgba(147,51,234,0.15)] flex items-center gap-2 font-medium"
                  >
                    {isLast ? "Finish" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}
