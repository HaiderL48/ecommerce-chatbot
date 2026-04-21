/**
 * Lightweight markdown → safe HTML converter.
 * Supports: **bold**, *italic*, line breaks, and URLs.
 */
export function parseMarkdown(text: string): string {
  if (!text) return "";

  return text
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // URLs: convert bare https?:// links to anchors
    .replace(
      /(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Line breaks
    .replace(/\n/g, "<br />");
}
