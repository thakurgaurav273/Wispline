export interface TextFormatterResult {
    displayText: string;
    metadata?: any;
    cursorPosition?: number;
}


export interface ITextFormatter {
    name: string;
    priority: number; // Lower numbers execute first

    // Format text for display
    format(text: string, cursorPos?: number): TextFormatterResult;

    // Parse formatted text back to original
    parse(formattedText: string): TextFormatterResult;

    // Handle input events (optional)
    handleInput?(text: string, cursorPos: number): void;

    // Cleanup when formatter is destroyed
    cleanup?(): void;
}