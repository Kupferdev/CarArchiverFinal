/** Metnin yalnızca kelime başlangıçlarını Türkçe kurallarıyla büyütür. */
export const capitalizeWordStarts = (value: string): string =>
  value.replace(/(^|[^\p{L}])(\p{L})/gu, (_, prefix: string, letter: string) =>
    prefix + letter.toLocaleUpperCase("tr-TR")
  );

/** Metnin ilk ve cümle başlangıçlarındaki harfleri büyütür; geri kalanını değiştirmez. */
export const capitalizeSentenceStarts = (value: string): string =>
  value.replace(/(^\s*|[.!?]\s*|\n\s*)(\p{L})/gu, (_, prefix: string, letter: string) =>
    prefix + letter.toLocaleUpperCase("tr-TR")
  );
