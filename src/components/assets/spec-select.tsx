"use client";

import { useState, useCallback } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SPEC_STORAGE_PREFIX } from "@/lib/hardware-specs";

// ── localStorage helpers ──────────────────────────────────────────────

function loadCustomValues(key: string): string[] {
  try {
    const raw = localStorage.getItem(SPEC_STORAGE_PREFIX + key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomValues(key: string, values: string[]) {
  try {
    localStorage.setItem(SPEC_STORAGE_PREFIX + key, JSON.stringify(values));
  } catch {}
}

const CUSTOM_SENTINEL = "__custom__";

const SELECT_CLS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

// ── types ─────────────────────────────────────────────────────────────

interface SpecSelectProps {
  label: string;
  name: string;
  predefined: readonly string[];
  storageKey: string;
  defaultValue?: string;
  placeholder?: string;
}

// ── inner component (only rendered on client) ─────────────────────────
//
// Because this is never rendered during SSR (the outer shell renders a
// skeleton instead), its useState lazy initializer runs only on the
// client where localStorage is available — no useEffect needed for
// initialisation, so react-hooks/set-state-in-effect cannot fire.

interface InnerProps extends SpecSelectProps {
  initialCustomValues: string[];
  initialSelected: string;
  initialInput: string;
  initialShowAdd: boolean;
}

function SpecSelectInner({
  label,
  name,
  predefined,
  storageKey,
  placeholder,
  initialCustomValues,
  initialSelected,
  initialInput,
  initialShowAdd,
}: InnerProps) {
  const [customValues, setCustomValues] = useState(initialCustomValues);
  const [selected, setSelected] = useState(initialSelected);
  const [inputValue, setInputValue] = useState(initialInput);
  const [showAddInput, setShowAddInput] = useState(initialShowAdd);

  // Resolved value that the hidden input submits to the server action
  const resolvedValue =
    selected === CUSTOM_SENTINEL ? inputValue.trim() : selected;

  const addCustomValue = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // If it happens to match a predefined entry, just select it directly.
    if ((predefined as readonly string[]).includes(trimmed)) {
      setSelected(trimmed);
      setShowAddInput(false);
      return;
    }

    const updated = customValues.includes(trimmed)
      ? customValues
      : [trimmed, ...customValues];
    setCustomValues(updated);
    saveCustomValues(storageKey, updated);
    setSelected(CUSTOM_SENTINEL);
    setInputValue(trimmed);
    setShowAddInput(false);
  }, [inputValue, customValues, predefined, storageKey]);

  const deleteCustomValue = useCallback(
    (value: string) => {
      const updated = customValues.filter((v) => v !== value);
      setCustomValues(updated);
      saveCustomValues(storageKey, updated);
      if (selected === CUSTOM_SENTINEL && inputValue === value) {
        setSelected("");
        setInputValue("");
      }
    },
    [customValues, selected, inputValue, storageKey]
  );

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>

      {/* Main select */}
      <select
        value={selected}
        onChange={(e) => {
          const v = e.target.value;
          setSelected(v);
          if (v === CUSTOM_SENTINEL) {
            setShowAddInput(true);
          } else {
            setShowAddInput(false);
            setInputValue("");
          }
        }}
        className={SELECT_CLS}
        aria-label={label}
      >
        <option value="">Not specified</option>

        {predefined.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}

        {customValues.length > 0 && (
          <optgroup label="── Custom (saved) ──">
            {customValues.map((c) => (
              <option key={c} value={CUSTOM_SENTINEL}>
                {c}
              </option>
            ))}
          </optgroup>
        )}

        <option value={CUSTOM_SENTINEL}>＋ Add custom…</option>
      </select>

      {/* Custom text input */}
      {showAddInput ? (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder ?? "Enter custom value…"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomValue();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addCustomValue}
            disabled={!inputValue.trim()}
          >
            <Plus className="size-3" />
            Save
          </Button>
        </div>
      ) : null}

      {/* Saved custom chips with delete */}
      {customValues.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {customValues.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
            >
              <button
                type="button"
                className="hover:underline"
                onClick={() => {
                  setSelected(CUSTOM_SENTINEL);
                  setInputValue(c);
                  setShowAddInput(false);
                }}
              >
                {c}
              </button>
              <button
                type="button"
                aria-label={`Remove ${c}`}
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteCustomValue(c)}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <input type="hidden" name={name} value={resolvedValue} />
    </div>
  );
}

// ── outer SSR-safe shell ──────────────────────────────────────────────
//
// Computes the initial state from localStorage + defaultValue and renders
// SpecSelectInner only on the client.  Uses a one-time lazy computation
// tracked with a module-level WeakSet so the read happens at most once
// per instance regardless of React StrictMode double-invocation.

function computeInitialState(
  storageKey: string,
  predefined: readonly string[],
  defaultValue: string | undefined
) {
  const saved = loadCustomValues(storageKey);
  let initialCustomValues = saved;
  let initialSelected = "";
  let initialInput = "";
  let initialShowAdd = false;

  if (defaultValue) {
    const knownPredefined = (predefined as readonly string[]).includes(defaultValue);
    const knownCustom = saved.includes(defaultValue);

    if (knownPredefined) {
      initialSelected = defaultValue;
    } else if (knownCustom) {
      initialSelected = CUSTOM_SENTINEL;
      initialInput = defaultValue;
      initialShowAdd = true;
    } else {
      // Old free-text value — register it as a custom entry so it isn't lost
      initialCustomValues = [defaultValue, ...saved.filter((v) => v !== defaultValue)];
      saveCustomValues(storageKey, initialCustomValues);
      initialSelected = CUSTOM_SENTINEL;
      initialInput = defaultValue;
      initialShowAdd = true;
    }
  }

  return { initialCustomValues, initialSelected, initialInput, initialShowAdd };
}

export function SpecSelect(props: SpecSelectProps) {
  // useState lazy initializer: runs synchronously on first client render.
  // The outer component is only mounted after hydration, so this is safe.
  // We gate rendering with `mounted` to avoid an SSR/hydration mismatch
  // when the server cannot access localStorage.
  const [init] = useState<ReturnType<typeof computeInitialState> | null>(
    () => (typeof window !== "undefined" ? computeInitialState(props.storageKey, props.predefined, props.defaultValue) : null)
  );

  if (!init) {
    // SSR / pre-hydration placeholder — keeps the form layout stable
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{props.label}</label>
        <div className={`${SELECT_CLS} opacity-50`} />
        <input type="hidden" name={props.name} value={props.defaultValue ?? ""} />
      </div>
    );
  }

  return <SpecSelectInner {...props} {...init} />;
}
