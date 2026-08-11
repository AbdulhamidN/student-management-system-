const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-4 mt-8">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Student Management System. Built by Group 2 students.
            </div>
        </footer>
    );
};
export default Footer;
