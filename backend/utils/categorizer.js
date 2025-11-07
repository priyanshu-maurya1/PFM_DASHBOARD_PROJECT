// Transaction categorization logic
const categoryMappings = {
  'Food and Drink': ['restaurant', 'cafe', 'starbucks', 'mcdonalds', 'pizza', 'food', 'grocery', 'supermarket'],
  'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking', 'metro', 'bus', 'taxi', 'United Airlines'],
  'Shopping': ['amazon', 'target', 'walmart', 'mall', 'store', 'shop', 'sparkfun'],
  'Entertainment': ['netflix', 'spotify', 'movie', 'theater', 'game', 'entertainment', 'climbing', 'playing'],
  'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'utility', 'bill','credit'],
  'Healthcare': ['pharmacy', 'doctor', 'hospital', 'medical', 'health'],
  'Income': ['salary', 'payroll', 'deposit', 'transfer'],
  'Other': []
};

export const categorizeTransaction = (transaction) => {
  const name = transaction.name.toLowerCase();
  const plaidCategory = transaction.category?.[0] || '';
  
  // First check Plaid's category
  if (plaidCategory) {
    if (plaidCategory.includes('Food') || plaidCategory.includes('Restaurant')) return 'Food and Drink';
    if (plaidCategory.includes('Transportation')) return 'Transportation';
    if (plaidCategory.includes('Shops')) return 'Shopping';
    if (plaidCategory.includes('Recreation')) return 'Entertainment';
    if (plaidCategory.includes('Service')) return 'Bills & Utilities';
    if (plaidCategory.includes('Healthcare')) return 'Healthcare';
    if (plaidCategory.includes('Deposit') || transaction.amount < 0) return 'Income';
  }
  
  // Fallback to merchant name matching
  for (const [category, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  // Income detection (negative amounts in Plaid are credits/income)
  if (transaction.amount < 0) return 'Income';
  
  return 'Other';
};