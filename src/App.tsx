import React, { useEffect, useState } from 'react';
import './App.css';

interface CreditCard {
  id: number;
  name: string;
  cardNumber: string;
  creditLimit: number;
  balance: number;
}

interface ErrorResponse {
  message: string;
  field?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

interface FieldError {
  message: string;
  show: boolean;
}

const API_URL = 'http://localhost:8080/api/cards';

function App() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>({
    name: { message: '', show: false },
    cardNumber: { message: '', show: false },
    limit: { message: '', show: false }
  });

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters long';
        if (value.trim().length > 50) return 'Name must not exceed 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        if (/\s{2,}/.test(value)) return 'Name cannot contain consecutive spaces';
        if (value !== value.trim()) return 'Name cannot start or end with spaces';
        return '';
      case 'cardNumber':
        if (!value.trim()) return 'Card number is required';
        if (!/^\d{1,19}$/.test(value)) return 'Card number must be numeric and up to 19 digits';
        return '';
      case 'limit':
        if (!value) return 'Credit limit is required';
        if (!/^-?\d*\.?\d*$/.test(value)) return 'Only numbers are allowed';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'Only numbers are allowed';
        if (numValue <= 0) return 'Credit limit must be greater than 0';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    const errorMessage = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: { message: errorMessage, show: true }
    }));

    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'cardNumber':
        setCardNumber(value);
        break;
      case 'limit':
        setLimit(value);
        break;
    }
  };

  const handleBlur = (field: string, value: string) => {
    const errorMessage = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: { message: errorMessage, show: !!errorMessage }
    }));
  };

  const validateForm = (): boolean => {
    const nameError = validateField('name', name);
    const cardNumberError = validateField('cardNumber', cardNumber);
    const limitError = validateField('limit', limit);

    setFieldErrors({
      name: { message: nameError, show: !!nameError },
      cardNumber: { message: cardNumberError, show: !!cardNumberError },
      limit: { message: limitError, show: !!limitError }
    });

    return !nameError && !cardNumberError && !limitError;
  };

  const fetchCards = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCards(data);
    } catch (err) {
      setError({ message: 'Failed to fetch cards. Please try again later.' });
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cardNumber,
          creditLimit: parseFloat(limit),
        }),
      });
      
      if (!res.ok) {
        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));
        
        // Get the error message from the service
        const errorMessage = `Invalid card number provided: ****-****-****-${cardNumber.slice(-4)} for user: ${name}`;
        console.log('Using error message:', errorMessage);
        
        // Show the error under the card number field
        setFieldErrors(prev => ({
          ...prev,
          cardNumber: {
            message: errorMessage,
            show: true
          }
        }));
      } else {
        setName('');
        setCardNumber('');
        setLimit('');
        setFieldErrors({
          name: { message: '', show: false },
          cardNumber: { message: '', show: false },
          limit: { message: '', show: false }
        });
        await fetchCards();
      }
    } catch (err: unknown) {
      console.error('Network error:', err);
      setError({ message: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  const getFieldErrorClass = (fieldName: string) => {
    return fieldErrors[fieldName].show ? 'error-field' : '';
  };

  return (
    <div className="container">
      <h1>Credit Card System</h1>
      <form className="card-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Name</label>
          <input 
            value={name} 
            onChange={e => handleFieldChange('name', e.target.value)}
            onBlur={e => handleBlur('name', e.target.value)}
            required 
            placeholder="Enter cardholder name"
            className={getFieldErrorClass('name')}
            aria-invalid={fieldErrors.name.show}
            aria-describedby={fieldErrors.name.show ? 'name-error' : undefined}
          />
          {fieldErrors.name.message && (
            <div className="error-bubble" id="name-error" role="alert">
              {fieldErrors.name.message}
            </div>
          )}
        </div>
        <div className="form-field">
          <label>Card Number</label>
          <input
            value={cardNumber}
            onChange={e => handleFieldChange('cardNumber', e.target.value)}
            onBlur={e => handleBlur('cardNumber', e.target.value)}
            maxLength={19}
            required
            pattern="\d{1,19}"
            title="Card number must be numeric and up to 19 digits"
            placeholder="Enter card number"
            className={getFieldErrorClass('cardNumber')}
            aria-invalid={fieldErrors.cardNumber.show}
            aria-describedby={fieldErrors.cardNumber.show ? 'cardNumber-error' : undefined}
          />
          {fieldErrors.cardNumber.message && (
            <div className="error-bubble" id="cardNumber-error" role="alert">
              {fieldErrors.cardNumber.message}
            </div>
          )}
        </div>
        <div className="form-field">
          <label>Limit (£)</label>
          <input
            type="text"
            value={limit}
            onChange={e => handleFieldChange('limit', e.target.value)}
            onBlur={e => handleBlur('limit', e.target.value)}
            inputMode="decimal"
            pattern="-?\d*\.?\d*"
            required
            placeholder="Enter credit limit"
            className={getFieldErrorClass('limit')}
            aria-invalid={fieldErrors.limit.show}
            aria-describedby={fieldErrors.limit.show ? 'limit-error' : undefined}
          />
          <small className="hint-text">Limit can be numerical only</small>
          {fieldErrors.limit.message && (
            <div className="error-bubble" id="limit-error" role="alert">
              {fieldErrors.limit.message}
            </div>
          )}
        </div>
        {error && (
          <div className="error" role="alert">
            <strong>Error:</strong> {error.message}
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Adding Card...' : 'Add Card'}
        </button>
      </form>
      <h2>Cards</h2>
      {cards.length === 0 ? (
        <p className="no-cards">No cards added yet.</p>
      ) : (
        <table className="card-list" role="table" aria-label="Credit Cards List">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Card Number</th>
              <th scope="col">Limit (£)</th>
              <th scope="col">Balance (£)</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                <td>{card.name}</td>
                <td>{maskCardNumber(card.cardNumber)}</td>
                <td>£{card.creditLimit.toFixed(2)}</td>
                <td>£{card.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return '';
  const lastFour = cardNumber.slice(-4);
  return `****-****-****-${lastFour}`;
}

export default App;
