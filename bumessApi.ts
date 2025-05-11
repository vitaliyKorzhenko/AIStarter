import axios from "axios";


const DEV_URL = 'https://dev.okk24.com';

const MAIN_URL =  'https://main.okk24.com';

const BASE_URL = MAIN_URL;

// Константы для авторизации
const ADMIN_EMAIL = 'app.dev.vitaliy.korzhenko@gmail.com';
const ADMIN_PASSWORD = '1234567';

interface TokenData {
    token: string;
    token_type: string;
    expires_in: number;
}

interface Credentials {
    email: string;
    password: string;
}

let currentToken: TokenData | null = null;
let credentials: Credentials | null = null;

export const setCredentials = (email: string, password: string): void => {
    credentials = { email, password };
};

export const getCurrentToken = (): TokenData | null => {
    return currentToken;
};

export const setCurrentToken = (token: TokenData): void => {
    currentToken = token;
};

export const clearToken = (): void => {
    currentToken = null;
};



export const loginToAdminPanel = async (
    email: string = ADMIN_EMAIL,
    password: string = ADMIN_PASSWORD
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> => {
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!data.token) {
            return {
                success: false,
                error: data.message || 'Login failed'
            };
        }

        setCurrentToken({
            token: data.token,
            token_type: data.token_type,
            expires_in: data.expires_in
        });
        setCredentials(ADMIN_EMAIL, ADMIN_PASSWORD);

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error during login:', error);
        return {
            success: false,
            error: 'Failed to connect to server'
        };
    }
};

                  

// https://main.okk24.com/bumess/api/task/get

//get Task

export const getTask = async (): Promise<any> => {
    try {
        const loginResponse = await loginToAdminPanel();
        if (!loginResponse.success) {
            return null;
        }   

        const token = getCurrentToken();
        if (!token) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/bumess/api/task/get`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
  
        if (!response) {
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export const triggerN8nWebhook = async (): Promise<any> => {
    try {
        const response = await fetch('https://govorikavitaliydev.app.n8n.cloud/webhook/chatMain', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error triggering n8n webhook:', error);
        return null;
    }
}


