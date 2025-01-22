export function filterWhisperOutput(transcription: string): string {
  const lines = transcription.split("\n");

  // Filter out timestamp lines and empty lines
  const textOnly = lines
    .filter((line) => {
      if (!line.trim()) return false;

      if (line.trim().startsWith("[")) {
        const textAfterTimestamp = line.split("]").pop()?.trim();

        return textAfterTimestamp ? true : false;
      }
      return true;
    })

    .map((line) => {
      if (line.includes("]")) {
        return line.split("]").pop()?.trim() || "";
      }
      return line.trim();
    })
    .join(" ");

  return textOnly;
}
