import { onMounted, onUnmounted } from "vue";
import { COMPUTER_NOTE_BY_CODE } from "@/constants/keyboard";

interface ComputerKeyboardHandlers {
  onNoteDown: (note: string) => void;
  onNoteUp: (note: string) => void;
  onSustain: (enabled: boolean) => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useComputerKeyboard(handlers: ComputerKeyboardHandlers): void {
  const downCodes = new Set<string>();

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      if (!event.repeat) {
        handlers.onSustain(true);
      }
      return;
    }

    const note = COMPUTER_NOTE_BY_CODE.get(event.code);
    if (!note || event.repeat || downCodes.has(event.code)) {
      return;
    }

    event.preventDefault();
    downCodes.add(event.code);
    handlers.onNoteDown(note);
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    if (event.code === "Space") {
      event.preventDefault();
      handlers.onSustain(false);
      return;
    }

    const note = COMPUTER_NOTE_BY_CODE.get(event.code);
    if (!note) {
      return;
    }

    downCodes.delete(event.code);
    handlers.onNoteUp(note);
  };

  const onBlur = (): void => {
    downCodes.clear();
    handlers.onSustain(false);
  };

  onMounted(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  });
}
