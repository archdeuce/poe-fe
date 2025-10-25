export const reverseDate = (isoString: string) => {
  if (typeof isoString !== 'string') {
    return '';
  }

  const datePart = isoString.split('T')[0];

  if (!datePart) {
    return '';
  }

  const parts = datePart.split('-');

  if (parts.length !== 3) {
    return '';
  }

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};
