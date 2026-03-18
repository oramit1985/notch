export const truncateWithEllipsis = (text: string, maxLength: number = 45) => {
  return text.length > maxLength
      ? text.slice(0, maxLength) + '…'
      : text;
}