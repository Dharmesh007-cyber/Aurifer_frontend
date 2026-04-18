"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Briefcase, ChevronDown, Home, Layers, Shirt, Smartphone } from "lucide-react";

function cn(...classes: Array<string | boolean | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useClickAway(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "outline" && "border border-neutral-700 bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

export interface DropdownCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const defaultCategories: DropdownCategory[] = [
  { id: "all", label: "All", icon: Layers, color: "#A06CD5" },
  { id: "lifestyle", label: "Lifestyle", icon: Shirt, color: "#FF6B6B" },
  { id: "desk", label: "Desk", icon: Briefcase, color: "#4ECDC4" },
  { id: "tech", label: "Tech", icon: Smartphone, color: "#45B7D1" },
  { id: "home", label: "Home", icon: Home, color: "#F9C74F" },
];

const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: {
  icon: React.ElementType;
  isHovered: boolean;
  color: string;
}) => (
  <motion.div className="relative mr-2 h-4 w-4" initial={false} animate={isHovered ? { scale: 1.2 } : { scale: 1 }}>
    <Icon className="h-4 w-4" />
    {isHovered && (
      <motion.div
        className="absolute inset-0"
        style={{ color }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </motion.div>
    )}
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren" as const,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface FluidDropdownProps {
  categories?: DropdownCategory[];
  value?: string;
  onChange?: (value: string) => void;
}

export function FluidDropdown({
  categories = defaultCategories,
  value,
  onChange,
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(categories[0]?.id ?? "");
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useClickAway(dropdownRef, () => setIsOpen(false));

  const selectedId = value ?? internalValue;
  const selectedCategory =
    categories.find((category) => category.id === selectedId) ?? categories[0];

  const handleSelect = (category: DropdownCategory) => {
    if (!value) {
      setInternalValue(category.id);
    }
    onChange?.(category.id);
    setIsOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full max-w-md" ref={dropdownRef}>
        <Button
          variant="outline"
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            "h-10 w-full justify-between border border-transparent bg-neutral-900 text-neutral-400",
            "transition-all duration-200 ease-in-out hover:bg-neutral-800 hover:text-neutral-200",
            "focus:border-neutral-700 focus:ring-2 focus:ring-neutral-700 focus:ring-offset-2 focus:ring-offset-black",
            isOpen && "bg-neutral-800 text-neutral-200"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">
            {selectedCategory && (
              <IconWrapper icon={selectedCategory.icon} isHovered={false} color={selectedCategory.color} />
            )}
            {selectedCategory?.label ?? "Select"}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-5 w-5 items-center justify-center"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 1, y: 0, height: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
                transition: { type: "spring", stiffness: 500, damping: 30, mass: 1 },
              }}
              exit={{
                opacity: 0,
                y: 0,
                height: 0,
                transition: { type: "spring", stiffness: 500, damping: 30, mass: 1 },
              }}
              className="absolute left-0 right-0 top-full z-50 mt-2"
            >
              <motion.div
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-1 shadow-lg"
                initial={{ borderRadius: 8 }}
                animate={{ borderRadius: 12, transition: { duration: 0.2 } }}
                style={{ transformOrigin: "top" }}
              >
                <motion.div className="relative py-2" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div
                    layoutId="hover-highlight"
                    className="absolute inset-x-1 rounded-md bg-neutral-800"
                    animate={{
                      y:
                        categories.findIndex((c) => (hoveredCategory || selectedCategory?.id) === c.id) * 40 +
                        (categories.findIndex((c) => (hoveredCategory || selectedCategory?.id) === c.id) > 0 ? 20 : 0),
                      height: 40,
                    }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                  {categories.map((category, index) => (
                    <React.Fragment key={category.id}>
                      {index === 1 && <motion.div className="mx-4 my-2.5 border-t border-neutral-700" variants={itemVariants} />}
                      <motion.button
                        type="button"
                        onClick={() => handleSelect(category)}
                        onHoverStart={() => setHoveredCategory(category.id)}
                        onHoverEnd={() => setHoveredCategory(null)}
                        className={cn(
                          "relative flex w-full items-center rounded-md px-4 py-2.5 text-sm transition-colors duration-150 focus:outline-none",
                          selectedCategory?.id === category.id || hoveredCategory === category.id
                            ? "text-neutral-200"
                            : "text-neutral-400"
                        )}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        <IconWrapper
                          icon={category.icon}
                          isHovered={hoveredCategory === category.id}
                          color={category.color}
                        />
                        {category.label}
                      </motion.button>
                    </React.Fragment>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
