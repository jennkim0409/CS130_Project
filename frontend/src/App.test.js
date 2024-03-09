import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App Component Navigation Success', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        jest.spyOn(Storage.prototype, 'getItem');
        jest.spyOn(Storage.prototype, 'setItem');
    });

    it('should navigate to LoginSignup if not logged in', async () => {
        Storage.prototype.getItem.mockReturnValue(null); // Simulate logged out user
        render(<App />);
        const loginElement = await screen.findByText(/log-in to your account/i);
        expect(loginElement).toBeInTheDocument();
    });

    it('should redirect to Explore page when logged in', async () => {
        localStorage.setItem("user_token", '123456789');
        localStorage.setItem("user_id", 'thisisatest');
        render(<App />);
        const exploreElement = await screen.findByText(/quickly shuffle recommendations from your previous genre preferences!/i);
        expect(exploreElement).toBeInTheDocument();
    });

    it('should have access to Account page when logged in', async () => {
        localStorage.setItem("user_name", 'bob');
        render(<App testRouterProps={{ initialEntries: ['/account'] }} />);
        // should display user's name
        const accountElement = await screen.findByText(/welcome back,\s*bob\s*!/i);
        expect(accountElement).toBeInTheDocument();
    });

});

describe('App Component Navigation Failure', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        jest.spyOn(Storage.prototype, 'getItem');
        jest.spyOn(Storage.prototype, 'setItem');
    });

    it('should not navigate to LoginSignup if already logged in', async () => {
        localStorage.setItem("user_token", '123456789');
        localStorage.setItem("user_id", 'thisisatest');
        render(<App />);
        const loginElement = screen.queryByText(/log-in to your account/i);
        expect(loginElement).not.toBeInTheDocument();
    });

    it('should not redirect to Explore page when not logged in', async () => {
        Storage.prototype.getItem.mockReturnValue(null); // Simulate logged out user
        render(<App />);
        const exploreElement = screen.queryByText(/quickly shuffle recommendations from your previous genre preferences!/i);
        expect(exploreElement).not.toBeInTheDocument();
    });

    it('should not have access to Account page when not logged in', async () => {
        Storage.prototype.getItem.mockReturnValue(null); // Simulate logged out user
        render(<App testRouterProps={{ initialEntries: ['/account'] }} />);
        const accountElement = screen.queryByText(/welcome back,\s*bob\s*!/i);
        expect(accountElement).not.toBeInTheDocument();
    });

});