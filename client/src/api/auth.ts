import validator from 'validator';

export const registerUser = async (email: string, password: string) => {
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
    }

    if (!validator.isLength(password, { min: 8 })) {
        throw new Error('Password must be at least 8 characters long');
    }

    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedPassword = validator.escape(password);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
};

export const loginUser = async (email: string, password: string) => {
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
    }

    if (!validator.isLength(password, { min: 8 })) {
        throw new Error('Password must be at least 8 characters long');
    }

    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedPassword = validator.escape(password);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
};
