"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Paperclip,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [maxHeight, minHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface VercelV0ChatProps {
  onSend: (message: string) => void;
  onAttachContextFile?: (file: File) => void;
  heading?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  inputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  darkMode?: boolean;
}

export function VercelV0Chat({
  onSend,
  onAttachContextFile,
  heading = "What can I help you draft?",
  value,
  onValueChange,
  inputRef,
  darkMode = false,
}: VercelV0ChatProps) {
  const [internalValue, setInternalValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const inputValue = value ?? internalValue;

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, inputValue]);

  const setInputValue = (nextValue: string) => {
    if (onValueChange) {
      onValueChange(nextValue);
      return;
    }
    setInternalValue(nextValue);
  };

  const sendCurrentMessage = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue.trim());
    setInputValue("");
    adjustHeight(true);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachContextFile) {
      onAttachContextFile(file);
    }
    e.currentTarget.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrentMessage();
    }
  };

  return (
    <div className="w-full space-y-5">
      <p className="sr-only">{heading}</p>
      <div className="w-full">
        <div
          className={cn(
            "relative rounded-xl border shadow-[0_10px_30px_rgba(234,140,71,0.12)]",
            darkMode
              ? "border-[#5c4736] bg-gradient-to-br from-[#241d18] via-[#1f1915] to-[#181411]"
              : "border-[#ea8c47]/35 bg-gradient-to-br from-[#fffaf7] via-[#fff4ec] to-[#ffe9db]"
          )}
        >
          <div className="overflow-y-auto">
            <Textarea
              ref={(node) => {
                textareaRef.current = node;
                if (inputRef) {
                  inputRef.current = node;
                }
              }}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask the assistant to draft, improve, or summarize..."
              className={cn(
                "min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm",
                darkMode
                  ? "text-[#f5e9dd] placeholder:text-[#b69a84]"
                  : "text-[#3d2b1f] placeholder:text-[#a67d65]",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              style={{ overflow: "hidden" }}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                className={cn(
                  "group flex items-center gap-1 rounded-lg p-2 transition-colors",
                  darkMode ? "hover:bg-[#30261f]" : "hover:bg-[#f9dfcd]"
                )}
              >
                <Paperclip className={cn("h-4 w-4", darkMode ? "text-[#d9b99d]" : "text-[#6f4a37]")} />
                <span className={cn("hidden text-xs transition-opacity group-hover:inline", darkMode ? "text-[#c8a98d]" : "text-[#9a6f55]")}>
                  Add context file
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.csv"
                onChange={handleFilePicked}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={sendCurrentMessage}
                className={cn(
                  "flex items-center justify-between gap-1 rounded-lg border px-1.5 py-1.5 text-sm transition-colors",
                  inputValue.trim()
                    ? "border-[#ea8c47] bg-gradient-to-r from-[#ea8c47] to-[#f3b372] text-white hover:brightness-95"
                    : darkMode
                      ? "border-[#5c4736] bg-[#221b16] text-[#c19a7d] hover:border-[#7b5b42] hover:bg-[#2a211b]"
                      : "border-[#ddb49c] bg-[#fff7f1] text-[#b08a73] hover:border-[#d09a79] hover:bg-[#fff1e7]"
                )}
              >
                <ArrowUpIcon className={cn("h-4 w-4", inputValue.trim() ? "text-white" : darkMode ? "text-[#c19a7d]" : "text-[#b08a73]")} />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
