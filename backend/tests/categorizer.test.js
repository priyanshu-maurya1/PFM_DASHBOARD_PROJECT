import { categorizeTransaction } from '../utils/categorizer.js';

describe('Transaction Categorizer', () => {
  test('should categorize food transactions', () => {
    const transaction = {
      name: 'Starbucks Coffee',
      amount: 5.50,
      category: ['Food and Drink']
    };
    
    expect(categorizeTransaction(transaction)).toBe('Food and Drink');
  });

  test('should categorize transportation transactions', () => {
    const transaction = {
      name: 'Uber ride',
      amount: 15.00,
      category: ['Transportation']
    };
    
    expect(categorizeTransaction(transaction)).toBe('Transportation');
  });

  test('should detect income from negative amounts', () => {
    const transaction = {
      name: 'Salary deposit',
      amount: -2500.00,
      category: ['Deposit']
    };
    
    expect(categorizeTransaction(transaction)).toBe('Income');
  });

  test('should fallback to Other for unknown transactions', () => {
    const transaction = {
      name: 'Unknown merchant',
      amount: 25.00,
      category: []
    };
    
    expect(categorizeTransaction(transaction)).toBe('Other');
  });

  test('should use Plaid category when available', () => {
    const transaction = {
      name: 'Some store',
      amount: 50.00,
      category: ['Shops', 'Digital Purchase']
    };
    
    expect(categorizeTransaction(transaction)).toBe('Shopping');
  });
});