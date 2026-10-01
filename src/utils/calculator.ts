export interface DoseResult {
  drops: number;
  frequency: string;
  recommendedProduct: string;
  advice: string;
}

export function calculateDose(
  weight: number = 60,
  ageCategory: 'adult' | 'child' = 'adult',
  purpose: 'stamina' | 'recovery' | 'chronic' = 'stamina'
): DoseResult {
  const validWeight = Math.max(5, Math.min(200, weight || 60));
  let drops = Math.round(validWeight / 10);
  let frequency = '2 kali sehari';
  let recommendedProduct = 'British Propolis Regular (Dewasa)';

  if (ageCategory === 'child') {
    drops = Math.min(drops, 4);
    frequency = '1-2 kali sehari';
    recommendedProduct = 'British Propolis Green Kids';
  }

  if (purpose === 'recovery') {
    drops += 2;
    frequency = '3 kali sehari (Pagi, Siang & Malam)';
  } else if (purpose === 'chronic') {
    drops += 1;
    frequency = '3 kali sehari secara bertahap';
  }

  const advice = ageCategory === 'child'
    ? 'Campurkan dengan 1/3 gelas air hangat kuku, atau teteskan pada madu / susu.'
    : 'Larutkan dalam 1/3 gelas air hangat kuku. Hindari penggunaan sendok logam.';

  return {
    drops,
    frequency,
    recommendedProduct,
    advice,
  };
}
