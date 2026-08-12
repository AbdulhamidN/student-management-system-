import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // <--- This import enables toBeInTheDocument()
import StudentList from './StudentList';

test('renders the Add Student button correctly', () => {
  render(<StudentList />);
  const buttonElement = screen.getByText(/Add Student/i);
  expect(buttonElement).toBeInTheDocument();
});
