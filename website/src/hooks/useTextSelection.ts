import { useState, useEffect, useCallback, RefObject } from 'react';

interface TextSelection {
  text: string;
  rect: DOMRect | null;
}

const useTextSelection = (targetRef: RefObject<HTMLElement>): TextSelection | null => {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const handleMouseUp = useCallback(() => {
    const currentSelection = window.getSelection();
    if (currentSelection && currentSelection.toString().length > 0) {
      const selectedText = currentSelection.toString();
      const range = currentSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({ text: selectedText, rect });
    } else {
      setSelection(null);
    }
  }, []);

  useEffect(() => {
    const currentRef = targetRef.current;
    if (currentRef) {
      currentRef.addEventListener('mouseup', handleMouseUp);
      // Clean up event listener when component unmounts or ref changes
      return () => {
        currentRef.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // Also handle clicks outside the selection to clear it
    document.addEventListener('mousedown', (event) => {
        if (selection && event.target instanceof HTMLElement && !event.target.closest('#selection-ask-button')) {
            setSelection(null);
        }
    });

  }, [targetRef, handleMouseUp, selection]);

  return selection;
};

export default useTextSelection;
