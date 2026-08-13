const Footer = ({ darkMode }) => {
  return (
    // Add dark:bg-gray-900 for a dark footer background
    // Add dark:text-white to make the text white in dark mode
    <footer className="border-t py-4 mt-8 dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto px-4 text-center text-sm">
        &copy; {new Date().getFullYear()} Student Management System. Built by Group 2 students.
      </div>
    </footer>
  );
}
export default Footer;